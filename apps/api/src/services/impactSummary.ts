import type { FeedbackSummary } from './feedbackStore';
import type { UsageSummary } from './usageEvents';

export type ValidationReadiness = 'needs_testers' | 'promising' | 'demo_ready';

export interface ImpactSummaryInput {
  totalPantryItems: number;
  expiringItemCount: number;
  usage: UsageSummary;
  feedback: FeedbackSummary;
}

export interface ImpactSummary {
  totalPantryItems: number;
  expiringItemCount: number;
  estimatedMealsAvailable: number;
  estimatedMealsRescuable: number;
  estimatedGrocerySavingsDollars: number;
  scanToRecipeConversionRate: number;
  recipeViewRate: number;
  testerAverageRating: number;
  testerWouldUseAgainRate: number;
  validationReadiness: ValidationReadiness;
  highlights: string[];
}

const ITEMS_PER_MEAL = 3;
const EXPIRING_ITEM_SAVINGS_DOLLARS = 3.5;
const PANTRY_MEAL_SAVINGS_DOLLARS = 1.5;

export function createImpactSummary(input: ImpactSummaryInput): ImpactSummary {
  const estimatedMealsAvailable = Math.floor(input.totalPantryItems / ITEMS_PER_MEAL);
  const estimatedMealsRescuable = input.expiringItemCount;
  const estimatedGrocerySavingsDollars = Math.round(
    estimatedMealsAvailable * PANTRY_MEAL_SAVINGS_DOLLARS
    + estimatedMealsRescuable * EXPIRING_ITEM_SAVINGS_DOLLARS,
  );
  const scanToRecipeConversionRate = percentage(
    input.usage.funnel.recipe_search_viewed,
    input.usage.funnel.scan_started,
  );
  const recipeViewRate = percentage(
    input.usage.funnel.recipe_viewed,
    input.usage.funnel.recipe_search_viewed,
  );
  const validationReadiness = readinessFor(input.usage.uniqueUsers, input.feedback.totalFeedback);

  return {
    totalPantryItems: input.totalPantryItems,
    expiringItemCount: input.expiringItemCount,
    estimatedMealsAvailable,
    estimatedMealsRescuable,
    estimatedGrocerySavingsDollars,
    scanToRecipeConversionRate,
    recipeViewRate,
    testerAverageRating: input.feedback.averageRating,
    testerWouldUseAgainRate: input.feedback.wouldUseAgainRate,
    validationReadiness,
    highlights: highlightsFor({
      estimatedMealsAvailable,
      estimatedMealsRescuable,
      estimatedGrocerySavingsDollars,
      testerWouldUseAgainRate: input.feedback.wouldUseAgainRate,
    }),
  };
}

function percentage(numerator: number, denominator: number) {
  if (denominator <= 0) return 0;
  return Math.round((numerator / denominator) * 100);
}

function readinessFor(uniqueUsers: number, totalFeedback: number): ValidationReadiness {
  if (uniqueUsers >= 4 && totalFeedback >= 5) return 'demo_ready';
  if (uniqueUsers >= 2 || totalFeedback >= 2) return 'promising';
  return 'needs_testers';
}

function highlightsFor(input: {
  estimatedMealsAvailable: number;
  estimatedMealsRescuable: number;
  estimatedGrocerySavingsDollars: number;
  testerWouldUseAgainRate: number;
}) {
  if (input.estimatedMealsAvailable === 0 && input.estimatedMealsRescuable === 0) {
    return ['Scan pantry items to unlock meal and savings estimates.'];
  }

  const highlights = [
    `${input.estimatedMealsAvailable} meals can be planned from scanned pantry items.`,
    `${input.estimatedMealsRescuable} expiring items are ready to rescue before they become waste.`,
    `$${input.estimatedGrocerySavingsDollars} in groceries could be stretched from the current pantry.`,
  ];

  if (input.testerWouldUseAgainRate > 0) {
    highlights.push(`${input.testerWouldUseAgainRate}% of testers said they would use KitchenScan again.`);
  }

  return highlights;
}
