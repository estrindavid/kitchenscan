import type { SkillLevel } from './user';

export interface NutritionPerServing {
  calories: number;
  protein: number;
  fat: number;
  saturatedFat: number;
  carbs: number;
  fiber: number;
  sugar: number;
  sodium: number;
}

export interface RecipeStep {
  order: number;
  instruction: string;
  durationMinutes?: number;
  timerLabel?: string;
}

export interface Ingredient {
  id: string;
  recipeId: string;
  canonicalName: string;
  displayText: string;
  quantity?: number;
  unit?: string;
  isOptional: boolean;
  isGarnish: boolean;
  category?: string;
}

export interface Recipe {
  id: string;
  externalId?: string;
  source: 'spoonacular' | 'edamam' | 'user' | 'ai_generated';
  sourceUrl?: string;
  title: string;
  description?: string;
  imageUrl?: string;
  cookTimeMinutes?: number;
  prepTimeMinutes?: number;
  totalTimeMinutes?: number;
  servings: number;
  difficulty: SkillLevel;
  cuisineType?: string;
  mealType?: string;
  dishType?: string;
  dietaryTags: string[];
  allergenWarnings: string[];
  nutritionPerServing?: NutritionPerServing;
  steps: RecipeStep[];
  ingredients?: Ingredient[];
  popularity: number;
  createdAt: string;
}
