import os
import io
import json
from PIL import Image, ImageDraw, ImageFont
import gradio as gr
from google import genai
from dotenv import load_dotenv

load_dotenv()
client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

# Confirm exact model ID at: https://ai.google.dev/gemini-api/docs/models
# https://aistudio.google.com/prompts/new_chat
MODEL_ID = "gemini-3.1-flash-image-preview"


SAVED_PROMPTS_FILE = os.path.join(os.path.dirname(__file__), "saved_prompts.json")


def _load_saved_prompts() -> dict:
    if os.path.exists(SAVED_PROMPTS_FILE):
        with open(SAVED_PROMPTS_FILE) as f:
            return json.load(f)
    return {}


def _write_saved_prompts(prompts: dict):
    with open(SAVED_PROMPTS_FILE, "w") as f:
        json.dump(prompts, f, indent=2)


def save_prompt(name: str, prompt: str):
    if not name.strip():
        return "Enter a name for this prompt.", gr.update()
    if not prompt.strip():
        return "Nothing to save — prompt is empty.", gr.update()
    prompts = _load_saved_prompts()
    prompts[name.strip()] = prompt.strip()
    _write_saved_prompts(prompts)
    return f"Saved \"{name.strip()}\".", gr.update(choices=list(prompts.keys()))


def delete_prompt(name: str):
    prompts = _load_saved_prompts()
    if name in prompts:
        del prompts[name]
        _write_saved_prompts(prompts)
        return f"Deleted \"{name}\".", gr.update(choices=list(prompts.keys()), value=None)
    return "Prompt not found.", gr.update()


def load_prompt(name: str):
    if not name:
        return ""
    return _load_saved_prompts().get(name, "")


def _pil_to_bytes(img: Image.Image) -> bytes:
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def _bytes_to_pil(data: bytes) -> Image.Image:
    return Image.open(io.BytesIO(data))


def _call_model(prompt: str, image: Image.Image):
    from google.genai import types
    img_bytes = _pil_to_bytes(image)
    response = client.models.generate_content(
        model=MODEL_ID,
        contents=[
            prompt,
            types.Part.from_bytes(data=img_bytes, mime_type="image/png"),
        ],
    )
    for part in response.candidates[0].content.parts:
        if hasattr(part, "inline_data") and part.inline_data:
            return _bytes_to_pil(part.inline_data.data), "Done."
    return None, "No image returned — try rephrasing your prompt."


# ── Feature 1: Background swap ────────────────────────────────────────────────

def swap_background(image, background_desc: str):
    if image is None:
        return None, "Upload a product image first."
    if not background_desc.strip():
        return None, "Describe the new background."
    prompt = (
        f"Remove the existing background from this product image and replace it with: "
        f"{background_desc}. Keep the product pixel-perfect. Output a professional "
        f"product photo ready for an online shop."
    )
    return _call_model(prompt, image)


# ── Feature 2: Lifestyle context ──────────────────────────────────────────────

def add_lifestyle(image, scene_desc: str):
    if image is None:
        return None, "Upload a product image first."
    if not scene_desc.strip():
        return None, "Describe the lifestyle scene."
    prompt = (
        f"Place this product naturally into the following lifestyle scene: {scene_desc}. "
        "The product must be clearly visible and look like it belongs in the scene. "
        "Output a realistic, high-quality marketing photo."
    )
    return _call_model(prompt, image)


# ── Feature 3: Enhance / upscale ─────────────────────────────────────────────

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


def enhance_image(image, style: str):
    if image is None:
        return None, "Upload a product image first."
    prompt = ENHANCE_PROMPTS.get(style, f"Enhance this product image: {style}.")
    return _call_model(prompt, image)


# ── Feature 4a: Add text overlay (PIL — no API cost) ─────────────────────────

COLOR_MAP = {
    "White":  (255, 255, 255, 255),
    "Black":  (0,   0,   0,   255),
    "Red":    (220, 30,  30,  255),
    "Yellow": (255, 215, 0,   255),
    "Blue":   (20,  100, 220, 255),
}

POSITIONS = [
    "Top Left", "Top Center", "Top Right",
    "Center",
    "Bottom Left", "Bottom Center", "Bottom Right",
]


