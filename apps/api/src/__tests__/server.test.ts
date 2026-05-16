import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../server';

let app: FastifyInstance;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  app = await buildApp();
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

describe('KitchenScan API shell', () => {
  it('returns health metadata', async () => {
    const res = await app.inject({ method: 'GET', url: '/health' });
    const body = JSON.parse(res.body) as {
      status: string;
      service: string;
      timestamp?: string;
    };

    expect(res.statusCode).toBe(200);
    expect(body.status).toBe('ok');
    expect(body.service).toBe('kitchenscan-api');
    expect(body.timestamp).toBeDefined();
  });

  it('documents RocketRide and Google product requirements', async () => {
    const res = await app.inject({ method: 'GET', url: '/requirements' });
    const body = JSON.parse(res.body) as {
      data: {
        rocketride: { required: boolean; plannedPipelines: string[] };
        google: { required: boolean; product: string };
      };
    };

    expect(res.statusCode).toBe(200);
    expect(body.data.rocketride.required).toBe(true);
    expect(body.data.rocketride.plannedPipelines).toContain('extract-ingredients.pipe');
    expect(body.data.rocketride.plannedPipelines).toContain('generate-recipes.pipe');
    expect(body.data.google.required).toBe(true);
    expect(body.data.google.product).toContain('Gemini');
  });

  it('serves OpenAPI JSON under /docs/json', async () => {
    const res = await app.inject({ method: 'GET', url: '/docs/json' });
    const body = JSON.parse(res.body) as { openapi?: string; info?: { title?: string } };

    expect(res.statusCode).toBe(200);
    expect(body.openapi).toBeDefined();
    expect(body.info?.title).toBe('KitchenScan API');
  });
});
