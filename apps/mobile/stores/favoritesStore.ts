import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RecipeSearchResult } from '../hooks/useRecipes';

const STORAGE_KEY = 'kitchenscan_favorites';

interface FavoritesState {
  favoriteRecipes: Record<string, RecipeSearchResult>;
  toggleFavorite: (recipe: RecipeSearchResult) => void;
  isFavorite: (recipeId: string) => boolean;
  load: () => Promise<void>;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favoriteRecipes: {},

  toggleFavorite: (recipe) => {
    const current = get().favoriteRecipes;
    const next = { ...current };
    if (next[recipe.id]) {
      delete next[recipe.id];
    } else {
      next[recipe.id] = recipe;
    }
    set({ favoriteRecipes: next });
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  },

  isFavorite: (recipeId) => !!get().favoriteRecipes[recipeId],

  load: async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        set({ favoriteRecipes: JSON.parse(raw) });
      } catch {}
    }
  },
}));
