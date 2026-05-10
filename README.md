# Shop Photo Editor

AI-powered product photo editing — FastAPI backend + React Native (Expo) mobile app for Android.

## Features

| Screen | What it does |
|--------|-------------|
| ✏️ **Free Edit** | Type any instruction — the AI edits your image accordingly |
| 🖼️ **Background Swap** | Remove or replace the background on a product photo |
| 🌿 **Lifestyle Scene** | Place your product into a realistic lifestyle setting |
| ✨ **Enhance** | Retouch to a professional standard (4 style presets) |
| 🔤 **Add Text** | Overlay text banners with custom position, size, and colour |
| 🚫 **Remove Watermarks** | Clean text, logos, and overlays |
| ✂️ **Crop / Trim** | Trim edges precisely |
| 👤 **Replace Model** | Swap the person in a photo |
| 🗑️ **Remove Prop** | Erase objects naturally |
| 👗 **Change Clothing** | Swap garments on a model |
| 🖼️🖼️ **Combine Images** | Merge two photos side-by-side, top-to-bottom, or with AI |

Saved prompts persist across sessions in `saved_prompts.json`.

---

## Requirements

- Python 3.10+
- Node.js 18+
- [Expo Go](https://expo.dev/go) installed on your Android phone
- A [Google AI Studio](https://aistudio.google.com/apikey) API key

---

## 1 — Backend (FastAPI)

```bash
# From the repo root

# Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Add your Gemini API key
echo "GEMINI_API_KEY=your_key_here" > .env

# Start the backend (stays running while you use the app)
python backend/main.py
```

The server listens on `0.0.0.0:8000`. Keep this terminal open.

To start it again later:

```bash
source venv/bin/activate
python backend/main.py
```

---

## 2 — Mobile App (Expo / React Native)

### One-time setup

```bash
cd mobile
npm install
```

### Configure the backend URL

Open [mobile/src/config.ts](mobile/src/config.ts) and set your Mac's local IP address:

```ts
export const API_BASE_URL = 'http://<your-mac-ip>:8000';
```

Find your IP: **System Settings → Wi-Fi → Details** (must be on the same Wi-Fi network as your phone).

### Run

```bash
cd mobile
npx expo start
```

A QR code will appear in the terminal. Open **Expo Go** on your phone and scan it. The app will load.

> **Tip:** if you change native dependencies, run `npx expo start --clear` to reset the bundle cache.

---

## Dependencies

**Python**
```
fastapi
uvicorn
google-genai
Pillow
python-dotenv
```

**Node** — managed by `mobile/package.json` (Expo SDK 54, React Native 0.81).

---

## Tips for best results

- **Free Edit / Background Swap**: be specific — describe lighting, colour, surface texture, and mood
- **Replace Model**: describe the person only (face, hair, ethnicity, age) — use *Change Clothing* for outfit changes
- **Remove Watermarks**: works best when the watermark sits on a consistent background
- **Crop / Trim**: use this to remove banner strips at the edges of composite product images
- **Combine — AI Blend**: describe the output you want, e.g. *"place the person from image 1 into the park background from image 2"*
