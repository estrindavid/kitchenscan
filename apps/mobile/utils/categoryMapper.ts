import type { FoodCategory } from '@kitchenscan/shared';

const CATEGORY_KEYWORDS: Record<FoodCategory, string[]> = {
  produce:    ['fruit', 'vegetable', 'fresh', 'salad', 'herb', 'produce', 'greens', 'berry', 'berries'],
  protein:    ['meat', 'chicken', 'beef', 'pork', 'fish', 'seafood', 'egg', 'tofu', 'protein', 'turkey', 'lamb', 'shrimp', 'tuna', 'salmon'],
  dairy:      ['dairy', 'milk', 'cheese', 'yogurt', 'butter', 'cream', 'ice cream', 'whey'],
  baking:     ['baking', 'bake', 'flour', 'sugar', 'yeast', 'powder', 'cocoa', 'vanilla', 'cornstarch'],
  grains:     ['grain', 'cereal', 'bread', 'pasta', 'rice', 'flour', 'oat', 'wheat', 'noodle', 'tortilla', 'crouton', 'bagel'],
  canned:     ['canned', 'tinned', 'preserved', 'jar', 'conserve', 'soup', 'broth', 'stock'],
  frozen:     ['frozen'],
  condiments: ['sauce', 'condiment', 'dressing', 'oil', 'vinegar', 'ketchup', 'mustard', 'mayonnaise', 'syrup', 'spread', 'jam', 'jelly', 'pickle', 'relish'],
  spices:     ['spice', 'seasoning', 'herb', 'pepper', 'salt', 'powder', 'dried', 'extract', 'vanilla'],
  snacks:     ['snack', 'chip', 'cookie', 'cracker', 'candy', 'chocolate', 'nut', 'popcorn', 'pretzel', 'granola', 'bar'],
  beverages:  ['beverage', 'drink', 'juice', 'water', 'soda', 'coffee', 'tea', 'wine', 'beer', 'kombucha', 'smoothie'],
  other:      [],
};

/**
 * Map Open Food Facts categories string (e.g. "Beverages, Juices, Orange juices")
 * to the app's FoodCategory enum. Returns 'other' when no match is found.
 */
export function categorizeFromOFF(offCategories?: string | null): FoodCategory {
  if (!offCategories) return 'other';
  const lower = offCategories.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (category === 'other') continue;
    if (keywords.some((kw) => lower.includes(kw))) {
      return category as FoodCategory;
    }
  }
  return 'other';
}
