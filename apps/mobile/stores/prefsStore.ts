import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SkillLevel, DietaryRestriction } from '@kitchenscan/shared';

interface PrefsState {
  skillLevel: SkillLevel;
  dietaryRestrictions: DietaryRestriction[];
  allergens: string[];
  householdSize: number;
  isOnboarded: boolean;
  themeMode: 'system' | 'light' | 'dark';
  setSkillLevel: (level: SkillLevel) => void;
  setDietaryRestrictions: (restrictions: DietaryRestriction[]) => void;
  setAllergens: (allergens: string[]) => void;
  setHouseholdSize: (size: number) => void;
  setThemeMode: (mode: 'system' | 'light' | 'dark') => void;
  completeOnboarding: () => void;
  loadPrefs: () => Promise<void>;
}

export const usePrefsStore = create<PrefsState>((set, get) => ({
  skillLevel: 'beginner',
  dietaryRestrictions: [],
  allergens: [],
  householdSize: 1,
  isOnboarded: false,
  themeMode: 'system',

  setSkillLevel: (level) => {
    set({ skillLevel: level });
    persistPrefs(get());
  },
  setDietaryRestrictions: (restrictions) => {
    set({ dietaryRestrictions: restrictions });
    persistPrefs(get());
  },
  setAllergens: (allergens) => {
    set({ allergens });
    persistPrefs(get());
  },
  setHouseholdSize: (size) => {
    set({ householdSize: size });
    persistPrefs(get());
  },
  setThemeMode: (mode) => {
    set({ themeMode: mode });
    persistPrefs(get());
  },
  completeOnboarding: () => {
    set({ isOnboarded: true });
    persistPrefs(get());
  },
  loadPrefs: async () => {
    const raw = await AsyncStorage.getItem('kitchenscan_prefs');
    if (raw) {
      const data = JSON.parse(raw);
      set(data);
    }
  },
}));

async function persistPrefs(state: PrefsState) {
  const { setSkillLevel, setDietaryRestrictions, setAllergens, setHouseholdSize, setThemeMode, completeOnboarding, loadPrefs, ...data } = state;
  await AsyncStorage.setItem('kitchenscan_prefs', JSON.stringify(data));
}
