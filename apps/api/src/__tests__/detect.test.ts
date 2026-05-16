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

describe('POST /detect', () => {
  it('returns a RocketRide/Gemini-shaped detection payload for the mobile scanner', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/detect',
      payload: {
        image: 'data:image/jpeg;base64,a2l0Y2hlbi1zY2Fu',
        width: 1280,
        height: 720,
        confidence: 0.45,
        maxDetections: 5,
      },
    });
    const body = JSON.parse(res.body) as {
      data: {
        detections: Array<{ label: string; confidence: number; boundingBox: { width: number } }>;
        count: number;
        latencyMs: number;
        modelVersion: string;
        source: string;
        imageSize: { width: number; height: number };
        pipeline: { provider: string; name: string; usedFallback: boolean };
      };
    };

    expect(res.statusCode).toBe(200);
    expect(body.data.source).toBe('cloud');
    expect(body.data.imageSize).toEqual({ width: 1280, height: 720 });
    expect(body.data.pipeline.name).toBe('extract-ingredients.pipe');
    expect(body.data.pipeline.provider).toContain('RocketRide');
    expect(body.data.detections.length).toBeGreaterThan(0);
    expect(body.data.count).toBe(body.data.detections.length);
    expect(body.data.latencyMs).toBeGreaterThanOrEqual(0);
    expect(body.data.modelVersion).toContain('gemini');
    expect(body.data.detections[0]?.boundingBox.width).toBeGreaterThan(0);
  });

  it('rejects requests without an image', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/detect',
      payload: {},
    });

    expect(res.statusCode).toBe(400);
  });
});
