export const FOOD_CATEGORIES = {
  produce: {
    label: 'Produce',
    icon: '🥬',
    subcategories: ['leafy_green', 'root_vegetable', 'fruit', 'herb', 'mushroom', 'allium', 'pepper', 'squash'],
  },
  dairy: {
    label: 'Dairy',
    icon: '🧀',
    subcategories: ['milk', 'cheese', 'hard_cheese', 'soft_cheese', 'yogurt', 'butter', 'cream'],
  },
  protein: {
    label: 'Protein',
    icon: '🥩',
    subcategories: ['poultry', 'beef', 'pork', 'fish', 'shellfish', 'tofu', 'eggs', 'legumes'],
  },
  grains: {
    label: 'Grains',
    icon: '🌾',
    subcategories: ['bread', 'pasta', 'rice', 'cereal', 'flour', 'oats'],
  },
  canned: {
    label: 'Canned',
    icon: '🥫',
    subcategories: ['beans', 'vegetables', 'fruit', 'soup', 'sauce', 'fish'],
  },
  frozen: {
    label: 'Frozen',
    icon: '🧊',
    subcategories: ['vegetables', 'fruit', 'meals', 'meat', 'dessert'],
  },
  condiments: {
    label: 'Condiments',
    icon: '🫙',
    subcategories: ['sauce', 'oil', 'vinegar', 'dressing', 'spread', 'mustard', 'ketchup'],
  },
  spices: {
    label: 'Spices',
    icon: '🧂',
    subcategories: ['dried_herb', 'ground_spice', 'whole_spice', 'blend', 'extract'],
  },
  beverages: {
    label: 'Beverages',
    icon: '🥤',
    subcategories: ['juice', 'soda', 'water', 'coffee', 'tea', 'alcohol'],
  },
  snacks: {
    label: 'Snacks',
    icon: '🍿',
    subcategories: ['chips', 'crackers', 'nuts', 'dried_fruit', 'candy', 'bars'],
  },
  baking: {
    label: 'Baking',
    icon: '🧁',
    subcategories: ['flour', 'sugar', 'leavening', 'chocolate', 'nuts', 'decorating'],
  },
  other: {
    label: 'Other',
    icon: '📦',
    subcategories: [],
  },
} as const;

export type FoodCategory = keyof typeof FOOD_CATEGORIES;
