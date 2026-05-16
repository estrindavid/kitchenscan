import { describe, expect, it } from 'vitest';
import { createImpactSummary } from './impactSummary';

describe('impact summary', () => {
  it('turns pantry, usage, and feedback stats into pitch-ready impact metrics', () => {
    const summary = createImpactSummary({
      totalPantryItems: 12,
      expiringItemCount: 3,
      usage: {
        totalEvents: 9,
        uniqueUsers: 4,
        eventsByName: {
          scan_started: 4,
          pantry_items_saved: 3,
          recipe_search_viewed: 2,
          recipe_viewed: 1,
        },
        funnel: {
          scan_started: 4,
          pantry_items_saved: 3,
          recipe_search_viewed: 2,
          recipe_viewed: 1,
        },
      },
      feedback: {
        totalFeedback: 5,
        uniqueTesters: 4,
        averageRating: 4.6,
        wouldUseAgainCount: 4,
        wouldUseAgainRate: 80,
        recent: [],
      },
    });

    expect(summary).toEqual({
      totalPantryItems: 12,
      expiringItemCount: 3,
      estimatedMealsAvailable: 4,
      estimatedMealsRescuable: 3,
      estimatedGrocerySavingsDollars: 17,
      scanToRecipeConversionRate: 50,
      recipeViewRate: 50,
      testerAverageRating: 4.6,
      testerWouldUseAgainRate: 80,
      validationReadiness: 'demo_ready',
      highlights: [
        '4 meals can be planned from scanned pantry items.',
        '3 expiring items are ready to rescue before they become waste.',
        '$17 in groceries could be stretched from the current pantry.',
        '80% of testers said they would use KitchenScan again.',
      ],
    });
  });

  it('handles empty validation data without dividing by zero', () => {
    const summary = createImpactSummary({
      totalPantryItems: 0,
      expiringItemCount: 0,
      usage: {
        totalEvents: 0,
        uniqueUsers: 0,
        eventsByName: {},
        funnel: {
          scan_started: 0,
          pantry_items_saved: 0,
          recipe_search_viewed: 0,
          recipe_viewed: 0,
        },
      },
      feedback: {
        totalFeedback: 0,
        uniqueTesters: 0,
        averageRating: 0,
        wouldUseAgainCount: 0,
        wouldUseAgainRate: 0,
        recent: [],
      },
    });

    expect(summary.scanToRecipeConversionRate).toBe(0);
    expect(summary.recipeViewRate).toBe(0);
    expect(summary.validationReadiness).toBe('needs_testers');
    expect(summary.highlights[0]).toBe('Scan pantry items to unlock meal and savings estimates.');
  });
});
