import { create } from 'zustand';
import type { RecipeStep } from '@kitchenscan/shared';

interface CookState {
  recipeId: string | null;
  steps: RecipeStep[];
  currentStep: number;
  isActive: boolean;
  startSession: (recipeId: string, steps: RecipeStep[]) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  endSession: () => void;
}

export const useCookStore = create<CookState>((set, get) => ({
  recipeId: null,
  steps: [],
  currentStep: 0,
  isActive: false,

  startSession: (recipeId, steps) =>
    set({ recipeId, steps, currentStep: 0, isActive: true }),
  nextStep: () => {
    const { currentStep, steps } = get();
    if (currentStep < steps.length - 1) {
      set({ currentStep: currentStep + 1 });
    }
  },
  prevStep: () => {
    const { currentStep } = get();
    if (currentStep > 0) {
      set({ currentStep: currentStep - 1 });
    }
  },
  goToStep: (step) => set({ currentStep: step }),
  endSession: () => set({ recipeId: null, steps: [], currentStep: 0, isActive: false }),
}));
