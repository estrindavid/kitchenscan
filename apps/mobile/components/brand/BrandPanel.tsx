import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { brandColors, radii } from '../ui/theme';

type BrandPanelProps = {
  children: ReactNode;
  tone?: 'sky' | 'peach' | 'cream';
  style?: StyleProp<ViewStyle>;
};

const gradients = {
  sky: [brandColors.sky, brandColors.skyLight],
  peach: [brandColors.peach, brandColors.peachLight],
  cream: [brandColors.cream, brandColors.white],
} as const;

export function BrandPanel({ children, tone = 'cream', style }: BrandPanelProps) {
  return (
    <LinearGradient
      colors={gradients[tone]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.panel, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: radii.md,
    borderWidth: 3,
    borderColor: brandColors.ink,
    overflow: 'hidden',
  },
});
