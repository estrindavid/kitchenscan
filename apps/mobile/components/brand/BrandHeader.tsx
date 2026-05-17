import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { brandColors, radii, spacing } from '../ui/theme';
import { Typography } from '../ui';

type BrandHeaderProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  accent?: 'sky' | 'peach' | 'mint' | 'lemon';
  accessory?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

const accentColors = {
  sky: brandColors.skyLight,
  peach: brandColors.peachLight,
  mint: brandColors.mint,
  lemon: brandColors.lemon,
} as const;

export function BrandHeader({
  eyebrow,
  title,
  subtitle,
  accent = 'sky',
  accessory,
  style,
}: BrandHeaderProps) {
  return (
    <View style={[styles.container, { backgroundColor: accentColors[accent] }, style]}>
      <View style={styles.copy}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Typography variant="h2" color={brandColors.ink}>{title}</Typography>
        <Typography variant="caption" color={brandColors.ink} style={styles.subtitle}>
          {subtitle}
        </Typography>
      </View>
      {accessory ? <View style={styles.accessory}>{accessory}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radii.md,
    borderWidth: 3,
    borderColor: brandColors.ink,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  eyebrow: {
    color: brandColors.ink,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  subtitle: {
    lineHeight: 18,
  },
  accessory: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
