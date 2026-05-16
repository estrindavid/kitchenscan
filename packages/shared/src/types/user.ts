export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

export type DietaryRestriction =
  | 'vegan'
  | 'vegetarian'
  | 'pescatarian'
  | 'gluten_free'
  | 'dairy_free'
  | 'nut_free'
  | 'keto'
  | 'paleo'
  | 'halal'
  | 'kosher'
  | 'low_fodmap';

export interface NotificationPrefs {
  expiryReminders: boolean;
  dailyDigest: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}

export interface UserProfile {
  id: string;
  clerkId: string;
  email: string;
  displayName?: string;
  skillLevel: SkillLevel;
  dietaryRestrictions: DietaryRestriction[];
  allergens: string[];
  cuisinePreferences: string[];
  householdSize: number;
  notificationPrefs: NotificationPrefs;
  createdAt: string;
  updatedAt: string;
}
