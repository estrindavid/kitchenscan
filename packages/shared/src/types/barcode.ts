export interface BarcodeNutriments {
  energyKcal100g?: number;
  proteins100g?: number;
  fat100g?: number;
  carbohydrates100g?: number;
  fiber100g?: number;
  sodium100g?: number;
}

export interface BarcodeProduct {
  barcode: string;
  productName?: string;
  brands?: string;
  categories?: string;
  imageUrl?: string;
  nutriments?: BarcodeNutriments;
  allergensTags?: string[];
  /** "a" | "b" | "c" | "d" | "e" */
  nutritionGrades?: string;
  /** 1–4 (NOVA food processing classification) */
  novaGroup?: number;
  ingredientsText?: string;
}

export interface BarcodeLookupResponse {
  barcode: string;
  product: BarcodeProduct | null;
  found: boolean;
  source: 'cache' | 'off';
}
