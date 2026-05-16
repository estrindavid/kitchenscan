import { Pressable, Text, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useThemeColors } from './ThemeProvider';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const SIZE_STYLES: Record<ButtonSize, { h: number; px: number; fs: number; radius: number }> = {
  sm: { h: 32, px: 12, fs: 13, radius: 8 },
  md: { h: 44, px: 20, fs: 15, radius: 10 },
  lg: { h: 52, px: 24, fs: 16, radius: 12 },
};

export function Button({
  label, onPress, variant = 'primary', size = 'md',
  loading, disabled, icon, fullWidth,
}: ButtonProps) {
  const c = useThemeColors();
  const s = SIZE_STYLES[size];

  const VARIANT_STYLES: Record<ButtonVariant, { bg: string; text: string; border: string }> = {
    primary:   { bg: c.primary, text: '#FFFFFF', border: c.primary },
    secondary: { bg: c.surfaceSecondary, text: c.text, border: c.border },
    ghost:     { bg: 'transparent', text: c.text, border: 'transparent' },
    danger:    { bg: c.dangerLight, text: c.danger, border: c.dangerBorder },
  };

  const v = VARIANT_STYLES[variant];

  return (
    <Pressable
      onPressIn={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
      onPress={disabled || loading ? undefined : onPress}
      style={({ pressed }) => ({
        height: s.h,
        paddingHorizontal: s.px,
        backgroundColor: disabled ? c.border : v.bg,
        borderColor: disabled ? c.border : v.border,
        borderWidth: 1,
        borderRadius: s.radius,
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        gap: 8,
        opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        alignSelf: fullWidth ? 'stretch' as const : 'flex-start' as const,
        transform: [{ scale: pressed ? 0.97 : 1 }],
      })}
    >
      {loading ? (
        <ActivityIndicator size="small" color={v.text} />
      ) : (
        <>
          {icon}
          <Text style={{ fontSize: s.fs, fontWeight: '600', color: disabled ? c.textTertiary : v.text }}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}
