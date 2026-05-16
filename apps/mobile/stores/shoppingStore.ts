import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { MissingIngredient } from '../hooks/useRecipes';

const STORAGE_KEY = 'kitchenscan_shopping';

export interface ShoppingItem {
  id: string;
  name: string;
  quantity?: string;
  recipeId?: string;
  recipeTitle?: string;
  isPurchased: boolean;
}

interface ShoppingState {
  items: ShoppingItem[];
  addItem: (item: Omit<ShoppingItem, 'id' | 'isPurchased'>) => void;
  removeItem: (id: string) => void;
  togglePurchased: (id: string) => void;
  addMissingFromRecipe: (
    recipeId: string,
    recipeTitle: string,
    missingIngredients: MissingIngredient[],
  ) => void;
  load: () => Promise<void>;
}

function persist(items: ShoppingItem[]) {
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items)).catch(() => {});
}

export const useShoppingStore = create<ShoppingState>((set, get) => ({
  items: [],

  addItem: (item) => {
    const newItem: ShoppingItem = {
      ...item,
      id: `shop-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      isPurchased: false,
    };
    const next = [...get().items, newItem];
    set({ items: next });
    persist(next);
  },

  removeItem: (id) => {
    const next = get().items.filter((i) => i.id !== id);
    set({ items: next });
    persist(next);
  },

  togglePurchased: (id) => {
    const next = get().items.map((i) =>
      i.id === id ? { ...i, isPurchased: !i.isPurchased } : i,
    );
    set({ items: next });
    persist(next);
  },

  addMissingFromRecipe: (recipeId, recipeTitle, missingIngredients) => {
    const existingNames = new Set(
      get()
        .items.filter((i) => i.recipeId === recipeId)
        .map((i) => i.name.toLowerCase()),
    );
    const newItems: ShoppingItem[] = missingIngredients
      .filter((m) => !existingNames.has(m.name.toLowerCase()))
      .map((m) => ({
        id: `shop-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: m.name,
        recipeId,
        recipeTitle,
        isPurchased: false,
      }));
    if (newItems.length === 0) return;
    const next = [...get().items, ...newItems];
    set({ items: next });
    persist(next);
  },

  load: async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        set({ items: JSON.parse(raw) });
      } catch {}
    }
  },
}));
