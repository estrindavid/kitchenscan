# KitchenScan Hackathon Submission

## Form-Ready Summary

**Project name:** KitchenScan

**Tagline:** Scan your kitchen. Cook what you already own.

**Short description:** KitchenScan is an AI pantry assistant that turns fridge and pantry photos into a confirmed ingredient list, then generates recipes from the food a user already has. It helps students and households save money, reduce food waste, and make cooking decisions faster.

**Problem:** People often waste food because they forget what is in their kitchen, do not know how to combine ingredients, or buy duplicates at the store. This is especially common for students and busy households with limited time, limited budgets, and messy fridge/pantry habits.

**Solution:** KitchenScan lets users scan multiple kitchen photos, review detected ingredients, save them to a local-first pantry, and generate cookable recipes from active pantry items. After cooking, users can mark ingredients as used up so the pantry stays realistic.

**Repository:** https://github.com/estrindavid/kitchenscan

**Demo setup:** `docs/DEMO_SETUP.md`

## Built With

- Expo / React Native mobile app
- Fastify TypeScript API
- RocketRide IDE extension and RocketRide TypeScript SDK
- RocketRide `.pipe` workflows in `pipelines/`
- Gemini on Google Cloud / Vertex AI via Application Default Credentials
- TanStack Query, Zustand, AsyncStorage, Vitest, Turbo, pnpm

## Required Tool Usage

**RocketRide:** KitchenScan includes two RocketRide pipeline files:

- `pipelines/extract-ingredients.pipe`: image-to-ingredients workflow using Gemini Vision.
- `pipelines/generate-recipes.pipe`: pantry-to-recipes workflow using Gemini.

The API attempts RocketRide first through the RocketRide TypeScript SDK, then uses direct Vertex AI Gemini fallback to keep the live demo resilient while still preserving the RocketRide workflow path.

**Google product:** Gemini on Google Cloud / Vertex AI is the core AI layer for both multimodal ingredient extraction and structured recipe generation. The demo uses Google Cloud ADC and the credited hackathon project.

## Rubric Mapping

**Impact:** KitchenScan addresses food waste, grocery overspending, and cooking friction. It is targeted at real users who already own ingredients but do not know what to make with them.

**Innovation:** Instead of being a generic chatbot, KitchenScan is a workflow: camera scan, ingredient confirmation, pantry state, recipe generation, cook mode, and post-recipe pantry depletion.

**Execution:** The project is a working mobile app with an API, RocketRide pipeline files, connected Gemini calls, pantry sync, recipe generation, profile metrics, demo readiness checks, and automated API tests.

**Use of AI:** AI is central to the product. Gemini understands kitchen photos, converts messy real-world input into structured ingredients, and generates practical recipes from the user's actual pantry.

**Presentation:** The demo starts from the animated welcome screen, then follows a short story: scan food, confirm pantry, generate recipes, cook, and show impact metrics.

## 3-Minute Pitch Script

**0:00-0:25 Problem**

"KitchenScan helps people cook from what they already own. A lot of food waste happens because ingredients are forgotten in the fridge or pantry, and students especially do not have time to plan meals around random leftovers. The pain is simple: I have food, but I do not know what to make, so I buy more or order out."

**0:25-0:50 Solution**

"KitchenScan turns the kitchen into an AI-readable pantry. You scan ingredients with your phone, confirm what the app detected, and then ask it to find recipes using those ingredients. The goal is not another chatbot. It is a full cooking workflow from real-world food to dinner."

**0:50-2:10 Demo**

"First, the app opens on the welcome flow. I go to scan and take a photo of food in my kitchen. Gemini reads the image through the RocketRide ingredient pipeline and returns detected pantry items. I confirm the useful ones and save them. Now the pantry has active ingredients. On the recipes tab, I tap Find me recipes. The RocketRide recipe pipeline and Gemini generate meals from my pantry. I can open a recipe, see matched ingredients and cooking steps, and after cooking I can mark used ingredients as used up so the pantry stays accurate."

**2:10-2:40 Technical Proof**

"The backend is a Fastify API. RocketRide pipelines live in the repo as `.pipe` files and are invoked by the API. Gemini runs through Google Cloud Vertex AI using ADC, so it satisfies the Google Cloud requirement and uses the hackathon credits path. The app also includes readiness checks, usage metrics, tester feedback, and impact summary endpoints."

**2:40-3:00 Impact Close**

"The bigger vision is a household food-waste assistant: less forgotten food, fewer duplicate groceries, and faster meals from what people already have. KitchenScan makes AI useful in a real physical workflow, not just in a chat box."

## Demo Checklist

Before recording or presenting:

1. Pull latest `master`.
2. Start local RocketRide at `http://localhost:5565`.
3. Confirm Google Cloud ADC is logged in and quota project is set.
4. Start API on port `3001`.
5. Run `pnpm demo:check`.
6. Start Expo with LAN mode.
7. Open the app from Expo Go and confirm it starts on the welcome page.
8. Test one scan and one recipe generation before presenting.

## Backup Lines

If Wi-Fi, RocketRide, or Gemini has a live-event issue:

"The connected path is wired through RocketRide and Gemini, and the repo includes a readiness checker for that path. For demo safety, the app can fall back to deterministic local responses so the user workflow remains visible even if venue networking breaks."

If asked whether this is just a chatbot:

"No. The core product is structured around real-world state: camera input, confirmed pantry items, active versus used-up ingredients, recipes generated from current inventory, and impact metrics."

If asked what would come next:

"The next step is persistent cloud storage, barcode and receipt import, household sharing, expiration prediction, and stronger recipe constraints for allergies and budget."

## Submission Form Answers

Use these if the Notion form asks for short fields.

**What did you build?**

KitchenScan, a mobile AI pantry assistant that scans kitchen photos, detects ingredients, builds a pantry, and generates recipes from what the user already owns.

**Who is it for?**

Students, roommates, families, and busy people who waste food or overspend because they forget what ingredients they already have.

**How does it use RocketRide?**

The backend uses RocketRide `.pipe` workflows for ingredient extraction and recipe generation. The pipelines are stored in `pipelines/` and invoked from the Fastify API through the RocketRide SDK.

**How does it use Google Cloud or Gemini?**

Gemini on Vertex AI powers multimodal ingredient detection and structured recipe generation. The demo uses Application Default Credentials tied to the hackathon Google Cloud project.

**What makes it impactful?**

KitchenScan reduces food waste and grocery spending by helping users turn existing ingredients into meals before items expire.

**What makes it different?**

It is not a prompt wrapper. It is an end-to-end kitchen workflow with scanning, review, pantry state, recipe generation, cooking steps, used-up tracking, analytics, and impact reporting.

**What is working now?**

The Expo app, API, scan flow, pantry confirmation, recipe generation, recipe detail, cook mode, used-up ingredient tracking, profile metrics, tester feedback, impact summary, RocketRide pipeline files, Google Gemini integration, and readiness checks are implemented.
