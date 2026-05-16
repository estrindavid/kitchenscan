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

describe('usage tracking routes', () => {
  it('accepts anonymous usage events and exposes a pitch-ready summary', async () => {
    const eventRes = await app.inject({
      method: 'POST',
      url: '/usage/events',
      payload: {
        anonymousId: 'demo-user-1',
        eventName: 'scan_started',
        properties: { source: 'demo' },
      },
    });
    expect(eventRes.statusCode).toBe(201);

    await app.inject({
      method: 'POST',
      url: '/usage/events',
      payload: {
        anonymousId: 'demo-user-1',
        eventName: 'recipe_search_viewed',
        properties: { pantryItemCount: 4 },
      },
    });

    const summaryRes = await app.inject({ method: 'GET', url: '/usage/summary' });
    const body = JSON.parse(summaryRes.body) as {
      data: {
        totalEvents: number;
        uniqueUsers: number;
        eventsByName: Record<string, number>;
        funnel: Record<string, number>;
      };
    };

    expect(summaryRes.statusCode).toBe(200);
    expect(body.data.totalEvents).toBe(2);
    expect(body.data.uniqueUsers).toBe(1);
    expect(body.data.eventsByName.scan_started).toBe(1);
    expect(body.data.funnel.recipe_search_viewed).toBe(1);
  });

  it('rejects invalid usage events', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/usage/events',
      payload: {
        anonymousId: '',
        eventName: 'not_a_real_event',
      },
    });

    expect(res.statusCode).toBe(400);
  });
});
