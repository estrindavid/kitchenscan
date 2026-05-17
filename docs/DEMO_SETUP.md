# KitchenScan Demo Setup

Use this checklist before presenting.

## 1. Add Required Keys

Edit `.env` in the repo root.

Required:

```bash
ROCKETRIDE_URI=http://localhost:5565
ROCKETRIDE_APIKEY=your_rocketride_key
ROCKETRIDE_GEMINI_API_KEY=your_gemini_key
GOOGLE_CLOUD_PROJECT=your_google_cloud_project_id
PORT=3001
HOST=0.0.0.0
```

Do not commit real keys.

## 2. Verify RocketRide And Pipelines

```bash
pnpm --filter @kitchenscan/api check:rocketride
```

Expected: `"ok": true`.

## 3. Start The Demo

Use Node 22, not Node 25, because Expo's port scanner can fail on Node 25.

Terminal tab 1:

```bash
cd /Users/david/Documents/hackathonproj/kitchenscan
export PATH=/Users/david/.local/share/mise/installs/node/22.22.2/bin:$PATH
pnpm --filter @kitchenscan/api dev
```

Terminal tab 2:

```bash
cd /Users/david/Documents/hackathonproj/kitchenscan
export PATH=/Users/david/.local/share/mise/installs/node/22.22.2/bin:$PATH
pnpm --filter @kitchenscan/mobile exec expo start --lan --port 8082
```

Scan the QR code from Expo Go.

## 4. Check Readiness

```bash
pnpm demo:check
```

In the app, open Profile and look at **Demo Readiness**.

## 5. Pitch Flow

1. Scan or simulate pantry ingredients.
2. Confirm items into pantry.
3. Generate recipes from pantry.
4. Open Profile.
5. Show Demo Readiness, Impact Snapshot, Validation, and Tester Feedback.

## Backup Plan

If RocketRide/Gemini or Wi-Fi fails, use the built-in deterministic fallback and demo scan flow. Be transparent: "The app falls back to a demo-safe local response when cloud keys are unavailable, but the RocketRide and Gemini integration is wired through the API pipeline."
