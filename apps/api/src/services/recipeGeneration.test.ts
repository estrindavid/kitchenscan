import { describe, expect, it } from 'vitest';
import { buildFallbackRecipes, normalizeGeneratedRecipes } from './recipeGeneration';

describe('recipe generation helpers', () => {
  it('normalizes Gemini-style recipes into app recipe details', () => {
    const recipes = normalizeGeneratedRecipes(
      [
        {
          title: 'Tomato Egg Skillet',
          description: 'Fast pantry dinner.',
          servings: 2,
          difficulty: 'easy',
          cuisineType: 'Mediterranean',
          totalTimeMinutes: 18,
          ingredients: [
            { name: 'tomatoes', displayText: '2 tomatoes', matched: true },
            { name: 'eggs', displayText: '3 eggs', matched: true },
            { name: 'feta', displayText: '2 tbsp feta', optional: true },
          ],
          steps: ['Chop tomatoes.', 'Simmer tomatoes and crack in eggs.'],
        },
      ],
      ['tomatoes', 'eggs'],
    );

    expect(recipes).toHaveLength(1);
    expect(recipes[0]?.source).toBe('ai_generated');
    expect(recipes[0]?.difficulty).toBe('beginner');
    expect(recipes[0]?.matchScore).toBe(67);
    expect(recipes[0]?.matchedIngredients).toEqual(['tomatoes', 'eggs']);
    expect(recipes[0]?.missingIngredients).toEqual([
      { name: 'feta', isOptional: true },
    ]);
    expect(recipes[0]?.ingredients?.[0]?.displayText).toBe('2 tomatoes');
    expect(recipes[0]?.steps[1]?.instruction).toBe('Simmer tomatoes and crack in eggs.');
  });

  it('builds deterministic fallback recipes from pantry ingredients', () => {
    const recipes = buildFallbackRecipes(['tomatoes', 'eggs', 'milk']);

    expect(recipes.length).toBeGreaterThanOrEqual(2);
    expect(recipes[0]?.title).toContain('Tomatoes');
    expect(recipes[0]?.matchedIngredients).toContain('tomatoes');
    expect(recipes[0]?.pipeline.usedFallback).toBe(true);
  });
});
