import './loadEnv';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { z } from 'zod';
import { AiServiceUnavailableError } from './services/aiErrors';
import { extractIngredientsFromImage } from './services/ingredientExtraction';
import { generateRecipes, getRecipeById } from './services/recipeGeneration';
import { usageEventNames, usageEventStore } from './services/usageEvents';
import { pantryStore } from './services/pantryStore';
import { feedbackStore } from './services/feedbackStore';
import { createImpactSummary } from './services/impactSummary';
import { createSystemStatus } from './services/systemStatus';
import fs from 'node:fs';
import path from 'node:path';

const envToLogger: Record<string, object | boolean> = {
  development: {
    transport: {
      target: 'pino-pretty',
      options: { translateTime: 'HH:MM:ss Z', ignore: 'pid,hostname' },
    },
  },
  production: true,
  test: false,
};

const detectRequestSchema = z.object({
  image: z.string().min(1),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  confidence: z.number().min(0).max(1).optional(),
  maxDetections: z.number().int().min(1).max(50).optional(),
});

const recipeSearchQuerySchema = z.object({
  ingredients: z.string().min(1),
  dietary: z.string().optional(),
  maxCookTime: z.coerce.number().int().positive().optional(),
  cuisineType: z.string().min(1).optional(),
  difficulty: z.string().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

const usageEventSchema = z.object({
  anonymousId: z.string().trim().min(1).max(120),
  eventName: z.enum(usageEventNames),
  properties: z.record(z.string(), z.unknown()).optional(),
});

const addPantryItemSchema = z.object({
  name: z.string().trim().min(1),
  displayName: z.string().trim().min(1).optional(),
  category: z.string().trim().min(1),
  subcategory: z.string().trim().min(1).optional(),
  quantity: z.number().positive().optional(),
  unit: z.string().trim().min(1).optional(),
  detectionSource: z.enum(['camera_vision', 'barcode_scan', 'manual_entry', 'receipt_ocr']).optional(),
  confidenceScore: z.number().min(0).max(1).optional(),
  barcode: z.string().trim().min(1).optional(),
  brand: z.string().trim().min(1).optional(),
  imageUrl: z.string().trim().min(1).optional(),
  expiryDate: z.string().trim().min(1).optional(),
  nutritionPer100g: z.object({
    calories: z.number(),
    protein: z.number(),
    fat: z.number(),
    carbs: z.number(),
    fiber: z.number(),
    sodium: z.number(),
  }).optional(),
});

const updatePantryItemSchema = z.object({
  name: z.string().trim().min(1).optional(),
  quantity: z.number().positive().optional(),
  unit: z.string().trim().min(1).optional(),
  status: z.enum(['fresh', 'expiring_soon', 'expired', 'used_up']).optional(),
  expiryDate: z.string().trim().min(1).optional(),
});

const pantryListQuerySchema = z.object({
  category: z.string().trim().min(1).optional(),
  status: z.string().trim().min(1).optional(),
  sort: z.enum(['expiry', 'category', 'added', 'name']).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

const expiringQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).optional(),
});

const feedbackSchema = z.object({
  anonymousId: z.string().trim().min(1).max(120),
  rating: z.number().int().min(1).max(5),
  wouldUseAgain: z.boolean(),
  mostUseful: z.string().trim().max(500).optional(),
  friction: z.string().trim().max(500).optional(),
});

export async function buildApp() {
  const env = process.env.NODE_ENV ?? 'development';

  const app = Fastify({
    logger: envToLogger[env] ?? true,
  });

  // Core plugins
  await app.register(cors, { origin: true, credentials: true });

  await app.register(swagger, {
    openapi: {
      info: {
        title: 'KitchenScan API',
        description: 'Kitchen photo scanning, RocketRide workflows, and Gemini recipe generation',
        version: '0.1.0',
      },
      servers: [{ url: 'http://localhost:3001', description: 'Development' }],
    },
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: { docExpansion: 'list', deepLinking: true },
  });

  app.get('/health', async () => {
    return {
      status: 'ok',
      service: 'kitchenscan-api',
      timestamp: new Date().toISOString(),
    };
  });

  app.get('/requirements', async () => {
    return {
      data: {
        app: 'KitchenScan',
        hackathon: 'Build with AI',
        rocketride: {
          required: true,
          plannedPipelines: ['extract-ingredients.pipe', 'generate-recipes.pipe'],
        },
        google: {
          required: true,
          product: 'Gemini on Google Cloud / Vertex AI',
        },
      },
    };
  });

  app.get('/system/status', async () => {
    const host = process.env.HOST ?? '0.0.0.0';
    const port = process.env.PORT ?? '3001';
    const pipelinePaths = [
      process.env.KITCHENSCAN_EXTRACT_PIPELINE
        ?? path.resolve(process.cwd(), '../../pipelines/extract-ingredients.pipe'),
      process.env.KITCHENSCAN_RECIPE_PIPELINE
        ?? path.resolve(process.cwd(), '../../pipelines/generate-recipes.pipe'),
    ];

    return {
      data: createSystemStatus({
        env: process.env,
        apiBaseUrl: `http://${host}:${port}`,
        pipelines: pipelinePaths.map((pipelinePath) => ({
          name: path.basename(pipelinePath),
          exists: fs.existsSync(pipelinePath),
        })),
      }),
    };
  });

  app.post('/usage/events', async (request, reply) => {
    const parsed = usageEventSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Usage events require anonymousId and a supported eventName.',
        statusCode: 400,
      });
    }

    const event = usageEventStore.record(parsed.data);
    return reply.status(201).send({ data: event });
  });

  app.get('/usage/summary', async () => {
    return { data: usageEventStore.summary() };
  });

  app.post('/feedback', async (request, reply) => {
    const parsed = feedbackSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Feedback requires an anonymous tester id, rating from 1-5, and wouldUseAgain.',
        statusCode: 400,
      });
    }

    return reply.status(201).send({ data: feedbackStore.record(parsed.data) });
  });

  app.get('/feedback/summary', async () => {
    return { data: feedbackStore.summary() };
  });

  app.get('/impact/summary', async () => {
    return {
      data: createImpactSummary({
        totalPantryItems: pantryStore.summary().totalItems,
        expiringItemCount: pantryStore.expiring(3).length,
        usage: usageEventStore.summary(),
        feedback: feedbackStore.summary(),
      }),
    };
  });

  app.get('/pantry/items', async (request) => {
    const query = pantryListQuerySchema.parse(request.query);
    const filters = {
      category: query.category,
      status: query.status,
      sort: query.sort,
      limit: query.limit ?? 100,
      offset: query.offset ?? 0,
    };

    return {
      data: pantryStore.list(filters),
      meta: {
        total: pantryStore.count(filters),
        limit: filters.limit,
        offset: filters.offset,
      },
    };
  });

  app.post('/pantry/items', async (request, reply) => {
    const parsed = addPantryItemSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Pantry items require a name, category, and positive quantity when provided.',
        statusCode: 400,
      });
    }

    return reply.status(201).send({ data: pantryStore.add(parsed.data) });
  });

  app.post('/pantry/items/batch', async (request, reply) => {
    const parsed = z.array(addPantryItemSchema).min(1).safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Batch pantry add requires at least one valid pantry item.',
        statusCode: 400,
      });
    }

    const items = pantryStore.addBatch(parsed.data);
    return reply.status(201).send({
      data: items,
      meta: { count: items.length },
    });
  });

  app.get('/pantry/summary', async () => {
    return { data: pantryStore.summary() };
  });

  app.get('/pantry/expiring', async (request) => {
    const query = expiringQuerySchema.parse(request.query);
    return { data: pantryStore.expiring(query.days ?? 3) };
  });

  app.patch('/pantry/items/:id', async (request, reply) => {
    const params = request.params as { id?: string };
    const parsed = updatePantryItemSchema.safeParse(request.body);
    if (!params.id || !parsed.success) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'A valid pantry item update is required.',
        statusCode: 400,
      });
    }

    const updated = pantryStore.update(params.id, parsed.data);
    if (!updated) {
      return reply.status(404).send({
        error: 'Not Found',
        message: 'Pantry item was not found.',
        statusCode: 404,
      });
    }

    return { data: updated };
  });

  app.delete('/pantry/items/:id', async (request, reply) => {
    const params = request.params as { id?: string };
    if (!params.id || !pantryStore.delete(params.id)) {
      return reply.status(404).send({
        error: 'Not Found',
        message: 'Pantry item was not found.',
        statusCode: 404,
      });
    }

    return reply.status(204).send();
  });

  app.post('/detect', async (request, reply) => {
    const parsed = detectRequestSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'A base64 image is required for ingredient detection.',
        statusCode: 400,
      });
    }

    const startedAt = Date.now();
    const input = parsed.data;
    const imageSize = {
      width: input.width ?? 1024,
      height: input.height ?? 768,
    };

    let result: Awaited<ReturnType<typeof extractIngredientsFromImage>>;
    try {
      result = await extractIngredientsFromImage({
        image: stripDataUriPrefix(input.image),
        imageSize,
        minConfidence: input.confidence ?? 0.45,
        maxDetections: input.maxDetections ?? 20,
      });
    } catch (error) {
      if (error instanceof AiServiceUnavailableError) {
        return reply.status(error.statusCode).send({
          error: 'Service Unavailable',
          code: error.code,
          message: error.message,
          statusCode: error.statusCode,
        });
      }
      throw error;
    }

    return {
      data: {
        detections: result.detections,
        count: result.detections.length,
        latencyMs: Date.now() - startedAt,
        modelVersion: result.modelVersion,
        source: 'cloud' as const,
        imageSize,
        pipeline: result.pipeline,
      },
    };
  });

  app.get('/recipes/search', async (request, reply) => {
    const parsed = recipeSearchQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'At least one pantry ingredient is required for recipe generation.',
        statusCode: 400,
      });
    }

    const query = parsed.data;
    const ingredients = query.ingredients.split(',').map((ingredient) => ingredient.trim()).filter(Boolean);
    if (ingredients.length === 0) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'At least one pantry ingredient is required for recipe generation.',
        statusCode: 400,
      });
    }

    let result: Awaited<ReturnType<typeof generateRecipes>>;
    try {
      result = await generateRecipes({
        ingredients,
        dietary: query.dietary?.split(',').filter(Boolean),
        maxCookTime: query.maxCookTime,
        cuisineType: query.cuisineType,
        difficulty: query.difficulty,
        limit: query.limit ?? 20,
        offset: query.offset ?? 0,
      });
    } catch (error) {
      if (error instanceof AiServiceUnavailableError) {
        return reply.status(error.statusCode).send({
          error: 'Service Unavailable',
          code: error.code,
          message: error.message,
          statusCode: error.statusCode,
        });
      }
      throw error;
    }

    return {
      data: {
        recipes: result.recipes.map((recipe) => ({
          id: recipe.id,
          title: recipe.title,
          description: recipe.description,
          imageUrl: recipe.imageUrl,
          cookTimeMinutes: recipe.cookTimeMinutes,
          prepTimeMinutes: recipe.prepTimeMinutes,
          totalTimeMinutes: recipe.totalTimeMinutes,
          servings: recipe.servings,
          difficulty: recipe.difficulty,
          cuisineType: recipe.cuisineType,
          mealType: recipe.mealType,
          dietaryTags: recipe.dietaryTags,
          allergenWarnings: recipe.allergenWarnings,
          matchScore: recipe.matchScore,
          matchedIngredients: recipe.matchedIngredients,
          missingIngredients: recipe.missingIngredients,
          totalIngredients: recipe.totalIngredients,
          substituteCount: recipe.substituteCount,
        })),
        total: result.total,
        offset: result.offset,
        limit: result.limit,
        pipeline: result.pipeline,
      },
    };
  });

  app.get('/recipes/:id', async (request, reply) => {
    const params = request.params as { id?: string };
    const recipe = params.id ? getRecipeById(params.id) : undefined;

    if (!recipe) {
      return reply.status(404).send({
        error: 'Not Found',
        message: 'Recipe detail was not generated in this session.',
        statusCode: 404,
      });
    }

    return { data: recipe };
  });

  return app;
}

function stripDataUriPrefix(image: string) {
  const commaIndex = image.indexOf(',');
  return commaIndex >= 0 ? image.slice(commaIndex + 1) : image;
}

async function start() {
  const app = await buildApp();
  const port = parseInt(process.env.PORT ?? '3001', 10);
  const host = process.env.HOST ?? '0.0.0.0';

  try {
    await app.listen({ port, host });
    app.log.info(`Server running at http://${host}:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

// Only auto-start when run directly (not when imported for tests)
const isMainModule = process.argv[1]?.endsWith('server.ts') || process.argv[1]?.endsWith('server.js');
if (isMainModule) {
  start();
}
