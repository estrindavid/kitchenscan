import { useColorScheme } from 'react-native';
import { colors, darkColors } from '../components/ui/theme';
import { usePrefsStore } from '../stores/prefsStore';

export function useTheme() {
  const systemScheme = useColorScheme();
  const themeMode = usePrefsStore((s) => s.themeMode);

  const isDark =
    themeMode === 'dark' ||
    (themeMode === 'system' && systemScheme === 'dark');

  return isDark ? darkColors : colors;
}
