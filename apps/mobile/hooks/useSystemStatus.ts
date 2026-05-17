import { useQuery } from '@tanstack/react-query';
import { api, API_BASE_URL } from '../services/api';

export interface SystemStatus {
  ok: boolean;
  api: {
    reachable: boolean;
    baseUrl: string;
  };
  rocketride: {
    configured: boolean;
    uriConfigured: boolean;
    apiKeyConfigured: boolean;
  };
  google: {
    configured: boolean;
    geminiKeyConfigured: boolean;
    projectConfigured: boolean;
  };
  pipelineFilesReady: boolean;
  missing: string[];
}

const OFFLINE_STATUS: SystemStatus = {
  ok: false,
  api: {
    reachable: false,
    baseUrl: API_BASE_URL,
  },
  rocketride: {
    configured: false,
    uriConfigured: false,
    apiKeyConfigured: false,
  },
  google: {
    configured: false,
    geminiKeyConfigured: false,
    projectConfigured: false,
  },
  pipelineFilesReady: false,
  missing: ['API connection'],
};

export function useSystemStatus() {
  return useQuery({
    queryKey: ['system', 'status'],
    queryFn: async () => {
      try {
        const { data } = await api.get<{ data: SystemStatus }>('/system/status');
        return data.data;
      } catch {
        return OFFLINE_STATUS;
      }
    },
    staleTime: 1000 * 10,
    refetchInterval: 1000 * 20,
  });
}
