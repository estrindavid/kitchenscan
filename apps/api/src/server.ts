import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { z } from 'zod';
import { extractIngredientsFromImage } from './services/ingredientExtraction';

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

    const result = await extractIngredientsFromImage({
      image: stripDataUriPrefix(input.image),
      imageSize,
      minConfidence: input.confidence ?? 0.45,
      maxDetections: input.maxDetections ?? 20,
    });

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
