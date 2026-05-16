export const MEASUREMENT_UNITS = {
  piece: { label: 'piece', plural: 'pieces', type: 'count' },
  g: { label: 'g', plural: 'g', type: 'weight' },
  kg: { label: 'kg', plural: 'kg', type: 'weight' },
  oz: { label: 'oz', plural: 'oz', type: 'weight' },
  lb: { label: 'lb', plural: 'lbs', type: 'weight' },
  ml: { label: 'mL', plural: 'mL', type: 'volume' },
  l: { label: 'L', plural: 'L', type: 'volume' },
  cup: { label: 'cup', plural: 'cups', type: 'volume' },
  tbsp: { label: 'tbsp', plural: 'tbsp', type: 'volume' },
  tsp: { label: 'tsp', plural: 'tsp', type: 'volume' },
  pinch: { label: 'pinch', plural: 'pinches', type: 'volume' },
  bunch: { label: 'bunch', plural: 'bunches', type: 'count' },
  clove: { label: 'clove', plural: 'cloves', type: 'count' },
  can: { label: 'can', plural: 'cans', type: 'count' },
  bottle: { label: 'bottle', plural: 'bottles', type: 'count' },
  package: { label: 'package', plural: 'packages', type: 'count' },
} as const;

export type MeasurementUnit = keyof typeof MEASUREMENT_UNITS;
