import { useFavoritesStore } from '../stores/favoritesStore';
import type { RecipeSearchResult, RecipeDetail } from '../hooks/useRecipes';

export function useFavorites() {
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const isFavorite = useFavoritesStore((s) => s.isFavorite);
  return { toggleFavorite, isFavorite };
}

export function useFavoriteRecipes(): RecipeSearchResult[] {
  const favoriteRecipes = useFavoritesStore((s) => s.favoriteRecipes);
  return Object.values(favoriteRecipes);
}

export function recipeDetailToSearchResult(recipe: RecipeDetail): RecipeSearchResult {
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
    matchScore: 0,
    matchedIngredients: [],
    missingIngredients: [],
    totalIngredients: recipe.ingredients?.length ?? 0,
    substituteCount: 0,
  };
}
