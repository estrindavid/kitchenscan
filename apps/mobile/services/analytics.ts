import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';

export type UsageEventName =
  | 'app_opened'
  | 'scan_started'
  | 'scan_completed'
  | 'manual_item_added'
  | 'pantry_items_saved'
  | 'recipe_search_viewed'
  | 'recipe_viewed'
  | 'cook_mode_started';

const ANONYMOUS_ID_KEY = 'kitchenscan_v1_anonymous_id';

export async function getAnonymousId(): Promise<string> {
  const existing = await AsyncStorage.getItem(ANONYMOUS_ID_KEY);
  if (existing) return existing;

  const id = `anon-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  await AsyncStorage.setItem(ANONYMOUS_ID_KEY, id);
  return id;
}

export async function trackEvent(
  eventName: UsageEventName,
  properties: Record<string, unknown> = {},
): Promise<void> {
  try {
    const anonymousId = await getAnonymousId();
    await api.post('/usage/events', {
      anonymousId,
      eventName,
      properties,
    });
  } catch {
    // Analytics must never block the demo flow.
  }
}
