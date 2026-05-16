import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../server';
import { feedbackStore } from '../services/feedbackStore';
import { pantryStore } from '../services/pantryStore';
import { usageEventStore } from '../services/usageEvents';

let app: FastifyInstance;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  app = await buildApp();
  await app.ready();
});

beforeEach(() => {
  feedbackStore.reset();
  pantryStore.reset();
  usageEventStore.reset();
});

afterAll(async () => {
  await app.close();
});

describe('impact routes', () => {
  it('returns one summary for pantry impact, validation, and tester sentiment', async () => {
    const tomorrow = new Date(Date.now() + 86_400_000).toISOString();

    pantryStore.addBatch([
      { name: 'basil', category: 'produce', expiryDate: tomorrow },
      { name: 'cream', category: 'dairy', expiryDate: tomorrow },
      { name: 'rice', category: 'grains' },
      { name: 'eggs', category: 'protein' },
      { name: 'tomatoes', category: 'produce' },
      { name: 'pasta', category: 'grains' },
    ]);

    usageEventStore.record({ anonymousId: 'tester-1', eventName: 'scan_started' });
    usageEventStore.record({ anonymousId: 'tester-1', eventName: 'recipe_search_viewed' });
    usageEventStore.record({ anonymousId: 'tester-1', eventName: 'recipe_viewed' });
    usageEventStore.record({ anonymousId: 'tester-2', eventName: 'scan_started' });

    feedbackStore.record({ anonymousId: 'tester-1', rating: 5, wouldUseAgain: true });
    feedbackStore.record({ anonymousId: 'tester-2', rating: 4, wouldUseAgain: true });

    const res = await app.inject({ method: 'GET', url: '/impact/summary' });
    const body = JSON.parse(res.body) as {
      data: {
        totalPantryItems: number;
        expiringItemCount: number;
        estimatedMealsAvailable: number;
        estimatedMealsRescuable: number;
        scanToRecipeConversionRate: number;
        testerAverageRating: number;
        testerWouldUseAgainRate: number;
        validationReadiness: string;
      };
    };

    expect(res.statusCode).toBe(200);
    expect(body.data.totalPantryItems).toBe(6);
    expect(body.data.expiringItemCount).toBe(2);
    expect(body.data.estimatedMealsAvailable).toBe(2);
    expect(body.data.estimatedMealsRescuable).toBe(2);
    expect(body.data.scanToRecipeConversionRate).toBe(50);
    expect(body.data.testerAverageRating).toBe(4.5);
    expect(body.data.testerWouldUseAgainRate).toBe(100);
    expect(body.data.validationReadiness).toBe('promising');
  });
});
