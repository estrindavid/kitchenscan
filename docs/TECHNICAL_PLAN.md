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

## Sprint 4 Scope

- `POST /usage/events` records anonymous product events from the mobile app.
- `GET /usage/summary` returns total events, unique anonymous users, event counts, and funnel counts.
- Mobile tracks app open, scan start/completion, manual additions, pantry saves, recipe search views, recipe views, and cook-mode starts.
- Events are best-effort and anonymous so validation metrics never block core user workflows.

## Sprint 5 Scope

- `GET /pantry/items`, `POST /pantry/items`, `POST /pantry/items/batch`, `PATCH /pantry/items/:id`, and `DELETE /pantry/items/:id` support local-first sync.
- `GET /pantry/summary` returns category counts and expiring counts for the pantry tab.
- `GET /pantry/expiring` returns items expiring within a configurable day window.
- The API keeps pantry state in memory for the demo while preserving a clean route contract for later Firestore or database persistence.

## Sprint 6 Scope

- Profile screen displays a live validation metrics panel.
- Mobile reads `GET /usage/summary` through a dedicated hook.
- Metrics include unique anonymous users, total events, scan starts, pantry saves, recipe searches, and recipe views.
- The panel gives the pitch a quick proof-of-use artifact without adding auth or a database dependency.

## Sprint 7 Scope

- Scan store tracks scan-session captures with `scanAttempts` and a session start timestamp.
- Camera overlay and detection tray expose photo count and item count so multi-photo scanning is visible.
- Manual/demo flows increment the same capture counter as camera captures.
- The confirm screen shows the number of scanned photos before items are saved to the pantry.

## Sprint 8 Scope

- `POST /feedback` records anonymous tester ratings, would-use-again intent, useful moments, and friction notes.
- `GET /feedback/summary` returns pitch-ready validation metrics: total feedback, unique testers, average rating, would-use-again count/rate, and recent responses.
- Profile screen includes a tester-feedback panel that submits to the API and refreshes the live summary.
- Feedback submission also records an anonymous usage event so product analytics and direct tester sentiment stay connected.

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
