import { api } from './api';
import { localStore } from './localStorage';
import type { PantryItem, AddPantryItemRequest } from '@kitchenscan/shared';

let _isSyncing = false;

/**
 * Flush locally-queued writes to the API.
 * Called automatically on app foreground (see _layout.tsx).
 * Safe to call concurrently — skips if already running.
 */
export async function syncPendingWrites(): Promise<void> {
  if (_isSyncing) return;
  _isSyncing = true;

  try {
    const pending = await localStore.getPendingWrites();
    if (pending.length === 0) return;

    for (const write of pending) {
      try {
        if (write.type === 'add') {
          await api.post<{ data: PantryItem }>(
            '/pantry/items',
            write.payload as AddPantryItemRequest,
          );
        } else if (write.type === 'update') {
          const { id, updates } = write.payload as { id: string; updates: object };
          await api.patch(`/pantry/items/${id}`, updates);
        } else if (write.type === 'delete') {
          const { id } = write.payload as { id: string };
          await api.delete(`/pantry/items/${id}`);
        }
        await localStore.removePendingWrite(write.localId);
      } catch {
        // Stop at first failure — API is still unavailable. Try again next foreground.
        break;
      }
    }
  } finally {
    _isSyncing = false;
  }
}
