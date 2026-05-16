export const usageEventNames = [
  'app_opened',
  'scan_started',
  'scan_completed',
  'manual_item_added',
  'pantry_items_saved',
  'recipe_search_viewed',
  'recipe_viewed',
  'cook_mode_started',
] as const;

export type UsageEventName = typeof usageEventNames[number];

export interface UsageEventInput {
  anonymousId: string;
  eventName: UsageEventName;
  properties?: Record<string, unknown>;
}

export interface UsageEvent extends UsageEventInput {
  id: string;
  receivedAt: string;
}

export interface UsageSummary {
  totalEvents: number;
  uniqueUsers: number;
  eventsByName: Partial<Record<UsageEventName, number>>;
  funnel: Record<'scan_started' | 'pantry_items_saved' | 'recipe_search_viewed' | 'recipe_viewed', number>;
}

export function createUsageEventStore() {
  const events: UsageEvent[] = [];

  return {
    record(input: UsageEventInput): UsageEvent {
      const event: UsageEvent = {
        ...input,
        id: `evt-${events.length + 1}`,
        receivedAt: new Date().toISOString(),
        properties: input.properties ?? {},
      };
      events.push(event);
      return event;
    },

    summary(): UsageSummary {
      const uniqueUsers = new Set(events.map((event) => event.anonymousId));
      const eventsByName: Partial<Record<UsageEventName, number>> = {};

      for (const event of events) {
        eventsByName[event.eventName] = (eventsByName[event.eventName] ?? 0) + 1;
      }

      return {
        totalEvents: events.length,
        uniqueUsers: uniqueUsers.size,
        eventsByName,
        funnel: {
          scan_started: eventsByName.scan_started ?? 0,
          pantry_items_saved: eventsByName.pantry_items_saved ?? 0,
          recipe_search_viewed: eventsByName.recipe_search_viewed ?? 0,
          recipe_viewed: eventsByName.recipe_viewed ?? 0,
        },
      };
    },

    reset() {
      events.length = 0;
    },
  };
}

export const usageEventStore = createUsageEventStore();
