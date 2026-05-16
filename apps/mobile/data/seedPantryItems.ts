import type { PantryItem } from '@kitchenscan/shared';

function daysOut(n: number): string {
  return new Date(Date.now() + n * 86_400_000).toISOString();
}

const ADDED_AT = new Date(Date.now() - 2 * 86_400_000).toISOString();

export const SEED_PANTRY_ITEMS: PantryItem[] = [
  { id: 'seed-pantry-001', userId: 'demo', name: 'chicken', displayName: 'Chicken Breast', category: 'protein', quantity: 600, unit: 'g', status: 'fresh', detectionSource: 'manual_entry', expiryDate: daysOut(7), estimatedShelfLifeDays: 4, addedAt: ADDED_AT },
  { id: 'seed-pantry-002', userId: 'demo', name: 'olive oil', displayName: 'Extra Virgin Olive Oil', category: 'condiments', quantity: 1, unit: 'bottle', status: 'fresh', detectionSource: 'manual_entry', expiryDate: daysOut(60), estimatedShelfLifeDays: 90, addedAt: ADDED_AT },
  { id: 'seed-pantry-003', userId: 'demo', name: 'garlic', displayName: 'Garlic', category: 'produce', quantity: 1, unit: 'head', status: 'fresh', detectionSource: 'manual_entry', expiryDate: daysOut(14), estimatedShelfLifeDays: 30, addedAt: ADDED_AT },
  { id: 'seed-pantry-004', userId: 'demo', name: 'onion', displayName: 'Yellow Onion', category: 'produce', quantity: 3, unit: 'piece', status: 'fresh', detectionSource: 'manual_entry', expiryDate: daysOut(14), estimatedShelfLifeDays: 30, addedAt: ADDED_AT },
  { id: 'seed-pantry-005', userId: 'demo', name: 'eggs', displayName: 'Eggs', category: 'dairy', quantity: 12, unit: 'piece', status: 'fresh', detectionSource: 'manual_entry', expiryDate: daysOut(14), estimatedShelfLifeDays: 21, addedAt: ADDED_AT },
  { id: 'seed-pantry-006', userId: 'demo', name: 'butter', displayName: 'Unsalted Butter', category: 'dairy', quantity: 250, unit: 'g', status: 'fresh', detectionSource: 'manual_entry', expiryDate: daysOut(30), estimatedShelfLifeDays: 60, addedAt: ADDED_AT },
  { id: 'seed-pantry-007', userId: 'demo', name: 'flour', displayName: 'All-Purpose Flour', category: 'baking', quantity: 1, unit: 'kg', status: 'fresh', detectionSource: 'manual_entry', expiryDate: daysOut(180), estimatedShelfLifeDays: 365, addedAt: ADDED_AT },
  { id: 'seed-pantry-008', userId: 'demo', name: 'rice', displayName: 'Jasmine Rice', category: 'grains', quantity: 1, unit: 'kg', status: 'fresh', detectionSource: 'manual_entry', expiryDate: daysOut(180), estimatedShelfLifeDays: 365, addedAt: ADDED_AT },
  { id: 'seed-pantry-009', userId: 'demo', name: 'pasta', displayName: 'Spaghetti', category: 'grains', quantity: 500, unit: 'g', status: 'fresh', detectionSource: 'manual_entry', expiryDate: daysOut(180), estimatedShelfLifeDays: 365, addedAt: ADDED_AT },
  { id: 'seed-pantry-010', userId: 'demo', name: 'salt', displayName: 'Sea Salt', category: 'spices', quantity: 1, unit: 'container', status: 'fresh', detectionSource: 'manual_entry', expiryDate: daysOut(365), estimatedShelfLifeDays: 1825, addedAt: ADDED_AT },
  { id: 'seed-pantry-011', userId: 'demo', name: 'pepper', displayName: 'Black Pepper', category: 'spices', quantity: 1, unit: 'container', status: 'fresh', detectionSource: 'manual_entry', expiryDate: daysOut(365), estimatedShelfLifeDays: 365, addedAt: ADDED_AT },
  { id: 'seed-pantry-012', userId: 'demo', name: 'canned tomatoes', displayName: 'Crushed Tomatoes', category: 'canned', quantity: 2, unit: 'can', status: 'fresh', detectionSource: 'manual_entry', expiryDate: daysOut(365), estimatedShelfLifeDays: 730, addedAt: ADDED_AT },
  { id: 'seed-pantry-013', userId: 'demo', name: 'bell pepper', displayName: 'Red Bell Pepper', category: 'produce', quantity: 2, unit: 'piece', status: 'fresh', detectionSource: 'manual_entry', expiryDate: daysOut(7), estimatedShelfLifeDays: 10, addedAt: ADDED_AT },
  { id: 'seed-pantry-014', userId: 'demo', name: 'cheddar cheese', displayName: 'Cheddar Cheese', category: 'dairy', quantity: 200, unit: 'g', status: 'fresh', detectionSource: 'manual_entry', expiryDate: daysOut(14), estimatedShelfLifeDays: 21, addedAt: ADDED_AT },
  { id: 'seed-pantry-015', userId: 'demo', name: 'parmesan cheese', displayName: 'Parmesan Cheese', category: 'dairy', quantity: 150, unit: 'g', status: 'fresh', detectionSource: 'manual_entry', expiryDate: daysOut(30), estimatedShelfLifeDays: 60, addedAt: ADDED_AT },
  { id: 'seed-pantry-016', userId: 'demo', name: 'milk', displayName: 'Whole Milk', category: 'dairy', quantity: 1, unit: 'litre', status: 'fresh', detectionSource: 'manual_entry', expiryDate: daysOut(7), estimatedShelfLifeDays: 10, addedAt: ADDED_AT },
  { id: 'seed-pantry-017', userId: 'demo', name: 'cream', displayName: 'Heavy Cream', category: 'dairy', quantity: 200, unit: 'ml', status: 'expiring_soon', detectionSource: 'manual_entry', expiryDate: daysOut(2), estimatedShelfLifeDays: 7, addedAt: ADDED_AT },
  { id: 'seed-pantry-018', userId: 'demo', name: 'soy sauce', displayName: 'Soy Sauce', category: 'condiments', quantity: 1, unit: 'bottle', status: 'fresh', detectionSource: 'manual_entry', expiryDate: daysOut(365), estimatedShelfLifeDays: 730, addedAt: ADDED_AT },
  { id: 'seed-pantry-019', userId: 'demo', name: 'ginger', displayName: 'Fresh Ginger', category: 'produce', quantity: 1, unit: 'piece', status: 'fresh', detectionSource: 'manual_entry', expiryDate: daysOut(14), estimatedShelfLifeDays: 21, addedAt: ADDED_AT },
  { id: 'seed-pantry-020', userId: 'demo', name: 'lemon', displayName: 'Lemon', category: 'produce', quantity: 3, unit: 'piece', status: 'fresh', detectionSource: 'manual_entry', expiryDate: daysOut(10), estimatedShelfLifeDays: 14, addedAt: ADDED_AT },
  { id: 'seed-pantry-021', userId: 'demo', name: 'broccoli', displayName: 'Broccoli', category: 'produce', quantity: 1, unit: 'head', status: 'fresh', detectionSource: 'manual_entry', expiryDate: daysOut(5), estimatedShelfLifeDays: 7, addedAt: ADDED_AT },
  { id: 'seed-pantry-022', userId: 'demo', name: 'chicken stock', displayName: 'Chicken Stock', category: 'canned', quantity: 1, unit: 'litre', status: 'fresh', detectionSource: 'manual_entry', expiryDate: daysOut(365), estimatedShelfLifeDays: 730, addedAt: ADDED_AT },
  { id: 'seed-pantry-023', userId: 'demo', name: 'basil', displayName: 'Fresh Basil', category: 'produce', quantity: 1, unit: 'bunch', status: 'expiring_soon', detectionSource: 'manual_entry', expiryDate: daysOut(1), estimatedShelfLifeDays: 5, addedAt: ADDED_AT },
  { id: 'seed-pantry-024', userId: 'demo', name: 'cumin', displayName: 'Ground Cumin', category: 'spices', quantity: 1, unit: 'container', status: 'fresh', detectionSource: 'manual_entry', expiryDate: daysOut(365), estimatedShelfLifeDays: 730, addedAt: ADDED_AT },
  { id: 'seed-pantry-025', userId: 'demo', name: 'paprika', displayName: 'Smoked Paprika', category: 'spices', quantity: 1, unit: 'container', status: 'fresh', detectionSource: 'manual_entry', expiryDate: daysOut(365), estimatedShelfLifeDays: 730, addedAt: ADDED_AT },
];
