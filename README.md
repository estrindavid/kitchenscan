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
3. API invokes RocketRide ingredient extraction pipeline.
4. User reviews and saves pantry items.
5. API invokes RocketRide recipe generation pipeline.
6. User cooks from generated recipe steps.

## Repo Status

This repo is intentionally fresh for the hackathon. The implementation will reuse patterns from the earlier PantryVision prototype while building the RocketRide/Gemini workflow as new hackathon work.

