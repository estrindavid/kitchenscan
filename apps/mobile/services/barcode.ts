import { api } from './api';
import type { BarcodeProduct } from '@kitchenscan/shared';

const OFF_API = 'https://world.openfoodfacts.org/api/v2/product';
const OFF_FIELDS =
  'product_name,brands,categories,image_url,nutriments,allergens_tags,nutrition_grades,nova_group,ingredients_text';
const USER_AGENT = 'KitchenScan/1.0 (contact@kitchenscan.app)';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseOFFProduct(raw: Record<string, any>, barcode: string): BarcodeProduct {
  const n = raw.nutriments ?? {};
  return {
    barcode,
    productName: raw.product_name ?? undefined,
    brands: raw.brands ?? undefined,
    categories: raw.categories ?? undefined,
    imageUrl: raw.image_url ?? undefined,
    nutriments:
      Object.keys(n).length > 0
        ? {
            energyKcal100g: n['energy-kcal_100g'] ?? undefined,
            proteins100g: n.proteins_100g ?? undefined,
            fat100g: n.fat_100g ?? undefined,
            carbohydrates100g: n.carbohydrates_100g ?? undefined,
            fiber100g: n.fiber_100g ?? undefined,
            sodium100g: n.sodium_100g ?? undefined,
          }
        : undefined,
    allergensTags: Array.isArray(raw.allergens_tags) ? raw.allergens_tags : undefined,
    nutritionGrades: raw.nutrition_grades ?? undefined,
    novaGroup: raw.nova_group ?? undefined,
    ingredientsText: raw.ingredients_text ?? undefined,
  };
}

async function fetchFromOFF(barcode: string): Promise<BarcodeProduct | null> {
  const res = await fetch(`${OFF_API}/${barcode}.json?fields=${OFF_FIELDS}`, {
    headers: { 'User-Agent': USER_AGENT },
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const json = (await res.json()) as { status: number; product?: Record<string, any> };
  if (json.status !== 1 || !json.product) return null;
  return parseOFFProduct(json.product, barcode);
}

export async function lookupBarcode(barcode: string): Promise<BarcodeProduct | null> {
  // 1. Try backend cache — if API is unreachable, fall through immediately
  try {
    const { data: resp } = await api.get<{
      data: { found: boolean; product: BarcodeProduct | null };
    }>(`/barcode/${barcode}`);
    if (resp.data.found) return resp.data.product;
  } catch {
    // API unavailable — go straight to Open Food Facts
  }

  // 2. Direct Open Food Facts lookup (works without the backend)
  try {
    const product = await fetchFromOFF(barcode);
    if (!product) return null;

    // 3. Cache on backend best-effort (fire-and-forget)
    api.post(`/barcode/${barcode}`, { product }).catch(() => {});

    return product;
  } catch (err) {
    console.error('Barcode lookup failed:', err);
    return null;
  }
}