def add_text_overlay(image, text: str, position: str,
                     font_size: int, text_color: str, bg_opacity: int):
    if image is None:
        return None, "Upload a product image first."
    if not text.strip():
        return None, "Enter some text."

    img = image.copy().convert("RGBA")
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    # Try system font, fall back to default
    for font_path in [
        "/System/Library/Fonts/Helvetica.ttc",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    ]:
        try:
            font = ImageFont.truetype(font_path, font_size)
            break
        except OSError:
            font = ImageFont.load_default()

    bbox = draw.textbbox((0, 0), text, font=font)
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
    x, y = pos_map.get(position, (pad, pad))

    alpha = int(bg_opacity * 2.55)
    draw.rectangle([x - pad, y - pad, x + tw + pad, y + th + pad],
                   fill=(0, 0, 0, alpha))
    draw.text((x, y), text, font=font, fill=COLOR_MAP.get(text_color, (255, 255, 255, 255)))

    result = Image.alpha_composite(img, overlay).convert("RGB")
    return result, "Text overlay added."


# ── Feature 4b: Remove text / watermarks (AI) ────────────────────────────────

def remove_text_overlay(image):
    if image is None:
        return None, "Upload a product image first."
    prompt = (
        "Remove all text, watermarks, logos, and overlays from this product image. "
        "Reconstruct the background cleanly where text was removed. "
        "Output a clean product image with no text or watermarks."
    )
    return _call_model(prompt, image)


# ── Feature 4c: Crop / trim edges (PIL — no API cost) ────────────────────────

def crop_edges(image, top: int, bottom: int, left: int, right: int):
    if image is None:
        return None, "Upload an image first."
    w, h = image.size
    x0 = max(0, left)
    y0 = max(0, top)
    x1 = max(x0 + 1, w - right)
    y1 = max(y0 + 1, h - bottom)
    return image.crop((x0, y0, x1, y1)), f"Cropped to {x1 - x0}×{y1 - y0} px."


# ── Feature 5: Model / fashion editing ───────────────────────────────────────

def replace_model(image, model_desc: str):
    if image is None:
        return None, "Upload a photo first."
    if not model_desc.strip():
        return None, "Describe the replacement model."
    prompt = (
        f"Replace the person/model in this image with a different person matching this description: "
        f"{model_desc}. Keep all clothing, accessories, props, pose, and background exactly the same. "
        f"Only the person's face and body should change."
    )
    return _call_model(prompt, image)


def remove_prop(image, prop_desc: str):
    if image is None:
        return None, "Upload a photo first."
    if not prop_desc.strip():
        return None, "Describe the prop to remove."
    prompt = (
        f"Remove the following item from this image: {prop_desc}. "
        f"Fill in the space naturally so the result looks like it was never there. "
        f"Keep everything else — the model, outfit, and background — exactly the same."
    )
    return _call_model(prompt, image)


def change_clothing(image, clothing_item: str, new_desc: str):
    if image is None:
        return None, "Upload a photo first."
    if not clothing_item.strip() or not new_desc.strip():
        return None, "Specify both the item to change and the replacement."
    prompt = (
        f"Change the {clothing_item} worn by the model in this image to: {new_desc}. "
        f"Keep the model's face, pose, all other clothing and accessories, and the background exactly the same. "
        f"The new garment should fit naturally and look realistic."
    )
    return _call_model(prompt, image)


# ── Gradio UI ─────────────────────────────────────────────────────────────────

CSS = """
footer { display: none !important; }
.tab-nav button { font-size: 0.9rem; }
.tip-box { background: #1e1e2e; border-left: 3px solid #7c7cff;
           padding: 10px 14px; border-radius: 6px; font-size: 0.85rem; margin-top: 8px; }
"""

