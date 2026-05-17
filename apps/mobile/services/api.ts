import axios from 'axios';
import Constants from 'expo-constants';

declare const process: { env?: Record<string, string | undefined> };

function getApiBaseUrl(): string {
  const explicitUrl = process.env?.EXPO_PUBLIC_API_URL;
  if (explicitUrl) return explicitUrl;

  // In Expo Go with --lan, hostUri is "192.168.x.x:port" — reuse the host with API port 3001
  const hostUri = (Constants.expoConfig as { hostUri?: string } | undefined)?.hostUri;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    if (host && host !== 'localhost') {
      return `http://${host}:3001`;
    }
  }
  return (Constants.expoConfig?.extra?.apiUrl as string | undefined) ?? 'http://localhost:3001';
}

export const API_BASE_URL = getApiBaseUrl();

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for future session token.
api.interceptors.request.use((config) => {
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Future auth can handle token refresh or redirect to login here.
    }
    return Promise.reject(error);
  },
);
