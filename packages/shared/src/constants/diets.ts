export const DIETARY_RESTRICTIONS = {
  vegan: { label: 'Vegan', description: 'No animal products' },
  vegetarian: { label: 'Vegetarian', description: 'No meat or fish' },
  pescatarian: { label: 'Pescatarian', description: 'Fish but no meat' },
  gluten_free: { label: 'Gluten Free', description: 'No gluten-containing grains' },
  dairy_free: { label: 'Dairy Free', description: 'No dairy products' },
  nut_free: { label: 'Nut Free', description: 'No tree nuts or peanuts' },
  keto: { label: 'Keto', description: 'Very low carb, high fat' },
  paleo: { label: 'Paleo', description: 'No processed foods, grains, or legumes' },
  halal: { label: 'Halal', description: 'Permissible under Islamic law' },
  kosher: { label: 'Kosher', description: 'Compliant with Jewish dietary laws' },
  low_fodmap: { label: 'Low FODMAP', description: 'Low fermentable carbohydrates' },
} as const;

export const COMMON_ALLERGENS = [
  'milk',
  'eggs',
  'fish',
  'shellfish',
  'tree_nuts',
  'peanuts',
  'wheat',
  'soybeans',
  'sesame',
] as const;

export type Allergen = (typeof COMMON_ALLERGENS)[number];
