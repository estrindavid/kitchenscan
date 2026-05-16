import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { trackEvent } from '../services/analytics';
import type { Recipe, Ingredient } from '@kitchenscan/shared';
import { SEED_RECIPES } from '../data/seedRecipes';

export interface MissingIngredient {
  name: string;
  isOptional: boolean;
  substitute?: { name: string; notes: string; matchScore: number };
}

export interface RecipeSearchResult {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  cookTimeMinutes?: number;
  prepTimeMinutes?: number;
  totalTimeMinutes?: number;
  servings: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  cuisineType?: string;
  mealType?: string;
  dietaryTags: string[];
  allergenWarnings: string[];
  matchScore: number;
  matchedIngredients: string[];
  missingIngredients: MissingIngredient[];
  totalIngredients: number;
  substituteCount: number;
}

export interface RecipeDetail extends Recipe {
  ingredients: Ingredient[];
}

function computeLocalMatches(
  ingredientNames: string[],
  filters: RecipeSearchFilters,
): RecipeSearchResponse {
  const pantrySet = new Set(ingredientNames.map((n) => n.toLowerCase()));

  let results: RecipeSearchResult[] = SEED_RECIPES.map((recipe) => {
    const nonGarnish = recipe.ingredients.filter((i) => !i.isGarnish);
    const matched = nonGarnish.filter((i) => pantrySet.has(i.canonicalName.toLowerCase()));
    const missing = nonGarnish.filter((i) => !pantrySet.has(i.canonicalName.toLowerCase()));
    const total = nonGarnish.length || 1;
    const matchScore = Math.round((matched.length / total) * 100);

    return {
      id: recipe.id,
      title: recipe.title,
      description: recipe.description,
      imageUrl: recipe.imageUrl,
      cookTimeMinutes: recipe.cookTimeMinutes,
      prepTimeMinutes: recipe.prepTimeMinutes,
      totalTimeMinutes: recipe.totalTimeMinutes,
      servings: recipe.servings,
      difficulty: recipe.difficulty,
      cuisineType: recipe.cuisineType,
      mealType: recipe.mealType,
      dietaryTags: recipe.dietaryTags,
      allergenWarnings: recipe.allergenWarnings,
      matchScore,
      matchedIngredients: matched.map((i) => i.canonicalName),
      missingIngredients: missing.map((i) => ({ name: i.canonicalName, isOptional: i.isOptional })),
      totalIngredients: total,
      substituteCount: 0,
    };
  });

  if (filters.difficulty) {
    results = results.filter((r) => r.difficulty === filters.difficulty);
  }
  if (filters.cuisineType) {
    results = results.filter((r) => r.cuisineType === filters.cuisineType);
  }
  if (filters.maxCookTime) {
    results = results.filter((r) => !r.totalTimeMinutes || r.totalTimeMinutes <= filters.maxCookTime!);
  }

  results.sort((a, b) => b.matchScore - a.matchScore);

  const offset = filters.offset ?? 0;
  const limit = filters.limit ?? 20;
  const paginated = results.slice(offset, offset + limit);

  return { recipes: paginated, total: results.length, offset, limit };
}

interface RecipeSearchFilters {
  dietary?: string[];
  maxCookTime?: number;
  cuisineType?: string;
  difficulty?: string;
  limit?: number;
  offset?: number;
}

interface RecipeSearchResponse {
  recipes: RecipeSearchResult[];
  total: number;
  offset: number;
  limit: number;
}

export function useRecipeSearch(
  ingredientNames: string[],
  filters: RecipeSearchFilters = {},
) {
  return useQuery({
    queryKey: ['recipes', 'search', ingredientNames, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (ingredientNames.length > 0) {
        params.set('ingredients', ingredientNames.join(','));
      }
      if (filters.dietary?.length) params.set('dietary', filters.dietary.join(','));
      if (filters.maxCookTime) params.set('maxCookTime', String(filters.maxCookTime));
      if (filters.cuisineType) params.set('cuisineType', filters.cuisineType);
      if (filters.difficulty) params.set('difficulty', filters.difficulty);
      if (filters.limit) params.set('limit', String(filters.limit));
      if (filters.offset) params.set('offset', String(filters.offset));

      try {
        const { data } = await api.get<{ data: RecipeSearchResponse }>(
          `/recipes/search?${params}`,
        );
        void trackEvent('recipe_search_viewed', {
          pantryItemCount: ingredientNames.length,
          recipeCount: data.data.recipes.length,
          source: 'api',
        });
        return data.data;
      } catch {
        const fallback = computeLocalMatches(ingredientNames, filters);
        void trackEvent('recipe_search_viewed', {
          pantryItemCount: ingredientNames.length,
          recipeCount: fallback.recipes.length,
          source: 'local_fallback',
        });
        return fallback;
      }
    },
    enabled: ingredientNames.length > 0,
    staleTime: 1000 * 60 * 5,
  });
}

export function useRecipe(id: string | null) {
  return useQuery({
    queryKey: ['recipes', 'detail', id],
    queryFn: async () => {
      const { data } = await api.get<{ data: RecipeDetail }>(`/recipes/${id}`);
      return data.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 30,
  });
}
