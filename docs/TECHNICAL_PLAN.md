# KitchenScan Technical Plan

## Summary

Build a new Expo + Fastify + RocketRide project where users scan kitchen photos, Gemini extracts ingredients, and Gemini generates recipes from the confirmed pantry.

## Core Architecture

```text
Expo phone app
  -> Fastify API
  -> RocketRide TypeScript SDK
  -> RocketRide .pipe workflows
  -> Gemini / Google Cloud
  -> validated JSON responses
  -> pantry + recipes + cook mode
```

## Required Features

- Multi-photo kitchen scan session.
- Review/edit ingredient candidates.
- Local-first pantry.
- Gemini-generated recipes from pantry items.
- Recipe detail and cooking steps.
- Anonymous usage tracking for real-user validation.

## Hackathon Compliance

- Use RocketRide IDE extension to build and test `.pipe` files.
- Use RocketRide in the runtime path for ingredient extraction and recipe generation.
- Use Gemini / Google Cloud for the core AI.
- Deploy or expose a working demo and collect at least five real users.

## Sprint 2 Scope

- `POST /detect` accepts a base64 image plus optional frame dimensions.
- API invokes `pipelines/extract-ingredients.pipe` through the RocketRide TypeScript SDK when credentials are configured.
- Gemini Vision returns structured ingredient candidates, which the API normalizes into mobile `Detection` objects.
- Demo fallback detections keep the mobile scan flow usable without live cloud credentials.

## Sprint 3 Scope

- `GET /recipes/search` accepts pantry ingredients and returns generated recipe cards.
- `GET /recipes/:id` returns cookable generated recipe details for cards produced in the current session.
- API invokes `pipelines/generate-recipes.pipe` through the RocketRide TypeScript SDK when credentials are configured.
- Gemini produces structured recipe JSON; deterministic fallback recipes preserve the demo without live keys.

## Initial Repo Structure

```text
apps/
  api/
  mobile/
packages/
  shared/
pipelines/
docs/
scripts/
```
