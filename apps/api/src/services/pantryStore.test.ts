import { describe, expect, it } from 'vitest';
import { createPantryStore } from './pantryStore';

describe('pantry store', () => {
  it('adds pantry items with defaults and summarizes categories', () => {
    const store = createPantryStore();

    const tomato = store.add({
      name: 'tomato',
      category: 'produce',
      quantity: 3,
      unit: 'piece',
      detectionSource: 'camera_vision',
      confidenceScore: 0.9,
    });
    const milk = store.add({
      name: 'milk',
      category: 'dairy',
      quantity: 1,
      unit: 'carton',
      detectionSource: 'manual_entry',
      expiryDate: new Date(Date.now() + 2 * 86_400_000).toISOString(),
    });

    expect(tomato.id).toMatch(/^pantry-/);
    expect(tomato.status).toBe('fresh');
    expect(milk.status).toBe('expiring_soon');
    expect(store.summary()).toEqual({
      categories: [
        { category: 'dairy', count: 1, expiringCount: 1 },
        { category: 'produce', count: 1, expiringCount: 0 },
      ],
      totalItems: 2,
    });
  });

  it('updates, filters, sorts, and deletes pantry items', () => {
    const store = createPantryStore();
    const rice = store.add({ name: 'rice', category: 'grains', quantity: 1, unit: 'bag' });
    store.add({ name: 'eggs', category: 'protein', quantity: 12, unit: 'piece' });

    const updated = store.update(rice.id, { quantity: 2, status: 'used_up' });

    expect(updated?.quantity).toBe(2);
    expect(store.list({ status: 'used_up' }).map((item) => item.name)).toEqual(['rice']);
    expect(store.list({ sort: 'name' }).map((item) => item.name)).toEqual(['eggs', 'rice']);
    expect(store.delete(rice.id)).toBe(true);
    expect(store.list({}).map((item) => item.name)).toEqual(['eggs']);
  });

  it('marks items used up when quantity reaches zero and records usedAt', () => {
    const store = createPantryStore();
    const basil = store.add({ name: 'basil', category: 'produce', quantity: 1, unit: 'bunch' });

    const updated = store.update(basil.id, { quantity: 0 });

    expect(updated?.quantity).toBe(0);
    expect(updated?.status).toBe('used_up');
    expect(updated?.usedAt).toBeTruthy();
  });

  it('clears usedAt when restoring a used up item', () => {
    const store = createPantryStore();
    const basil = store.add({ name: 'basil', category: 'produce', quantity: 1, unit: 'bunch' });

    store.update(basil.id, { status: 'used_up' });
    const restored = store.update(basil.id, { status: 'fresh', quantity: 1 });

    expect(restored?.status).toBe('fresh');
    expect(restored?.usedAt).toBeUndefined();
  });
});
