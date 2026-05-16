import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

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

  return app;
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
