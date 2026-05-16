# KitchenScan

KitchenScan is a Build with AI hackathon project: scan the ingredients in your kitchen, confirm an AI-generated pantry, and get recipes you can cook with what you already have.

## Hackathon Requirements

- RocketRide: AI workflows live in RocketRide `.pipe` files and are invoked by the backend.
- Google Cloud / Gemini: Gemini handles kitchen-photo ingredient extraction and recipe generation.
- Real app: Expo mobile app for the phone demo.
- Impact: reduce food waste, save money, and make cooking easier for students and households.

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
- When local RocketRide/Gemini credentials are not configured, the API returns deterministic demo detections so the hackathon demo still works.
- Run `pnpm --filter @kitchenscan/api check:rocketride` with `ROCKETRIDE_URI`, `ROCKETRIDE_APIKEY`, and `ROCKETRIDE_GEMINI_API_KEY` set to verify the RocketRide setup.

## Sprint 3 Recipe Slice

- Recipes tab calls `GET /recipes/search?ingredients=...` for pantry-aware generated recipe cards.
- Recipe details come from `GET /recipes/:id` after a search result is generated.
- API routes recipe generation through `pipelines/generate-recipes.pipe`, a RocketRide Gemini workflow.
- Deterministic fallback recipes keep the demo useful before live RocketRide/Gemini credentials are configured.

## Repo Status

This repo is intentionally fresh for the hackathon. The implementation will reuse patterns from an earlier personal cooking-app prototype while building the RocketRide/Gemini workflow as new hackathon work.
