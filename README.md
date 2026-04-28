# Shop Photo Editor

AI-powered product photo editing tool built with [Gradio](https://gradio.app) and the [Google Gemini](https://ai.google.dev) image model.

## Features

| Tab | What it does |
|-----|-------------|
| ✏️ **Free Edit** | Type any instruction — the AI edits your image accordingly |
| 🖼️ **Background Swap** | Remove or replace the background on a product photo |
| 🌿 **Lifestyle Scene** | Place your product into a realistic lifestyle setting |
| ✨ **Enhance** | Retouch and upscale to a professional standard (4 style presets) |
| 🔤 **Text & Watermarks** | Add text banners, remove watermarks, or crop edges |
| 👗 **Model Editing** | Replace the model, remove a prop, or swap a clothing item |

Saved prompts are bookmarked locally in `saved_prompts.json` and persist across sessions.

## Requirements

- Python 3.10+
- A [Google AI Studio](https://aistudio.google.com/apikey) API key with access to the Gemini image model

## Setup

```bash
# 1. Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Add your API key
echo "GEMINI_API_KEY=your_key_here" > .env

# 4. Run
python app.py
```

To run again later, activate the virtual environment first:

```bash
source venv/bin/activate
python app.py
```

Open [http://127.0.0.1:7860](http://127.0.0.1:7860) in your browser.

## Dependencies

```
google-genai
gradio
Pillow
python-dotenv
```

## Tips for best results

- **Free Edit / Background Swap**: be specific — describe lighting, colour, surface texture, and mood
- **Replace Model**: describe the person only (face, hair, ethnicity, age) — use *Change Clothing* for outfit changes
- **Remove Watermarks**: works best when the watermark sits on a consistent background
- **Crop / Trim**: use this to remove banner strips at the edges of composite product images
- All AI features have a **Cancel** button to stop a request mid-flight
