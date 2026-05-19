# KitchenScan

**Scan your fridge. Know what you can cook.**

KitchenScan turns photos of your fridge or pantry into an AI pantry, then recommends recipes from food you already own.

Built in a few hours at a Google hackathon.

## Why

Recipe apps usually start with a shopping list.

KitchenScan starts with what is already in your kitchen.

Open the app, scan your food, confirm what it found, and ask for recipes that match your actual pantry. The goal is simple: make the "what can I cook right now?" moment less annoying.

## What It Does

- Scans fridge, pantry, freezer, or counter photos
- Detects visible ingredients with AI
- Lets you review and save a clean pantry
- Generates recipes from active pantry items
- Opens recipe details and step-by-step cook mode
- Marks used ingredients as used up after cooking
- Shows lightweight impact and validation metrics

## Demo Flow

```text
scan food -> confirm pantry -> find recipes -> cook -> update pantry
```

1. Start on the welcome screen.
2. Take a photo of ingredients.
3. Confirm detected items into the pantry.
4. Tap **Find me recipes**.
5. Open a recipe and cook through the steps.
6. Mark used ingredients so the pantry stays accurate.

## Screens

The app includes:

- Animated onboarding
- Camera scan flow
- Pantry manager
- AI recipe feed
- Recipe detail and cook mode
- Profile dashboard for readiness, feedback, and impact

## Tech Stack

- **Mobile:** Expo, React Native, Expo Router
- **API:** Fastify, TypeScript, Zod
- **AI:** Gemini / Vertex AI
- **Workflow:** RocketRide `.pipe` pipelines
- **State:** TanStack Query, Zustand, AsyncStorage
- **Tooling:** pnpm, Turbo, Vitest

## Project Structure

```text
apps/
  mobile/      Expo app
  api/         Fastify API
packages/
  shared/      Shared TypeScript types
pipelines/     RocketRide workflows
docs/          Demo and submission notes
scripts/       Readiness checks
```

## Quick Start

Install dependencies:

```bash
pnpm install
```

Create an environment file:

```bash
cp .env.example .env
```

Start the API:

```bash
pnpm dev:api
```

Start the mobile app:

```bash
pnpm --filter @kitchenscan/mobile exec expo start --lan --port 8082
```

Run checks:

```bash
pnpm typecheck
pnpm --filter @kitchenscan/api test
pnpm demo:check
```

## Notes

- The live demo uses a local API on port `3001`.
- Google Cloud / Vertex AI is used for Gemini access.
- RocketRide pipeline files live in [`pipelines/`](pipelines/).
- Detailed setup lives in [`docs/DEMO_SETUP.md`](docs/DEMO_SETUP.md).

## Links

- Repo: https://github.com/estrindavid/kitchenscan
- Submission notes: [`docs/HACKATHON_SUBMISSION.md`](docs/HACKATHON_SUBMISSION.md)
