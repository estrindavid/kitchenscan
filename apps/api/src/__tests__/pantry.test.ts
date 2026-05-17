import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../server';
import { pantryStore } from '../services/pantryStore';

let app: FastifyInstance;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  app = await buildApp();
  await app.ready();
});

beforeEach(() => {
  pantryStore.reset();
});

afterAll(async () => {
  await app.close();
});

describe('pantry routes', () => {
  it('supports batch add, list, summary, and expiring items', async () => {
    const batchRes = await app.inject({
      method: 'POST',
      url: '/pantry/items/batch',
      payload: [
        {
          name: 'tomato',
          category: 'produce',
          quantity: 3,
          unit: 'piece',
          detectionSource: 'camera_vision',
        },
        {
          name: 'milk',
          category: 'dairy',
          quantity: 1,
          unit: 'carton',
          expiryDate: new Date(Date.now() + 2 * 86_400_000).toISOString(),
        },
      ],
    });
    const batchBody = JSON.parse(batchRes.body) as { data: unknown[]; meta: { count: number } };

    expect(batchRes.statusCode).toBe(201);
    expect(batchBody.data).toHaveLength(2);
    expect(batchBody.meta.count).toBe(2);

    const listRes = await app.inject({ method: 'GET', url: '/pantry/items?sort=name' });
    const listBody = JSON.parse(listRes.body) as { data: Array<{ name: string }>; meta: { total: number } };

    expect(listRes.statusCode).toBe(200);
    expect(listBody.data.map((item) => item.name)).toEqual(['milk', 'tomato']);
    expect(listBody.meta.total).toBe(2);

    const summaryRes = await app.inject({ method: 'GET', url: '/pantry/summary' });
    const summaryBody = JSON.parse(summaryRes.body) as { data: { totalItems: number } };
    expect(summaryBody.data.totalItems).toBe(2);

    const expiringRes = await app.inject({ method: 'GET', url: '/pantry/expiring?days=3' });
    const expiringBody = JSON.parse(expiringRes.body) as { data: Array<{ name: string }> };
    expect(expiringBody.data.map((item) => item.name)).toEqual(['milk']);
  });

  it('supports single add, update, and delete', async () => {
    const addRes = await app.inject({
      method: 'POST',
      url: '/pantry/items',
      payload: {
        name: 'rice',
        category: 'grains',
        quantity: 1,
        unit: 'bag',
      },
    });
    const addBody = JSON.parse(addRes.body) as { data: { id: string; quantity: number } };

    expect(addRes.statusCode).toBe(201);
    expect(addBody.data.quantity).toBe(1);

    const patchRes = await app.inject({
      method: 'PATCH',
      url: `/pantry/items/${addBody.data.id}`,
      payload: { quantity: 2, status: 'used_up' },
    });
    const patchBody = JSON.parse(patchRes.body) as { data: { quantity: number; status: string; usedAt?: string } };

    expect(patchRes.statusCode).toBe(200);
    expect(patchBody.data.quantity).toBe(2);
    expect(patchBody.data.status).toBe('used_up');
    expect(patchBody.data.usedAt).toBeTruthy();

    const zeroRes = await app.inject({
      method: 'PATCH',
      url: `/pantry/items/${addBody.data.id}`,
      payload: { quantity: 0 },
    });
    const zeroBody = JSON.parse(zeroRes.body) as { data: { quantity: number; status: string; usedAt?: string } };

    expect(zeroRes.statusCode).toBe(200);
    expect(zeroBody.data.quantity).toBe(0);
    expect(zeroBody.data.status).toBe('used_up');
    expect(zeroBody.data.usedAt).toBeTruthy();

    const deleteRes = await app.inject({
      method: 'DELETE',
      url: `/pantry/items/${addBody.data.id}`,
    });

    expect(deleteRes.statusCode).toBe(204);

    const listRes = await app.inject({ method: 'GET', url: '/pantry/items' });
    const listBody = JSON.parse(listRes.body) as { data: unknown[] };
    expect(listBody.data).toEqual([]);
  });

  it('rejects invalid pantry items', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/pantry/items',
      payload: { name: '', category: '', quantity: 0 },
    });

    expect(res.statusCode).toBe(400);
  });
});
