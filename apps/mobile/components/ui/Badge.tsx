import { View, Text } from 'react-native';
import { radii, spacing, typography } from './theme';
import { useThemeColors } from './ThemeProvider';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

export function Badge({ label, variant = 'default' }: BadgeProps) {
  const c = useThemeColors();

  const BADGE_COLORS: Record<BadgeVariant, { bg: string; text: string }> = {
    default: { bg: c.surfaceSecondary, text: c.textSecondary },
    primary: { bg: c.primary, text: c.text },
    success: { bg: c.successLight, text: c.success },
    warning: { bg: c.warningLight, text: c.warning },
    danger: { bg: c.dangerLight, text: c.danger },
  };

  const bc = BADGE_COLORS[variant];
  return (
    <View style={{ paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radii.sm, alignSelf: 'flex-start', backgroundColor: bc.bg }}>
      <Text style={{ ...typography.label, color: bc.text }}>{label}</Text>
    </View>
  );
}
