import type { PantryItem } from './pantry';
import type { Recipe } from './recipe';
import type { DetectionResult } from './detection';
import type { UserProfile } from './user';

// ─── Generic ────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
  };
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

// ─── Auth ───────────────────────────────────────────────

export interface SignUpRequest {
  clerkId: string;
  email: string;
  displayName?: string;
}

export interface AuthResponse {
  user: UserProfile;
  token: string;
}

// ─── Pantry ─────────────────────────────────────────────

export interface AddPantryItemRequest {
  name: string;
  displayName?: string;
  category: string;
  subcategory?: string;
  quantity?: number;
  unit?: string;
  detectionSource?: PantryItem['detectionSource'];
  confidenceScore?: number;
  barcode?: string;
  brand?: string;
  imageUrl?: string;
  expiryDate?: string;
  nutritionPer100g?: PantryItem['nutritionPer100g'];
}

export interface UpdatePantryItemRequest {
  name?: string;
  quantity?: number;
  unit?: string;
  status?: PantryItem['status'];
  expiryDate?: string;
}

// ─── Detection ──────────────────────────────────────────

export interface DetectRequest {
  image: string; // base64
  preferOnDevice?: boolean;
}

export type DetectResponse = DetectionResult;

// ─── Recipes ────────────────────────────────────────────

export interface RecipeSearchParams {
  ingredients?: string[];
  cuisine?: string;
  diet?: string;
  maxTime?: number;
  difficulty?: string;
  page?: number;
  pageSize?: number;
}

export interface RecipeSearchResponse {
  recipes: (Recipe & { matchScore: number; matchedIngredients: string[]; missingIngredients: string[] })[];
  total: number;
}
