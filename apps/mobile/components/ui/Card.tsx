import { View, type ViewStyle } from 'react-native';
import { radii, spacing } from './theme';
import { useThemeColors } from './ThemeProvider';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'elevated' | 'outlined' | 'filled';
}

export function Card({ children, style, variant = 'elevated' }: CardProps) {
  const c = useThemeColors();

  const variantStyle: ViewStyle =
    variant === 'elevated'
      ? {
          backgroundColor: c.surface,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 2,
        }
      : variant === 'outlined'
      ? { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border }
      : { backgroundColor: c.surfaceSecondary };

  return (
    <View style={[{ borderRadius: radii.lg, padding: spacing.lg }, variantStyle, style]}>
      {children}
    </View>
  );
}
