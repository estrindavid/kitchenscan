import { describe, expect, it } from 'vitest';
import { createUsageEventStore } from './usageEvents';

describe('usage event store', () => {
  it('records anonymous product events and summarizes the user funnel', () => {
    const store = createUsageEventStore();

    store.record({
      anonymousId: 'user-a',
      eventName: 'scan_started',
      properties: { source: 'camera' },
    });
    store.record({
      anonymousId: 'user-a',
      eventName: 'pantry_items_saved',
      properties: { itemCount: 3 },
    });
    store.record({
      anonymousId: 'user-b',
      eventName: 'recipe_viewed',
      properties: { recipeId: 'ai-1' },
    });

    expect(store.summary()).toEqual({
      totalEvents: 3,
      uniqueUsers: 2,
      eventsByName: {
        pantry_items_saved: 1,
        recipe_viewed: 1,
        scan_started: 1,
      },
      funnel: {
        scan_started: 1,
        pantry_items_saved: 1,
        recipe_search_viewed: 0,
        recipe_viewed: 1,
      },
    });
  });
});