with gr.Blocks(title="Photo Editor", css=CSS) as app:
    gr.Markdown("""
# 🛍️ Photo Editor
AI-powered photo editing for product listings — swap backgrounds, enhance quality, edit models, and more.
""")

    with gr.Tabs():

        # ── Free Edit ──────────────────────────────────────────────────────────
        with gr.Tab("✏️ Free Edit"):
            gr.Markdown("Type any instruction and the AI will edit your image accordingly.")
            with gr.Row():
                with gr.Column(scale=2):
                    fe_img = gr.Image(type="pil", label="Upload Image")
                    fe_prompt = gr.Textbox(
                        label="Instruction",
                        placeholder="Describe what you want to change…",
                        lines=3,
                        info="Be specific — describe what to change, what to keep, and the desired style.",
                    )
                    gr.Examples(
                        examples=[
                            "Make the lighting look like golden hour sunset",
                            "Add a soft drop shadow beneath the product",
                            "Turn the background into a blurred bokeh effect",
                            "Remove the shadow under the product",
                            "Make the colours more vibrant and saturated",
                        ],
                        inputs=fe_prompt,
                        label="Example instructions",
                    )
                    with gr.Row():
                        fe_btn = gr.Button("Apply Edit", variant="primary", scale=3)
                        fe_cancel = gr.Button("Cancel", variant="stop", scale=1)

                with gr.Column(scale=2):
                    fe_out = gr.Image(type="pil", label="Result")
                    fe_status = gr.Textbox(label="Status", interactive=False, show_label=False)

                with gr.Column(scale=1):
                    gr.Markdown("### 🔖 Saved Prompts")
                    _initial_prompts = list(_load_saved_prompts().keys())
                    fe_saved = gr.Dropdown(
                        choices=_initial_prompts,
                        label="Your bookmarks",
                        interactive=True,
                    )
                    fe_load_btn = gr.Button("Load selected", variant="secondary")
                    gr.Markdown("---")
                    fe_save_name = gr.Textbox(label="Bookmark name", placeholder="e.g. sunset lighting")
                    fe_save_btn = gr.Button("Save current prompt", variant="secondary")
                    fe_del_btn = gr.Button("Delete selected", variant="stop")
                    fe_bm_status = gr.Textbox(interactive=False, show_label=False)

            fe_event = fe_btn.click(
                lambda img, prompt: (None, "Upload an image first.") if img is None
                    else (None, "Enter an instruction.") if not prompt.strip()
                    else _call_model(prompt, img),
                [fe_img, fe_prompt],
                [fe_out, fe_status],
            )
            fe_cancel.click(fn=None, cancels=[fe_event])
            fe_load_btn.click(load_prompt, [fe_saved], [fe_prompt])
            fe_save_btn.click(save_prompt, [fe_save_name, fe_prompt], [fe_bm_status, fe_saved])
            fe_del_btn.click(delete_prompt, [fe_saved], [fe_bm_status, fe_saved])

        # ── Background Swap ────────────────────────────────────────────────────
        with gr.Tab("🖼️ Background Swap"):
            gr.Markdown("Remove or replace the background while keeping your product pixel-perfect.")
            with gr.Row():
                with gr.Column():
                    bg_img = gr.Image(type="pil", label="Upload Product Image")
                    bg_desc = gr.Textbox(
                        label="New background",
                        placeholder="Describe the background you want…",
                        info="Be descriptive — lighting, surface, mood, and colours all help.",
                    )
                    gr.Examples(
                        examples=[
                            "Clean white studio background",
                            "Soft gradient from light grey to white",
                            "Cosy bedroom shelf, warm lighting",
                            "Outdoor park on a sunny day, shallow depth of field",
                            "Luxury dark marble surface",
                        ],
                        inputs=bg_desc,
                        label="Example backgrounds",
                    )
                    with gr.Row():
                        bg_btn = gr.Button("Swap Background", variant="primary", scale=3)
                        bg_cancel = gr.Button("Cancel", variant="stop", scale=1)
                with gr.Column():
                    bg_out = gr.Image(type="pil", label="Result")
                    bg_status = gr.Textbox(interactive=False, show_label=False)
            bg_event = bg_btn.click(swap_background, [bg_img, bg_desc], [bg_out, bg_status])
            bg_cancel.click(fn=None, cancels=[bg_event])

        # ── Lifestyle Context ──────────────────────────────────────────────────
        with gr.Tab("🌿 Lifestyle Scene"):
            gr.Markdown("Place your product into a realistic lifestyle setting for marketing photos.")
            with gr.Row():
                with gr.Column():
                    ls_img = gr.Image(type="pil", label="Upload Product Image")
                    ls_desc = gr.Textbox(
                        label="Scene description",
                        placeholder="Describe the scene and how the product is used…",
                        info="Include who is using it, where, and the overall mood.",
                    )
                    gr.Examples(
                        examples=[
                            "Woman drinking from the mug at a cosy café, warm lighting",
                            "Flat lay on a white marble surface with dried flowers",
                            "Man wearing it while hiking in a forest, golden hour",
                            "Product on a modern kitchen counter, clean and minimal",
                            "Close-up on a wooden table with a cup of coffee nearby",
                        ],
                        inputs=ls_desc,
                        label="Example scenes",
                    )
                    with gr.Row():
                        ls_btn = gr.Button("Generate Scene", variant="primary", scale=3)
                        ls_cancel = gr.Button("Cancel", variant="stop", scale=1)
                with gr.Column():
                    ls_out = gr.Image(type="pil", label="Result")
                    ls_status = gr.Textbox(interactive=False, show_label=False)
            ls_event = ls_btn.click(add_lifestyle, [ls_img, ls_desc], [ls_out, ls_status])
            ls_cancel.click(fn=None, cancels=[ls_event])

        # ── Enhance Image ──────────────────────────────────────────────────────
        with gr.Tab("✨ Enhance"):
            gr.Markdown("Retouch and upscale product photos to a professional standard.")
            with gr.Row():
                with gr.Column():
                    enh_img = gr.Image(type="pil", label="Upload Product Image")
                    enh_style = gr.Radio(
                        list(ENHANCE_PROMPTS.keys()),
                        label="Enhancement style",
                        value="Professional studio",
                        info="Choose the visual style that suits your brand.",
                    )
                    with gr.Row():
                        enh_btn = gr.Button("Enhance", variant="primary", scale=3)
                        enh_cancel = gr.Button("Cancel", variant="stop", scale=1)
                    with gr.Accordion("What does each style do?", open=False):
                        gr.Markdown("""
- **Professional studio** — sharp details, perfect lighting, clean neutral background
- **Bright & clean** — brighter, more vibrant, noise and blur removed
- **Luxury / premium** — elegant lighting, rich colours, high-end feel
- **Warm & natural** — warm tones, soft natural light, approachable look
""")
                with gr.Column():
                    enh_out = gr.Image(type="pil", label="Result")
                    enh_status = gr.Textbox(interactive=False, show_label=False)
            enh_event = enh_btn.click(enhance_image, [enh_img, enh_style], [enh_out, enh_status])
            enh_cancel.click(fn=None, cancels=[enh_event])

        # ── Text & Watermarks ──────────────────────────────────────────────────
        with gr.Tab("🔤 Text & Watermarks"):
            with gr.Tabs():

                with gr.Tab("Add Text"):
                    gr.Markdown("Overlay a text banner on your image — instant, no AI required.")
                    with gr.Row():
                        with gr.Column():
                            ta_img = gr.Image(type="pil", label="Upload Image")
                            ta_text = gr.Textbox(
                                label="Text",
                                placeholder="e.g. SALE 50% OFF",
                            )
                            gr.Examples(
                                examples=["SALE 50% OFF", "NEW ARRIVAL", "LIMITED EDITION", "FREE SHIPPING"],
                                inputs=ta_text,
                                label="Examples",
                            )
                            ta_pos = gr.Dropdown(POSITIONS, label="Position", value="Bottom Center")
                            ta_size = gr.Slider(12, 120, value=42, step=2, label="Font size (px)")
                            ta_color = gr.Radio(list(COLOR_MAP.keys()), label="Text colour", value="White")
                            ta_opacity = gr.Slider(0, 100, value=55, label="Background strip opacity %")
                            ta_btn = gr.Button("Add Text", variant="primary")
                        with gr.Column():
                            ta_out = gr.Image(type="pil", label="Result")
                            ta_status = gr.Textbox(interactive=False, show_label=False)
                    ta_btn.click(
                        add_text_overlay,
                        [ta_img, ta_text, ta_pos, ta_size, ta_color, ta_opacity],
                        [ta_out, ta_status],
                    )

                with gr.Tab("Remove Text / Watermarks"):
                    gr.Markdown("AI-powered removal of text, watermarks, and logos from any image.")
                    with gr.Row():
                        with gr.Column():
                            rm_img = gr.Image(type="pil", label="Upload Image")
                            gr.Markdown(
                                "<div class='tip-box'>Works best when text is overlaid on a consistent background. "
                                "For text printed on a complex scene it may not be fully removed.</div>"
                            )
                            with gr.Row():
                                rm_btn = gr.Button("Remove Text & Watermarks", variant="primary", scale=3)
                                rm_cancel = gr.Button("Cancel", variant="stop", scale=1)
                        with gr.Column():
                            rm_out = gr.Image(type="pil", label="Result")
                            rm_status = gr.Textbox(interactive=False, show_label=False)
                    rm_event = rm_btn.click(remove_text_overlay, [rm_img], [rm_out, rm_status])
                    rm_cancel.click(fn=None, cancels=[rm_event])

                with gr.Tab("Crop / Trim"):
                    gr.Markdown("Trim unwanted borders or banners from any edge — instant, no AI required.")
                    with gr.Row():
                        with gr.Column():
                            cr_img = gr.Image(type="pil", label="Upload Image")
                            cr_top    = gr.Slider(0, 1000, value=0, step=1, label="Crop from Top (px)")
                            cr_bottom = gr.Slider(0, 1000, value=0, step=1, label="Crop from Bottom (px)")
                            cr_left   = gr.Slider(0, 1000, value=0, step=1, label="Crop from Left (px)")
                            cr_right  = gr.Slider(0, 1000, value=0, step=1, label="Crop from Right (px)")
                            cr_btn = gr.Button("Crop", variant="primary")
                        with gr.Column():
                            cr_out = gr.Image(type="pil", label="Result")
                            cr_status = gr.Textbox(interactive=False, show_label=False)
                    cr_btn.click(crop_edges, [cr_img, cr_top, cr_bottom, cr_left, cr_right], [cr_out, cr_status])

        # ── Model Editing ──────────────────────────────────────────────────────
        with gr.Tab("👗 Model Editing"):
            with gr.Tabs():

                with gr.Tab("Replace Model"):
                    gr.Markdown("Swap the person in a photo while keeping all clothing, props, and background identical.")
                    with gr.Row():
                        with gr.Column():
                            rep_img = gr.Image(type="pil", label="Upload Photo")
                            rep_desc = gr.Textbox(
                                label="Describe the replacement person",
                                placeholder="e.g. East Asian woman, 20s, long black hair, smiling",
                                info="Describe face, ethnicity, age, hair — not clothing (use Change Clothing for that).",
                            )
                            gr.Examples(
                                examples=[
                                    "South Asian woman, 30s, curly hair, confident expression",
                                    "East Asian man, 20s, short black hair, neutral expression",
                                    "Young blonde woman, blue eyes, bright smile",
                                    "Middle-aged man, beard, athletic build",
                                ],
                                inputs=rep_desc,
                                label="Examples",
                            )
                            with gr.Row():
                                rep_btn = gr.Button("Replace Model", variant="primary", scale=3)
                                rep_cancel = gr.Button("Cancel", variant="stop", scale=1)
                        with gr.Column():
                            rep_out = gr.Image(type="pil", label="Result")
                            rep_status = gr.Textbox(interactive=False, show_label=False)
                    rep_event = rep_btn.click(replace_model, [rep_img, rep_desc], [rep_out, rep_status])
                    rep_cancel.click(fn=None, cancels=[rep_event])

                with gr.Tab("Remove Prop"):
                    gr.Markdown("Remove an object or accessory from the photo and fill the space naturally.")
                    with gr.Row():
                        with gr.Column():
                            rp_img = gr.Image(type="pil", label="Upload Photo")
                            rp_desc = gr.Textbox(
                                label="Item to remove",
                                placeholder="e.g. handbag, sunglasses, hat, watch",
                            )
                            gr.Examples(
                                examples=["handbag", "sunglasses", "hat", "watch", "phone", "shopping bags"],
                                inputs=rp_desc,
                                label="Examples",
                            )
                            with gr.Row():
                                rp_btn = gr.Button("Remove Prop", variant="primary", scale=3)
                                rp_cancel = gr.Button("Cancel", variant="stop", scale=1)
                        with gr.Column():
                            rp_out = gr.Image(type="pil", label="Result")
                            rp_status = gr.Textbox(interactive=False, show_label=False)
                    rp_event = rp_btn.click(remove_prop, [rp_img, rp_desc], [rp_out, rp_status])
                    rp_cancel.click(fn=None, cancels=[rp_event])

                with gr.Tab("Change Clothing"):
                    gr.Markdown("Swap a specific garment on the model — everything else stays the same.")
                    with gr.Row():
                        with gr.Column():
                            cl_img = gr.Image(type="pil", label="Upload Photo")
                            cl_item = gr.Textbox(
                                label="Item to change",
                                placeholder="e.g. shirt, jacket, trousers, dress",
                            )
                            cl_desc = gr.Textbox(
                                label="Replace with",
                                placeholder="e.g. oversized white linen shirt",
                                info="Be specific about style, colour, fabric, and fit.",
                            )
                            gr.Examples(
                                examples=[
                                    ["shirt", "oversized cream linen shirt"],
                                    ["jacket", "black leather biker jacket"],
                                    ["dress", "floral midi dress in pastel pink"],
                                    ["trousers", "slim-fit dark navy chinos"],
                                ],
                                inputs=[cl_item, cl_desc],
                                label="Examples",
                            )
                            with gr.Row():
                                cl_btn = gr.Button("Change Clothing", variant="primary", scale=3)
                                cl_cancel = gr.Button("Cancel", variant="stop", scale=1)
                        with gr.Column():
                            cl_out = gr.Image(type="pil", label="Result")
                            cl_status = gr.Textbox(interactive=False, show_label=False)
                    cl_event = cl_btn.click(change_clothing, [cl_img, cl_item, cl_desc], [cl_out, cl_status])
                    cl_cancel.click(fn=None, cancels=[cl_event])

if __name__ == "__main__":
    app.launch(theme=gr.themes.Soft())
