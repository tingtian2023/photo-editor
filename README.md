# Shop Photo Editor

AI-powered product photo editing. A FastAPI backend calls Gemini; the frontend is an installable web app (PWA) built with React, Tailwind CSS and daisyUI, hosted on GitHub Pages.

```
Phone browser ──► https://<user>.github.io/photo-editor/   (static PWA, web/)
      │
      └─────────► https://<random>.trycloudflare.com       (Cloudflare Tunnel) ──► Mac :8000 (FastAPI, backend/)
```

## Features

| Screen | What it does |
|--------|-------------|
| ✏️ **Free Edit** | Type any instruction — the AI edits your image accordingly |
| 📸 **Product Shots** | One-tap shot styles: white background, lifestyle, packaging, close-up, group shot |
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
- Node.js 20+
- [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/) (`brew install cloudflared`)
- A [Google AI Studio](https://aistudio.google.com/apikey) API key

---

## 1 — Backend (FastAPI)

```bash
# From the repo root
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create your .env from the template, then edit it (see below)
cp .env.example .env

# Start the backend (keep this terminal open)
python backend/main.py
```

The server listens on `0.0.0.0:8000`.

### Configure `.env`

The backend reads its settings from `.env` in the repo root. `.env` is git-ignored; `.env.example` is the committed template.

| Variable | Required | What it does |
|----------|----------|--------------|
| `GEMINI_API_KEY` | Yes | Your [Google AI Studio](https://aistudio.google.com/apikey) key. |
| `APP_TOKEN` | Yes | Shared access code. The app asks for it once and sends it with every request. Must be at least 16 characters, or the server refuses to start. |
| `ALLOWED_ORIGINS` | No | Comma-separated browser origins allowed to call the API, e.g. `https://<user>.github.io,http://localhost:5173`. Defaults to all origins. |

Generate an `APP_TOKEN`:

```bash
python3 -c 'import secrets; print(secrets.token_urlsafe(24))'
```

### Access code

Every API request must send the access code in the `X-App-Token` header. Requests without it get `401 Invalid access code`.

- On first launch the app asks for a **Server URL** and **Access code**. Enter the `APP_TOKEN` value as the code.
- The app stores both in the browser's `localStorage`.
- If the server rejects the code (for example after you change `APP_TOKEN`), the app clears it and asks again.
- To lock everyone out, change `APP_TOKEN` in `.env` and restart the backend.

Never put the access code in the app source. The site is public, so anyone can read its bundle.

---

## 2 — Web App (`web/`)

Vite + React + TypeScript, styled with Tailwind CSS and [daisyUI](https://daisyui.com). Follows the system light/dark setting.

### Run locally

```bash
cd web
npm install
npm run dev
```

Open `http://localhost:5173`, enter `http://localhost:8000` as **Server URL**, and your access code. Make sure `ALLOWED_ORIGINS` in `.env` includes `http://localhost:5173`.

### Build

```bash
cd web
BASE_PATH=/photo-editor/ npm run build    # output in web/dist
npm run preview                           # serve the build locally
```

`BASE_PATH` is the sub-path the site is served from. Leave it unset for a site at the domain root.

---

## 3 — Deploy (GitHub Pages + Cloudflare Tunnel)

Both sides must be HTTPS: browsers only install PWAs from HTTPS pages, and HTTPS pages cannot call `http://` APIs. GitHub Pages serves the app; a Cloudflare Tunnel gives the backend on your Mac an `https://` address.

### One-time setup

1. **Pages needs a public repo on a free account.** GitHub Pages for private repos needs GitHub Pro. Making the repo public is safe: `.env` (your Gemini key and access code) is git-ignored and never committed.
2. In the repo on GitHub, go to **Settings → Pages → Build and deployment → Source** and select **GitHub Actions**.
3. Push to `main`. The workflow [.github/workflows/deploy-pages.yml](.github/workflows/deploy-pages.yml) builds `web/` and deploys it to `https://<user>.github.io/photo-editor/`. It runs again on every push that changes `web/`. You can also run it by hand from the **Actions** tab.
4. In `.env`, set `ALLOWED_ORIGINS=https://<user>.github.io` so the backend accepts requests from the site.

### Every time you use it

1. Start the backend:
   ```bash
   source venv/bin/activate
   python backend/main.py
   ```
2. In a second terminal, start the tunnel:
   ```bash
   cloudflared tunnel --url http://localhost:8000
   ```
   It prints a URL like `https://words-words-words.trycloudflare.com`. Keep this terminal open.
3. On your phone, open `https://<user>.github.io/photo-editor/`.
4. Enter the tunnel URL as **Server URL** and your `APP_TOKEN` as **Access code**, then tap **Unlock**.

The quick-tunnel URL changes every time `cloudflared` restarts. When it changes, edits fail with "Network error". Tap the logout icon on the home screen and enter the new URL. For a fixed URL, set up a [named tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/get-started/create-local-tunnel/) on a domain you own, then save it as the repo variable `API_BASE_URL` (**Settings → Secrets and variables → Actions → Variables**) so the app pre-fills it.

### Install on your phone

- **Android (Chrome):** menu **⋮ → Add to Home screen → Install**.
- **iPhone (Safari):** **Share → Add to Home Screen**.

On the phone, **Save Image** opens the share sheet. Choose **Save image** (Android) or **Save Image** (iPhone) to put the result in your photos. On desktop it downloads a PNG.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| "Cannot reach the server" | Check the Server URL. Make sure the backend and `cloudflared` are both running. |
| "That access code is not valid" | Type the exact `APP_TOKEN` value from `.env`. Restart the backend after you change it. |
| Backend says `APP_TOKEN missing or shorter than 16 characters` | Add a 16+ character `APP_TOKEN` to `.env` in the repo root. |
| Works locally but not from GitHub Pages | Add `https://<user>.github.io` to `ALLOWED_ORIGINS` and restart the backend. |
| Old version still showing after a deploy | Close and reopen the app; the service worker updates on the next launch. |

---

## Tips for best results

- **Free Edit / Background Swap**: be specific — describe lighting, colour, surface texture, and mood
- **Product Shots**: use **Details** to steer the result, e.g. the scene for Lifestyle or the variants for Group shot
- **Replace Model**: describe the person only (face, hair, ethnicity, age) — use *Change Clothing* for outfit changes
- **Remove Watermarks**: works best when the watermark sits on a consistent background
- **Crop / Trim**: use this to remove banner strips at the edges of composite product images
- **Combine — AI Blend**: describe the output you want, e.g. *"place the person from image 1 into the park background from image 2"*
