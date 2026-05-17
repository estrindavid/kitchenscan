# RocketRide Evidence

This repo should not need a hand-wavy "trust us" explanation. The RocketRide pieces are in the codebase and can be checked directly.

## What Exists

KitchenScan has two RocketRide workflow files:

- `pipelines/extract-ingredients.pipe`
  - Flow: `webhook -> image_vision_gemini -> response_text`
  - Purpose: turn kitchen photos into structured ingredient JSON.
  - Gemini profile: `gemini-2_5-flash`

- `pipelines/generate-recipes.pipe`
  - Flow: `webhook -> llm_gemini -> response_answers`
  - Purpose: turn confirmed pantry ingredients into structured recipe JSON.
  - Gemini profile: `gemini-2_5-flash`

Both pipelines reference `${ROCKETRIDE_GEMINI_API_KEY}` for RocketRide-side Gemini execution. The app also supports Vertex AI ADC as a direct fallback so the hackathon demo can keep working if the local RocketRide engine or venue network is unstable.

## Runtime Use

The Fastify API invokes RocketRide before falling back to direct Gemini:

- `apps/api/src/services/ingredientExtraction.ts`
  - imports the `rocketride` SDK dynamically
  - creates `new RocketRideClient()`
  - starts `extract-ingredients.pipe` with `client.use({ filepath })`
  - sends the image payload with `client.send(...)`

- `apps/api/src/services/recipeGeneration.ts`
  - imports the `rocketride` SDK dynamically
  - creates `new RocketRideClient()`
  - starts `generate-recipes.pipe` with `client.use({ filepath })`
  - sends the pantry recipe prompt with `client.send(...)`

## How To Verify

Run:

```bash
pnpm rocketride:evidence
pnpm --filter @kitchenscan/api check:rocketride
pnpm demo:check
```

Expected:

- `pnpm rocketride:evidence` confirms the SDK dependency, both `.pipe` files, and both runtime SDK invocation paths.
- `check:rocketride` confirms environment and pipeline file readiness.
- `demo:check` confirms RocketRide config, Google/Gemini auth, both pipeline files, Gemini generateContent, and API health.

## Demo Language

Use this wording:

"The repo contains RocketRide `.pipe` workflows for both scan extraction and recipe generation. The API attempts those pipelines through the RocketRide TypeScript SDK first. To keep the live demo resilient, it can fall back to direct Gemini on Vertex AI if the local RocketRide engine or event Wi-Fi is flaky."

Avoid saying the app only "pretends" to use RocketRide. The repo contains the pipelines and runtime SDK calls; the fallback is there for demo reliability.
