# Deployment Guide — Photo Editor Mobile App

## Architecture

```
Samsung S25  ──(HTTP)──▶  FastAPI backend (your Mac)  ──▶  Gemini API
   Expo app                  backend/main.py
```

Both devices must be on the **same Wi-Fi network**.

---

## Step 1 — Set up the FastAPI backend (on your Mac)

```bash
cd photo-editor/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Make sure your `.env` file at the project root has your key:
```
GEMINI_API_KEY=your_key_here
```

Start the server:
```bash
python main.py
```

The API will be available at `http://0.0.0.0:8000`.

---

## Step 2 — Find your Mac's local IP address

```bash
ipconfig getifaddr en0
# or
ifconfig | grep "inet " | grep -v 127.0.0.1
```

You'll get something like `192.168.1.45`.

---

## Step 3 — Update the mobile app config

Edit `mobile/src/config.ts` and replace the IP:

```typescript
export const API_BASE_URL = 'http://192.168.1.45:8000';
//                                    ^^^^^^^^^^^^^ your Mac's IP
```

---

## Step 4 — Install Node.js and Expo CLI (one-time)

```bash
# Install Node.js from https://nodejs.org (LTS version)

npm install -g expo-cli eas-cli
```

---

## Step 5 — Install mobile dependencies

```bash
cd photo-editor/mobile
npm install
```

---

## Step 6 — Run on your Samsung S25 during development

### Option A — Expo Go (fastest, no APK needed)

1. Install **Expo Go** from the Google Play Store on your S25
2. On your Mac, run:
   ```bash
   cd mobile
   npx expo start
   ```
3. Scan the QR code shown in terminal with Expo Go on your S25

### Option B — Build a real APK (for permanent installation)

This uses **EAS Build** (Expo's cloud build service — free tier available).

1. Create a free account at [expo.dev](https://expo.dev)
2. Log in:
   ```bash
   eas login
   ```
3. Configure the build:
   ```bash
   cd mobile
   eas build:configure
   ```
4. Build the APK:
   ```bash
   eas build --platform android --profile preview
   ```
   This uploads your code to Expo's servers and builds the APK in the cloud (~10 min).

5. Download the `.apk` file from the link provided, transfer it to your S25, and install it.

   On your S25: Settings → Apps → Special app access → Install unknown apps → enable for your browser.

---

## Local APK build (no cloud, requires Android Studio)

If you prefer to build locally:

1. Install [Android Studio](https://developer.android.com/studio)
2. Set environment variables:
   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
   ```
3. Build:
   ```bash
   cd mobile
   npx expo run:android --variant release
   ```
   The APK will be at `android/app/build/outputs/apk/release/app-release.apk`.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| "Network error" on phone | Check the IP in `config.ts`; ensure Mac firewall allows port 8000 |
| Backend not starting | Verify `GEMINI_API_KEY` is set in `.env` |
| Image too slow | Images are sent as multipart uploads; large photos (>4MB) will be slow on Wi-Fi |
| APK install blocked | Enable "Install unknown apps" in S25 settings for your file manager |
