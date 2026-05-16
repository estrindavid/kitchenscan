import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export interface FeedbackSummary {
  totalFeedback: number;
  uniqueTesters: number;
  averageRating: number;
  wouldUseAgainCount: number;
  wouldUseAgainRate: number;
}

const EMPTY_FEEDBACK: FeedbackSummary = {
  totalFeedback: 0,
  uniqueTesters: 0,
  averageRating: 0,
  wouldUseAgainCount: 0,
  wouldUseAgainRate: 0,
};

export function useFeedbackSummary() {
  return useQuery({
    queryKey: ['feedback', 'summary'],
    queryFn: async () => {
      try {
        const { data } = await api.get<{ data: FeedbackSummary }>('/feedback/summary');
        return data.data;
      } catch {
        return EMPTY_FEEDBACK;
      }
    },
    staleTime: 1000 * 15,
    refetchInterval: 1000 * 30,
  });
}
