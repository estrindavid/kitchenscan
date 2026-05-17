import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { localStore } from '../services/localStorage';
import type { PantryItem, AddPantryItemRequest, UpdatePantryItemRequest } from '@kitchenscan/shared';
import { SEED_PANTRY_ITEMS } from '../data/seedPantryItems';

interface PantryFilters {
  category?: string;
  status?: string;
  sort?: 'expiry' | 'category' | 'added' | 'name';
}

interface PantryListResponse {
  data: PantryItem[];
  meta: { total: number; limit: number; offset: number };
}

// ─── Reads ────────────────────────────────────────────────

export function usePantryItems(filters?: PantryFilters) {
  return useQuery({
    queryKey: ['pantry', 'items', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.category) params.set('category', filters.category);
      if (filters?.status) params.set('status', filters.status);
      if (filters?.sort) params.set('sort', filters.sort);

      try {
        const { data } = await api.get<PantryListResponse>(`/pantry/items?${params}`);
        // Persist fresh data locally so next load works offline
        await localStore.savePantryItems(data.data);
        return data.data;
      } catch {
        // API unreachable — serve local copy, falling back to seed data if empty
        const local = await localStore.getPantryItems();
        return local.length > 0 ? local : SEED_PANTRY_ITEMS;
      }
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 60,
  });
}

export function useExpiringItems(days = 3) {
  return useQuery({
    queryKey: ['pantry', 'expiring', days],
    queryFn: async () => {
      try {
        const { data } = await api.get<{ data: PantryItem[] }>(
          `/pantry/expiring?days=${days}`,
        );
        return data.data;
      } catch {
        // Filter from local cache by expiry date
        const items = await localStore.getPantryItems();
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() + days);
        return items.filter(
          (i) => i.expiryDate && new Date(i.expiryDate) <= cutoff,
        );
      }
    },
    staleTime: 1000 * 60 * 30,
  });
}

export function usePantrySummary() {
  return useQuery({
    queryKey: ['pantry', 'summary'],
    queryFn: async () => {
      try {
        const { data } = await api.get<{
          data: {
            categories: { category: string; count: number; expiringCount: number }[];
            totalItems: number;
          };
        }>('/pantry/summary');
        return data.data;
      } catch {
        // Build a summary from local cache
        const items = await localStore.getPantryItems();
        const map = new Map<string, number>();
        for (const item of items) {
          map.set(item.category, (map.get(item.category) ?? 0) + 1);
        }
        return {
          categories: Array.from(map.entries()).map(([category, count]) => ({
            category,
            count,
            expiringCount: 0,
          })),
          totalItems: items.length,
        };
      }
    },
    staleTime: 1000 * 60 * 5,
  });
}

// ─── Writes (local-first + background sync) ───────────────

export function useAddPantryItem() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (item: AddPantryItemRequest) => {
      const localId = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const localItem: PantryItem = {
        ...item,
        id: localId,
        userId: '',
        status: 'fresh',
        quantity: item.quantity ?? 1,
        unit: item.unit ?? 'piece',
        detectionSource: item.detectionSource ?? 'manual_entry',
        addedAt: new Date().toISOString(),
      };

      // Write locally first — immediate, offline-safe
      const existing = await localStore.getPantryItems();
      await localStore.savePantryItems([...existing, localItem]);

      try {
        const { data } = await api.post<{ data: PantryItem }>('/pantry/items', item);
        // Replace local placeholder with server record (has real ID)
        const updated = (await localStore.getPantryItems()).map((i) =>
          i.id === localId ? data.data : i,
        );
        await localStore.savePantryItems(updated);
        return data.data;
      } catch {
        // Queue for sync when API comes back
        await localStore.addPendingWrite({
          type: 'add',
          localId,
          payload: item,
          createdAt: new Date().toISOString(),
        });
        return localItem;
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['pantry'] });
    },
  });
}

export function useAddPantryItemsBatch() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (items: AddPantryItemRequest[]) => {
      const now = Date.now();
      const localItems: PantryItem[] = items.map((item, i) => ({
        ...item,
        id: `local-${now}-${i}`,
        userId: '',
        status: 'fresh' as const,
        quantity: item.quantity ?? 1,
        unit: item.unit ?? 'piece',
        detectionSource: item.detectionSource ?? 'manual_entry' as const,
        addedAt: new Date().toISOString(),
      }));

      const existing = await localStore.getPantryItems();
      await localStore.savePantryItems([...existing, ...localItems]);

      try {
        const { data } = await api.post<{ data: PantryItem[]; meta: { count: number } }>(
          '/pantry/items/batch',
          items,
        );
        // Replace placeholders with server records
        const localIds = new Set(localItems.map((i) => i.id));
        const current = await localStore.getPantryItems();
        const withoutPlaceholders = current.filter((i) => !localIds.has(i.id));
        await localStore.savePantryItems([...withoutPlaceholders, ...data.data]);
        return data.data;
      } catch {
        for (let i = 0; i < localItems.length; i++) {
          await localStore.addPendingWrite({
            type: 'add',
            localId: localItems[i].id,
            payload: items[i],
            createdAt: new Date().toISOString(),
          });
        }
        return localItems;
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['pantry'] });
    },
  });
}

export function useUpdatePantryItem() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & UpdatePantryItemRequest) => {
      // Update locally first
      const items = await localStore.getPantryItems();
      const updated = items.map((i) => (i.id === id ? normalizeLocalPantryUpdate({ ...i, ...updates }) : i));
      await localStore.savePantryItems(updated);

      try {
        const { data } = await api.patch<{ data: PantryItem }>(`/pantry/items/${id}`, updates);
        // Replace with server version
        const current = await localStore.getPantryItems();
        await localStore.savePantryItems(
          current.map((i) => (i.id === id ? data.data : i)),
        );
        return data.data;
      } catch {
        await localStore.addPendingWrite({
          type: 'update',
          localId: id,
          payload: { id, updates },
          createdAt: new Date().toISOString(),
        });
        return updated.find((i) => i.id === id)!;
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['pantry'] });
    },
  });
}

function normalizeLocalPantryUpdate(item: PantryItem): PantryItem {
  if (item.status === 'used_up' || item.quantity <= 0) {
    return {
      ...item,
      quantity: Math.max(0, item.quantity),
      status: 'used_up',
      usedAt: item.usedAt ?? new Date().toISOString(),
    };
  }

  if (item.usedAt) {
    const { usedAt: _usedAt, ...rest } = item;
    return rest;
  }

  return item;
}

export function useDeletePantryItem() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Delete locally first
      const items = await localStore.getPantryItems();
      await localStore.savePantryItems(items.filter((i) => i.id !== id));

      try {
        await api.delete(`/pantry/items/${id}`);
      } catch {
        await localStore.addPendingWrite({
          type: 'delete',
          localId: id,
          payload: { id },
          createdAt: new Date().toISOString(),
        });
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['pantry'] });
    },
  });
}
