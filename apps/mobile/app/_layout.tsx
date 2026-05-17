import { useEffect, useRef, useState } from 'react';
import { Stack, useRootNavigationState, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppState, StyleSheet } from 'react-native';
import { syncPendingWrites } from '../services/sync';
import { usePrefsStore } from '../stores/prefsStore';
import { useFavoritesStore } from '../stores/favoritesStore';
import { useShoppingStore } from '../stores/shoppingStore';
import { ThemeProvider } from '../components/ui/ThemeProvider';
import { useTheme } from '../hooks/useTheme';
import { darkColors } from '../components/ui/theme';
import { trackEvent } from '../services/analytics';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 2,
    },
  },
});

function AppContent() {
  const resolvedColors = useTheme();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();
  const didForceWelcome = useRef(false);
  const isDark = resolvedColors === darkColors;

  useEffect(() => {
    if (didForceWelcome.current || !rootNavigationState?.key) return;

    didForceWelcome.current = true;
    router.replace('/onboarding/welcome');
  }, [rootNavigationState?.key, router]);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />
    </>
  );
}

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const loadPrefs = usePrefsStore((s) => s.loadPrefs);
  const loadFavorites = useFavoritesStore((s) => s.load);
  const loadShopping = useShoppingStore((s) => s.load);

  useEffect(() => {
    void trackEvent('app_opened', {});

    Promise.all([loadPrefs(), loadFavorites(), loadShopping()]).finally(() =>
      setIsReady(true),
    );

    syncPendingWrites().catch(() => {});

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        syncPendingWrites().catch(() => {});
      }
    });
    return () => sub.remove();
  }, []);

  if (!isReady) return null;

  return (
    <GestureHandlerRootView style={styles.container}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
