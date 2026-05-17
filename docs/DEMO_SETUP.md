# KitchenScan Demo Setup

Use this checklist before presenting.

## 0. Submission Materials

- Repo: https://github.com/estrindavid/kitchenscan
- Form-ready copy: [docs/HACKATHON_SUBMISSION.md](HACKATHON_SUBMISSION.md)
- RocketRide proof: [docs/ROCKETRIDE_EVIDENCE.md](ROCKETRIDE_EVIDENCE.md)
- Required judging story: scan food, confirm pantry, generate recipes, cook, mark used-up items, show impact metrics.

## 1. Add Required Keys

Edit `.env` in the repo root.

Required:

```bash
ROCKETRIDE_URI=http://localhost:5565
ROCKETRIDE_APIKEY=
GOOGLE_CLOUD_PROJECT=your_google_cloud_project_id
GOOGLE_CLOUD_LOCATION=us-central1
PORT=3001
HOST=0.0.0.0
```

`ROCKETRIDE_APIKEY` is optional for a local RocketRide engine at `localhost:5565`. Fill it only if you are connecting to RocketRide Cloud or an authenticated remote engine.

KitchenScan now prefers Vertex AI Gemini through Application Default Credentials (ADC). Run the hackathon ADC setup command, then set `GOOGLE_CLOUD_PROJECT` to the credited Google Cloud project:

```bash
bash <(curl -sSL https://storage.googleapis.com/cloud-samples-data/adc/setup_adc.sh)
```

`ROCKETRIDE_GEMINI_API_KEY` is optional now. Keep it only as a fallback for the older Google AI Studio / Gemini Developer API path.

Do not commit real keys.

## 2. Verify RocketRide And Pipelines

```bash
pnpm --filter @kitchenscan/api check:rocketride
pnpm rocketride:evidence
pnpm demo:check
```

Expected: `"ok": true` from the RocketRide check, RocketRide evidence present, and `Ready for the connected demo.` from the readiness check.

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
pnpm typecheck
pnpm --filter @kitchenscan/api test
```

In the app, open Profile and look at **Demo Readiness**.

## 5. Pitch Flow

1. Start from the welcome screen.
2. Scan real pantry ingredients.
3. Confirm items into pantry.
4. Generate recipes from pantry.
5. Open a recipe and show cook steps.
6. Mark used ingredients as used up.
7. Open Profile.
8. Show Demo Readiness, Impact Snapshot, Validation, and Tester Feedback.

## 6. Recording Notes

The app is configured to start on the welcome screen when Expo loads. If the phone opens to a stale screen, fully close Expo Go, reopen the project, or press reload in the Expo dev menu.

Suggested 45-second demo recording:

1. Welcome screen.
2. Scan page camera capture.
3. Ingredient review and save.
4. Pantry populated.
5. Recipes tab and **Find me recipes**.
6. Recipe detail.
7. Profile impact snapshot.

## 7. Submission Sanity Check

Before submitting:

1. Confirm the repo is pushed to `master`.
2. Confirm `.env` is not committed.
3. Confirm `README.md` explains RocketRide and Google Cloud usage.
4. Confirm `docs/HACKATHON_SUBMISSION.md` has the project summary and pitch script.
5. Run `pnpm rocketride:evidence`.
6. Confirm the demo video starts on the welcome screen and shows the live AI path.

## Backup Plan

If RocketRide/Gemini or Wi-Fi fails, use the built-in deterministic fallback and demo scan flow. Be transparent: "The app falls back to a demo-safe local response when cloud keys are unavailable, but the RocketRide and Gemini integration is wired through the API pipeline."
