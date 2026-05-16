import type {
  AddPantryItemRequest,
  PantryItem,
  PantryItemStatus,
  UpdatePantryItemRequest,
} from '@kitchenscan/shared';

export interface PantryListFilters {
  category?: string;
  status?: string;
  sort?: 'expiry' | 'category' | 'added' | 'name';
  limit?: number;
  offset?: number;
}

export interface PantrySummary {
  categories: Array<{ category: string; count: number; expiringCount: number }>;
  totalItems: number;
}

export function createPantryStore() {
  const items = new Map<string, PantryItem>();

  return {
    add(input: AddPantryItemRequest): PantryItem {
      const item = createPantryItem(input);
      items.set(item.id, item);
      return item;
    },

    addBatch(inputs: AddPantryItemRequest[]): PantryItem[] {
      return inputs.map((input) => this.add(input));
    },

    list(filters: PantryListFilters): PantryItem[] {
      const offset = filters.offset ?? 0;
      const limit = filters.limit ?? 100;
      return Array.from(items.values())
        .map(refreshStatus)
        .filter((item) => !filters.category || item.category === filters.category)
        .filter((item) => !filters.status || item.status === filters.status)
        .sort(sortFor(filters.sort))
        .slice(offset, offset + limit);
    },

    count(filters: Omit<PantryListFilters, 'limit' | 'offset'>): number {
      return Array.from(items.values())
        .map(refreshStatus)
        .filter((item) => !filters.category || item.category === filters.category)
        .filter((item) => !filters.status || item.status === filters.status)
        .length;
    },

    expiring(days: number): PantryItem[] {
      const cutoff = Date.now() + days * 86_400_000;
      return Array.from(items.values())
        .map(refreshStatus)
        .filter((item) => {
          if (!item.expiryDate) return false;
          const expiryTime = Date.parse(item.expiryDate);
          return Number.isFinite(expiryTime) && expiryTime <= cutoff;
        })
        .sort(sortFor('expiry'));
    },

    summary(): PantrySummary {
      const categories = new Map<string, { category: string; count: number; expiringCount: number }>();
      const refreshed = Array.from(items.values()).map(refreshStatus);

      for (const item of refreshed) {
        const current = categories.get(item.category) ?? {
          category: item.category,
          count: 0,
          expiringCount: 0,
        };
        current.count += 1;
        if (item.status === 'expiring_soon' || item.status === 'expired') {
          current.expiringCount += 1;
        }
        categories.set(item.category, current);
      }

      return {
        categories: Array.from(categories.values()).sort((a, b) => a.category.localeCompare(b.category)),
        totalItems: refreshed.length,
      };
    },

    update(id: string, updates: UpdatePantryItemRequest): PantryItem | undefined {
      const existing = items.get(id);
      if (!existing) return undefined;

      const updated = refreshStatus({
        ...existing,
        ...updates,
      });
      items.set(id, updated);
      return updated;
    },

    delete(id: string): boolean {
      return items.delete(id);
    },

    reset() {
      items.clear();
    },
  };
}

export const pantryStore = createPantryStore();

function createPantryItem(input: AddPantryItemRequest): PantryItem {
  const item: PantryItem = {
    id: `pantry-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    userId: 'demo-user',
    name: input.name.trim().toLowerCase(),
    displayName: input.displayName?.trim(),
    category: input.category.trim().toLowerCase(),
    subcategory: input.subcategory?.trim(),
    quantity: input.quantity ?? 1,
    unit: input.unit ?? 'piece',
    status: 'fresh',
    detectionSource: input.detectionSource ?? 'manual_entry',
    confidenceScore: input.confidenceScore,
    barcode: input.barcode,
    brand: input.brand,
    imageUrl: input.imageUrl,
    expiryDate: input.expiryDate,
    nutritionPer100g: input.nutritionPer100g,
    addedAt: new Date().toISOString(),
    lastScannedAt: new Date().toISOString(),
  };

  return refreshStatus(item);
}

function refreshStatus(item: PantryItem): PantryItem {
  if (item.status === 'used_up') return item;
  const status = statusFromExpiry(item.expiryDate);
  return { ...item, status };
}

function statusFromExpiry(expiryDate?: string): PantryItemStatus {
  if (!expiryDate) return 'fresh';
  const expiryTime = Date.parse(expiryDate);
  if (!Number.isFinite(expiryTime)) return 'fresh';
  const now = Date.now();
  if (expiryTime < now) return 'expired';
  if (expiryTime <= now + 3 * 86_400_000) return 'expiring_soon';
  return 'fresh';
}

function sortFor(sort: PantryListFilters['sort']) {
  return (a: PantryItem, b: PantryItem) => {
    if (sort === 'name') return a.name.localeCompare(b.name);
    if (sort === 'category') return a.category.localeCompare(b.category) || a.name.localeCompare(b.name);
    if (sort === 'expiry') return expirySortValue(a) - expirySortValue(b);
    return Date.parse(b.addedAt) - Date.parse(a.addedAt);
  };
}

function expirySortValue(item: PantryItem) {
  return item.expiryDate ? Date.parse(item.expiryDate) : Number.MAX_SAFE_INTEGER;
}
