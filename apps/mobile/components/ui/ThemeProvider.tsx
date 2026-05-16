import { createContext, useContext } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { colors as lightColors, type ColorPalette } from './theme';

const ThemeContext = createContext<ColorPalette>(lightColors);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const resolvedColors = useTheme();
  return (
    <ThemeContext.Provider value={resolvedColors}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeColors(): ColorPalette {
  return useContext(ThemeContext);
}
