export type PantryItemStatus = 'fresh' | 'expiring_soon' | 'expired' | 'used_up';

export type DetectionSource = 'camera_vision' | 'barcode_scan' | 'manual_entry' | 'receipt_ocr';

export interface NutritionPer100g {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
  sodium: number;
}

export interface OpenFoodFactsData {
  nutriScore: string;
  novaGroup: number;
  allergens: string[];
  ingredients: string;
}

export interface PantryItem {
  id: string;
  userId: string;
  name: string;
  displayName?: string;
  category: string;
  subcategory?: string;
  quantity: number;
  unit: string;
  status: PantryItemStatus;
  detectionSource: DetectionSource;
  confidenceScore?: number;
  barcode?: string;
  brand?: string;
  imageUrl?: string;
  expiryDate?: string;
  estimatedShelfLifeDays?: number;
  nutritionPer100g?: NutritionPer100g;
  openFoodFactsData?: OpenFoodFactsData;
  addedAt: string;
  lastScannedAt?: string;
  usedAt?: string;
}

export type PantryCategory =
  | 'produce'
  | 'dairy'
  | 'protein'
  | 'grains'
  | 'canned'
  | 'frozen'
  | 'condiments'
  | 'spices'
  | 'beverages'
  | 'snacks'
  | 'baking'
  | 'other';
