# KitchenScan

KitchenScan is an AI pantry assistant for students and busy households: scan the food already in your kitchen, confirm a smart pantry, then generate recipes that use what you have before it goes bad.

Built for the Build with AI two-day hackathon by GDG Newport Beach x RocketRide.

## Why It Matters

People waste food because they forget what they own, do not know what to cook, or buy ingredients they already had. KitchenScan turns a fridge or pantry photo into immediate cooking options, helping users save money, reduce food waste, and make dinner decisions faster.

## Demo Flow

1. Open the Expo app. It starts on the animated welcome screen for recording.
2. Scan fridge, pantry, freezer, or counter ingredients.
3. Review the detected ingredients and save them to the pantry.
4. Tap **Find me recipes** to generate meals from the active pantry.
5. Open a recipe, cook through the steps, and mark used ingredients as used up.
6. Open Profile to show readiness, validation metrics, feedback, and impact snapshot.

## Hackathon Compliance

- **RocketRide:** The API invokes RocketRide `.pipe` workflows for ingredient extraction and recipe generation.
- **Google product:** Gemini on Google Cloud / Vertex AI powers image understanding and recipe generation through Application Default Credentials.
- **Working prototype:** Expo mobile app plus Fastify API, pantry sync, recipe generation, cook mode, feedback, and impact metrics.
- **Real problem:** Food waste, grocery cost, and kitchen decision fatigue.

## Architecture

```text
Expo app
  -> Fastify API
  -> RocketRide TypeScript SDK
  -> pipelines/*.pipe
  -> Gemini / Vertex AI
  -> normalized pantry, recipes, metrics
```

Key paths:

- `apps/mobile`: Expo app for scanning, pantry, recipes, cook mode, and profile metrics.
- `apps/api`: Fastify backend for detection, recipes, pantry sync, usage, feedback, and impact.
- `pipelines/extract-ingredients.pipe`: RocketRide Gemini Vision workflow.
- `pipelines/generate-recipes.pipe`: RocketRide Gemini recipe workflow.
- `docs/ROCKETRIDE_EVIDENCE.md`: where judges can verify the RocketRide dependency, pipelines, and SDK invocation path.
- `docs/HACKATHON_SUBMISSION.md`: form-ready submission copy and pitch script.
- `docs/DEMO_SETUP.md`: exact setup checklist.

## Quick Start

Install dependencies:

```bash
pnpm install
```

Create `.env` from `.env.example`, then configure RocketRide and Google Cloud ADC:

```bash
cp .env.example .env
bash <(curl -sSL https://storage.googleapis.com/cloud-samples-data/adc/setup_adc.sh)
```

Start the API:

```bash
pnpm --filter @kitchenscan/api dev
```

Start Expo:

```bash
pnpm --filter @kitchenscan/mobile exec expo start --lan --port 8082
```

Verify the connected demo:

```bash
pnpm demo:check
pnpm rocketride:evidence
pnpm typecheck
pnpm --filter @kitchenscan/api test
```

See [docs/DEMO_SETUP.md](docs/DEMO_SETUP.md) for the full live-demo checklist.

## Submission Links

- Repo: https://github.com/estrindavid/kitchenscan
- Submission packet: [docs/HACKATHON_SUBMISSION.md](docs/HACKATHON_SUBMISSION.md)
- RocketRide evidence: [docs/ROCKETRIDE_EVIDENCE.md](docs/ROCKETRIDE_EVIDENCE.md)
