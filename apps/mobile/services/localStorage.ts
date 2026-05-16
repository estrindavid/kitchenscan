import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PantryItem, AddPantryItemRequest } from '@kitchenscan/shared';

const KEYS = {
  pantryItems: 'pantry_v1_items',
  pendingWrites: 'pantry_v1_pending',
};

export interface PendingWrite {
  type: 'add' | 'update' | 'delete';
  localId: string;
  payload:
    | AddPantryItemRequest
    | { id: string; updates: Partial<PantryItem> }
    | { id: string };
  createdAt: string;
}

export const localStore = {
  async getPantryItems(): Promise<PantryItem[]> {
    try {
      const raw = await AsyncStorage.getItem(KEYS.pantryItems);
      return raw ? (JSON.parse(raw) as PantryItem[]) : [];
    } catch {
      return [];
    }
  },

  async savePantryItems(items: PantryItem[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.pantryItems, JSON.stringify(items));
  },

  async addPendingWrite(write: PendingWrite): Promise<void> {
    const existing = await this.getPendingWrites();
    await AsyncStorage.setItem(
      KEYS.pendingWrites,
      JSON.stringify([...existing, write]),
    );
  },

  async getPendingWrites(): Promise<PendingWrite[]> {
    try {
      const raw = await AsyncStorage.getItem(KEYS.pendingWrites);
      return raw ? (JSON.parse(raw) as PendingWrite[]) : [];
    } catch {
      return [];
    }
  },

  async removePendingWrite(localId: string): Promise<void> {
    const existing = await this.getPendingWrites();
    const filtered = existing.filter((w) => w.localId !== localId);
    await AsyncStorage.setItem(KEYS.pendingWrites, JSON.stringify(filtered));
  },

  async clearAll(): Promise<void> {
    await AsyncStorage.multiRemove([KEYS.pantryItems, KEYS.pendingWrites]);
  },
};
