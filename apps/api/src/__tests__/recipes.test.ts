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

describe('recipe generation routes', () => {
  it('returns pantry-aware generated recipe cards', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/recipes/search?ingredients=tomatoes,eggs,milk&limit=3',
    });
    const body = JSON.parse(res.body) as {
      data: {
        recipes: Array<{
          id: string;
          title: string;
          matchScore: number;
          matchedIngredients: string[];
          totalIngredients: number;
        }>;
        total: number;
        offset: number;
        limit: number;
        pipeline: { provider: string; name: string; usedFallback: boolean };
      };
    };

    expect(res.statusCode).toBe(200);
    expect(body.data.pipeline.name).toBe('generate-recipes.pipe');
    expect(body.data.pipeline.provider).toContain('RocketRide');
    expect(body.data.recipes.length).toBeGreaterThan(0);
    expect(body.data.recipes.length).toBeLessThanOrEqual(3);
    expect(body.data.recipes[0]?.matchedIngredients).toContain('tomatoes');
    expect(body.data.recipes[0]?.matchScore).toBeGreaterThan(0);
    expect(body.data.total).toBeGreaterThanOrEqual(body.data.recipes.length);
    expect(body.data.offset).toBe(0);
    expect(body.data.limit).toBe(3);
  });

  it('returns a cookable recipe detail after search', async () => {
    const searchRes = await app.inject({
      method: 'GET',
      url: '/recipes/search?ingredients=rice,chicken,soy%20sauce&limit=1',
    });
    const searchBody = JSON.parse(searchRes.body) as { data: { recipes: Array<{ id: string }> } };
    const recipeId = searchBody.data.recipes[0]?.id;

    const detailRes = await app.inject({
      method: 'GET',
      url: `/recipes/${recipeId}`,
    });
    const detailBody = JSON.parse(detailRes.body) as {
      data: {
        id: string;
        source: string;
        ingredients: unknown[];
        steps: unknown[];
      };
    };

    expect(detailRes.statusCode).toBe(200);
    expect(detailBody.data.id).toBe(recipeId);
    expect(detailBody.data.source).toBe('ai_generated');
    expect(detailBody.data.ingredients.length).toBeGreaterThan(0);
    expect(detailBody.data.steps.length).toBeGreaterThan(0);
  });

  it('still returns recipes when a cuisine preference does not exactly match generated cuisine labels', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/recipes/search?ingredients=tomatoes,eggs,milk&cuisineType=Italian&limit=3',
    });
    const body = JSON.parse(res.body) as {
      data: {
        recipes: Array<{ id: string; title: string }>;
        total: number;
      };
    };

    expect(res.statusCode).toBe(200);
    expect(body.data.recipes.length).toBeGreaterThan(0);
    expect(body.data.total).toBeGreaterThan(0);
  });

  it('requires at least one ingredient for recipe search', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/recipes/search',
    });

    expect(res.statusCode).toBe(400);
  });
});
