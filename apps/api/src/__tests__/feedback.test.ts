import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../server';
import { feedbackStore } from '../services/feedbackStore';

let app: FastifyInstance;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  app = await buildApp();
  await app.ready();
});

beforeEach(() => {
  feedbackStore.reset();
});

afterAll(async () => {
  await app.close();
});

describe('feedback routes', () => {
  it('accepts anonymous tester feedback and returns a validation summary', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/feedback',
      payload: {
        anonymousId: 'tester-1',
        rating: 5,
        wouldUseAgain: true,
        mostUseful: 'Recipes from my scanned pantry',
        friction: 'Camera took a second',
      },
    });

    expect(res.statusCode).toBe(201);

    const summaryRes = await app.inject({ method: 'GET', url: '/feedback/summary' });
    const body = JSON.parse(summaryRes.body) as {
      data: {
        totalFeedback: number;
        uniqueTesters: number;
        averageRating: number;
        wouldUseAgainRate: number;
      };
    };

    expect(summaryRes.statusCode).toBe(200);
    expect(body.data.totalFeedback).toBe(1);
    expect(body.data.uniqueTesters).toBe(1);
    expect(body.data.averageRating).toBe(5);
    expect(body.data.wouldUseAgainRate).toBe(100);
  });

  it('rejects invalid feedback payloads', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/feedback',
      payload: {
        anonymousId: '',
        rating: 9,
        wouldUseAgain: true,
      },
    });

    expect(res.statusCode).toBe(400);
  });
});
