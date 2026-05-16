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

