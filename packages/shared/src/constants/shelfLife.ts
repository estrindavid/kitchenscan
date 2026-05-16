/** Default estimated shelf life in days by category/subcategory */
export const DEFAULT_SHELF_LIFE: Record<string, Record<string, number>> = {
  produce: {
    leafy_green: 5,
    root_vegetable: 21,
    fruit: 7,
    herb: 7,
    mushroom: 5,
    allium: 30,
    pepper: 10,
    squash: 30,
    _default: 7,
  },
  dairy: {
    milk: 7,
    cheese: 21,
    hard_cheese: 60,
    soft_cheese: 14,
    yogurt: 14,
    butter: 30,
    cream: 7,
    _default: 14,
  },
  protein: {
    poultry: 2,
    beef: 3,
    pork: 3,
    fish: 2,
    shellfish: 2,
    tofu: 7,
    eggs: 28,
    legumes: 365,
    _default: 3,
  },
  grains: {
    bread: 5,
    pasta: 730,
    rice: 730,
    cereal: 180,
    flour: 365,
    oats: 365,
    _default: 365,
  },
  canned: {
    _default: 730,
  },
  frozen: {
    _default: 180,
  },
  condiments: {
    _default: 180,
  },
  spices: {
    _default: 730,
  },
  beverages: {
    _default: 90,
  },
  snacks: {
    _default: 90,
  },
  baking: {
    _default: 365,
  },
  other: {
    _default: 30,
  },
};

export function getEstimatedShelfLife(category: string, subcategory?: string): number {
  const categoryData = DEFAULT_SHELF_LIFE[category];
  if (!categoryData) return 30;
  if (subcategory && categoryData[subcategory]) return categoryData[subcategory];
  return categoryData._default ?? 30;
}
