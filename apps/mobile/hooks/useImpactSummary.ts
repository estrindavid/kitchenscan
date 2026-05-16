import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export type ValidationReadiness = 'needs_testers' | 'promising' | 'demo_ready';

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

const EMPTY_IMPACT: ImpactSummary = {
  totalPantryItems: 0,
  expiringItemCount: 0,
  estimatedMealsAvailable: 0,
  estimatedMealsRescuable: 0,
  estimatedGrocerySavingsDollars: 0,
  scanToRecipeConversionRate: 0,
  recipeViewRate: 0,
  testerAverageRating: 0,
  testerWouldUseAgainRate: 0,
  validationReadiness: 'needs_testers',
  highlights: ['Scan pantry items to unlock meal and savings estimates.'],
};

export function useImpactSummary() {
  return useQuery({
    queryKey: ['impact', 'summary'],
    queryFn: async () => {
      try {
        const { data } = await api.get<{ data: ImpactSummary }>('/impact/summary');
        return data.data;
      } catch {
        return EMPTY_IMPACT;
      }
    },
    staleTime: 1000 * 15,
    refetchInterval: 1000 * 30,
  });
}
