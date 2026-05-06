import base64
import io
import json
import os
from typing import Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image, ImageDraw, ImageFont
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
MODEL_ID = "gemini-3.1-flash-image-preview"

SAVED_PROMPTS_FILE = os.path.join(os.path.dirname(__file__), "..", "saved_prompts.json")

app = FastAPI(title="Photo Editor API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Helpers ───────────────────────────────────────────────────────────────────

def _b64_to_pil(b64: str) -> Image.Image:
    data = base64.b64decode(b64)
    return Image.open(io.BytesIO(data))

def _pil_to_b64(img: Image.Image) -> str:
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode()

def _call_model(prompt: str, image: Image.Image) -> tuple[Optional[str], str]:
    buf = io.BytesIO()
    image.save(buf, format="PNG")
    try:
        response = client.models.generate_content(
            model=MODEL_ID,
            contents=[
                prompt,
                types.Part.from_bytes(data=buf.getvalue(), mime_type="image/png"),
            ],
            config=types.GenerateContentConfig(
                response_modalities=["image", "text"],
            ),
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        return None, f"Gemini API error: {e}"
    for part in response.candidates[0].content.parts:
        if hasattr(part, "inline_data") and part.inline_data:
            result = Image.open(io.BytesIO(part.inline_data.data))
            return _pil_to_b64(result), "Done."
    return None, "No image returned — try rephrasing your prompt."

def _load_prompts() -> dict:
    if os.path.exists(SAVED_PROMPTS_FILE):
        with open(SAVED_PROMPTS_FILE) as f:
            return json.load(f)
    return {}

def _write_prompts(prompts: dict) -> None:
    with open(SAVED_PROMPTS_FILE, "w") as f:
        json.dump(prompts, f, indent=2)


# ── Request models ────────────────────────────────────────────────────────────

class ImageRequest(BaseModel):
    image: str  # base64

class EditRequest(ImageRequest):
    prompt: str

class DescriptionRequest(ImageRequest):
    description: str

class EnhanceRequest(ImageRequest):
    style: str

class AddTextRequest(ImageRequest):
    text: str
    position: str = "Bottom Center"
    font_size: int = 42
    text_color: str = "White"
    bg_opacity: int = 55

class CropRequest(ImageRequest):
    top: int = 0
    bottom: int = 0
    left: int = 0
    right: int = 0

class ClothingRequest(ImageRequest):
    item: str
    replacement: str

class PromptSave(BaseModel):
    name: str
    prompt: str


# ── Prompts ───────────────────────────────────────────────────────────────────

@app.get("/prompts")
def get_prompts():
    return _load_prompts()

@app.post("/prompts")
def save_prompt(body: PromptSave):
    prompts = _load_prompts()
    prompts[body.name.strip()] = body.prompt.strip()
    _write_prompts(prompts)
    return {"ok": True, "names": list(prompts.keys())}

@app.delete("/prompts/{name}")
def delete_prompt(name: str):
    prompts = _load_prompts()
    prompts.pop(name, None)
    _write_prompts(prompts)
    return {"ok": True, "names": list(prompts.keys())}


# ── Feature endpoints ─────────────────────────────────────────────────────────

@app.post("/edit")
def free_edit(body: EditRequest):
    img = _b64_to_pil(body.image)
    b64, status = _call_model(body.prompt, img)
    return {"image": b64, "status": status}

@app.post("/background")
def swap_background(body: DescriptionRequest):
    img = _b64_to_pil(body.image)
    prompt = (
        f"Remove the existing background from this product image and replace it with: "
        f"{body.description}. Keep the product pixel-perfect. Output a professional "
        f"product photo ready for an online shop."
    )
    b64, status = _call_model(prompt, img)
    return {"image": b64, "status": status}

@app.post("/lifestyle")
def add_lifestyle(body: DescriptionRequest):
    img = _b64_to_pil(body.image)
    prompt = (
        f"Place this product naturally into the following lifestyle scene: {body.description}. "
        "The product must be clearly visible and look like it belongs in the scene. "
        "Output a realistic, high-quality marketing photo."
    )
    b64, status = _call_model(prompt, img)
    return {"image": b64, "status": status}

ENHANCE_PROMPTS = {
    "Professional studio": (
        "Enhance this product image to look like a professional studio shot. "
        "Perfect lighting, sharp details, clean white or neutral background."
    ),
    "Bright & clean": (
        "Make this product image brighter, cleaner, and more vibrant. "
        "Remove noise or blur. Increase sharpness."
    ),
    "Luxury / premium": (
        "Retouch this product image to feel premium and luxurious. "
        "Elegant lighting, rich colours, high-end aesthetic."
    ),
    "Warm & natural": (
        "Enhance this product image with warm tones and soft natural lighting. "
        "Approachable, lifestyle-friendly feel."
    ),
}

@app.post("/enhance")
def enhance_image(body: EnhanceRequest):
    img = _b64_to_pil(body.image)
    prompt = ENHANCE_PROMPTS.get(body.style, f"Enhance this product image: {body.style}.")
    b64, status = _call_model(prompt, img)
    return {"image": b64, "status": status}

COLOR_MAP = {
    "White":  (255, 255, 255, 255),
    "Black":  (0,   0,   0,   255),
    "Red":    (220, 30,  30,  255),
    "Yellow": (255, 215, 0,   255),
    "Blue":   (20,  100, 220, 255),
}

@app.post("/add-text")
def add_text_overlay(body: AddTextRequest):
    img = _b64_to_pil(body.image).copy().convert("RGBA")
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    font = ImageFont.load_default()
    for font_path in [
        "/System/Library/Fonts/Helvetica.ttc",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    ]:
        try:
            font = ImageFont.truetype(font_path, body.font_size)
            break
        except OSError:
            pass

    bbox = draw.textbbox((0, 0), body.text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    pad = 12
    W, H = img.size
    pos_map = {
        "Top Left":      (pad, pad),
        "Top Center":    ((W - tw) // 2, pad),
        "Top Right":     (W - tw - pad, pad),
        "Center":        ((W - tw) // 2, (H - th) // 2),
        "Bottom Left":   (pad, H - th - pad * 2),
        "Bottom Center": ((W - tw) // 2, H - th - pad * 2),
        "Bottom Right":  (W - tw - pad, H - th - pad * 2),
    }
    x, y = pos_map.get(body.position, (pad, pad))
    alpha = int(body.bg_opacity * 2.55)
    draw.rectangle([x - pad, y - pad, x + tw + pad, y + th + pad], fill=(0, 0, 0, alpha))
    draw.text((x, y), body.text, font=font, fill=COLOR_MAP.get(body.text_color, (255, 255, 255, 255)))
    result = Image.alpha_composite(img, overlay).convert("RGB")
    return {"image": _pil_to_b64(result), "status": "Text overlay added."}

@app.post("/remove-text")
def remove_text_overlay(body: ImageRequest):
    img = _b64_to_pil(body.image)
    prompt = (
        "Remove all text, watermarks, logos, and overlays from this product image. "
        "Reconstruct the background cleanly where text was removed. "
        "Output a clean product image with no text or watermarks."
    )
    b64, status = _call_model(prompt, img)
    return {"image": b64, "status": status}

@app.post("/crop")
def crop_image(body: CropRequest):
    img = _b64_to_pil(body.image)
    w, h = img.size
    x0, y0 = max(0, body.left), max(0, body.top)
    x1 = max(x0 + 1, w - body.right)
    y1 = max(y0 + 1, h - body.bottom)
    result = img.crop((x0, y0, x1, y1))
    return {"image": _pil_to_b64(result), "status": f"Cropped to {x1-x0}x{y1-y0} px."}

@app.post("/replace-model")
def replace_model(body: DescriptionRequest):
    img = _b64_to_pil(body.image)
    prompt = (
        f"Replace the person/model in this image with a different person matching this description: "
        f"{body.description}. Keep all clothing, accessories, props, pose, and background exactly the same. "
        f"Only the person's face and body should change."
    )
    b64, status = _call_model(prompt, img)
    return {"image": b64, "status": status}

@app.post("/remove-prop")
def remove_prop(body: DescriptionRequest):
    img = _b64_to_pil(body.image)
    prompt = (
        f"Remove the following item from this image: {body.description}. "
        f"Fill in the space naturally so the result looks like it was never there. "
        f"Keep everything else — the model, outfit, and background — exactly the same."
    )
    b64, status = _call_model(prompt, img)
    return {"image": b64, "status": status}

@app.post("/change-clothing")
def change_clothing(body: ClothingRequest):
    img = _b64_to_pil(body.image)
    prompt = (
        f"Change the {body.item} worn by the model in this image to: {body.replacement}. "
        f"Keep the model's face, pose, all other clothing and accessories, and the background exactly the same. "
        f"The new garment should fit naturally and look realistic."
    )
    b64, status = _call_model(prompt, img)
    return {"image": b64, "status": status}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
