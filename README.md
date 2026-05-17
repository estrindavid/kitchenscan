# KitchenScan

KitchenScan is a Build with AI hackathon project: scan the ingredients in your kitchen, confirm an AI-generated pantry, and get recipes you can cook with what you already have.

## Hackathon Requirements

- RocketRide: AI workflows live in RocketRide `.pipe` files and are invoked by the backend.
- Google Cloud / Gemini: Gemini handles kitchen-photo ingredient extraction and recipe generation.
- Real app: Expo mobile app for the phone demo.
- Impact: reduce food waste, save money, and make cooking easier for students and households.

See [docs/DEMO_SETUP.md](docs/DEMO_SETUP.md) for the exact connected-demo setup checklist.

## Planned Workflow

1. Capture fridge, pantry, freezer, or counter photos.
2. Send photos to the API.
3. API invokes the RocketRide ingredient extraction pipeline.
4. User reviews and saves pantry items.
5. API invokes RocketRide recipe generation pipeline.
6. User cooks from generated recipe steps.

## Sprint 2 Demo Slice

- Mobile scanner posts captured image data and frame dimensions to `POST /detect`.
- API routes the scan through `pipelines/extract-ingredients.pipe`, a RocketRide Gemini Vision workflow.
- If RocketRide does not return output, the API uses Vertex AI Gemini through Application Default Credentials when `GOOGLE_CLOUD_PROJECT` is set.
- Run `pnpm --filter @kitchenscan/api check:rocketride` with `ROCKETRIDE_URI` plus either Vertex ADC or `ROCKETRIDE_GEMINI_API_KEY` to verify setup.

## Sprint 3 Recipe Slice

- Recipes tab calls `GET /recipes/search?ingredients=...` for pantry-aware generated recipe cards.
- Recipe details come from `GET /recipes/:id` after a search result is generated.
- API routes recipe generation through `pipelines/generate-recipes.pipe`, a RocketRide Gemini workflow.
- Demo fallbacks are opt-in with `KITCHENSCAN_DEMO_AI_FALLBACK=true`; normal runs surface setup errors instead of pretending AI worked.

## Sprint 4 Usage Slice

- Mobile records anonymous usage events for app open, scans, pantry saves, recipe searches, recipe views, and cook-mode starts.
- API accepts `POST /usage/events` and exposes `GET /usage/summary` for pitch-ready validation numbers.
- Usage tracking is intentionally anonymous and non-blocking; failed analytics requests never interrupt the demo.

## Sprint 5 Pantry Slice

- API now supports the mobile app's local-first pantry sync routes: list, add, batch add, update, delete, summary, and expiring items.
- Pantry storage is in-memory for hackathon speed, with response shapes matching the existing Expo hooks.
- Confirmed scan items can sync to the API instead of relying only on local fallback storage.

## Sprint 6 Validation UI Slice

- Profile now includes a validation metrics panel backed by `GET /usage/summary`.
- The panel shows unique users, total events, scan starts, pantry saves, and recipe views for the pitch.
- Metrics refresh automatically while the app is open.

## Sprint 7 Multi-Photo Scan Slice

- Scan sessions now track how many photos/captures have been added before review.
- The camera overlay and detection tray show session progress and encourage scanning multiple kitchen areas.
- The review screen shows the number of scanned photos before saving confirmed pantry items.

## Sprint 8 Tester Feedback Slice

- Profile now includes a lightweight tester-feedback form for collecting pitch-ready validation.
- API accepts `POST /feedback` and exposes `GET /feedback/summary` with response count, unique testers, average rating, and would-use-again rate.
- Feedback is anonymous and paired with a usage event so judges can see both product behavior and direct tester sentiment.

## Sprint 9 Impact Snapshot Slice

- API exposes `GET /impact/summary`, combining pantry, usage, and feedback data into one judge-friendly impact summary.
- Profile now shows meals unlocked, expiring items to rescue, estimated grocery savings, scan-to-recipe conversion, and impact highlights.
- The snapshot turns KitchenScan's core value into pitch-ready proof: less food waste, more meals from what users already own, and real tester signal.

## Repo Status

This repo is intentionally fresh for the hackathon. The implementation will reuse patterns from an earlier personal cooking-app prototype while building the RocketRide/Gemini workflow as new hackathon work.
