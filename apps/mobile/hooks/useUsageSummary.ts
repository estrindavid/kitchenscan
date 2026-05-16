import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export interface UsageSummary {
  totalEvents: number;
  uniqueUsers: number;
  eventsByName: Record<string, number | undefined>;
  funnel: {
    scan_started: number;
    pantry_items_saved: number;
    recipe_search_viewed: number;
    recipe_viewed: number;
  };
}

const EMPTY_SUMMARY: UsageSummary = {
  totalEvents: 0,
  uniqueUsers: 0,
  eventsByName: {},
  funnel: {
    scan_started: 0,
    pantry_items_saved: 0,
    recipe_search_viewed: 0,
    recipe_viewed: 0,
  },
};

export function useUsageSummary() {
  return useQuery({
    queryKey: ['usage', 'summary'],
    queryFn: async () => {
      try {
        const { data } = await api.get<{ data: UsageSummary }>('/usage/summary');
        return data.data;
      } catch {
        return EMPTY_SUMMARY;
      }
    },
    staleTime: 1000 * 15,
    refetchInterval: 1000 * 30,
  });
}
