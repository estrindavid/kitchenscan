import { Animated, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';
import { brandColors, radii, spacing } from '../ui/theme';
import { FoodIcon, type FoodIconType } from './FoodIcon';
import { useFloatingStyle, usePopInStyle } from './motion';

type SceneProps = {
  animated?: boolean;
  style?: StyleProp<ViewStyle>;
};

type FloatingFoodProps = {
  type: FoodIconType;
  size: number;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  delay?: number;
  rotateDegree?: number;
  animated?: boolean;
};

export function ScannerHeroScene({ animated = true, style }: SceneProps) {
  const beamStyle = useFloatingStyle({ distance: 20, duration: 1700, delay: 120, disabled: !animated });
  const cardStyle = usePopInStyle({ delay: 80, disabled: !animated });

  return (
    <View style={[styles.scene, style]}>
      <Animated.View style={[styles.phone, cardStyle]}>
        <View style={styles.cameraTop} />
        <View style={styles.scannerWindow}>
          <Svg width="100%" height="100%" viewBox="0 0 220 220">
            <Rect x="24" y="24" width="172" height="172" rx="24" fill={brandColors.cream} stroke={brandColors.ink} strokeWidth="5" />
            <Path d="M52 68h34M52 84h58M52 100h44" stroke={brandColors.ink} strokeWidth="5" strokeLinecap="round" opacity="0.22" />
            <Circle cx="146" cy="106" r="34" fill={brandColors.peach} stroke={brandColors.ink} strokeWidth="5" />
            <Path d="M132 106l11 11 24-28" stroke={brandColors.green} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
          <Animated.View style={[styles.scanBeam, beamStyle]} />
        </View>
      </Animated.View>
      <FloatingFood type="tomato" size={48} top={24} left={6} delay={180} animated={animated} />
      <FloatingFood type="milk" size={52} top={44} right={0} delay={360} rotateDegree={-4} animated={animated} />
      <FloatingFood type="lemon" size={44} bottom={18} left={36} delay={540} rotateDegree={5} animated={animated} />
    </View>
  );
}

export function PantryShelfScene({ animated = true, style }: SceneProps) {
  const shelfStyle = usePopInStyle({ delay: 100, distance: 18, disabled: !animated });

  return (
    <View style={[styles.scene, style]}>
      <Animated.View style={[styles.shelfCard, shelfStyle]}>
        <View style={styles.shelfRow}>
          <FoodIcon type="can" size={48} />
          <FoodIcon type="pasta" size={52} />
          <FoodIcon type="milk" size={48} />
        </View>
        <View style={styles.shelfLine} />
        <View style={styles.shelfRow}>
          <FoodIcon type="bread" size={52} />
          <FoodIcon type="broccoli" size={52} />
          <FoodIcon type="carrot" size={50} />
        </View>
      </Animated.View>
      <FloatingFood type="lemon" size={42} top={14} right={18} delay={220} animated={animated} />
      <FloatingFood type="tomato" size={46} bottom={24} left={4} delay={440} rotateDegree={5} animated={animated} />
    </View>
  );
}

export function RecipePlateScene({ animated = true, style }: SceneProps) {
  const cardStyle = usePopInStyle({ delay: 90, distance: 18, disabled: !animated });
  const plateStyle = useFloatingStyle({ distance: 5, duration: 2100, disabled: !animated });

  return (
    <View style={[styles.scene, style]}>
      <Animated.View style={[styles.recipeCard, cardStyle]}>
        <View style={styles.recipeBand} />
        <View style={styles.recipeLineWide} />
        <View style={styles.recipeLine} />
        <View style={styles.recipePillRow}>
          <View style={styles.recipePill} />
          <View style={[styles.recipePill, styles.recipePillAlt]} />
        </View>
      </Animated.View>
      <Animated.View style={[styles.plate, plateStyle]}>
        <Svg width="132" height="132" viewBox="0 0 132 132">
          <Circle cx="66" cy="66" r="56" fill={brandColors.white} stroke={brandColors.ink} strokeWidth="5" />
          <Circle cx="66" cy="66" r="36" fill={brandColors.cream} stroke={brandColors.sky} strokeWidth="5" />
          <Path d="M44 68c12-14 31 15 44-1" stroke={brandColors.coral} strokeWidth="8" strokeLinecap="round" />
          <Line x1="45" y1="90" x2="88" y2="43" stroke={brandColors.green} strokeWidth="7" strokeLinecap="round" />
        </Svg>
      </Animated.View>
      <FloatingFood type="broccoli" size={45} top={20} left={10} delay={220} animated={animated} />
      <FloatingFood type="tomato" size={42} bottom={18} right={18} delay={420} animated={animated} />
    </View>
  );
}

function FloatingFood({
  type,
  size,
  top,
  left,
  right,
  bottom,
  delay = 0,
  rotateDegree = 3,
  animated = true,
}: FloatingFoodProps) {
  const floatStyle = useFloatingStyle({ distance: 8, delay, rotateDegree, disabled: !animated });

  return (
    <Animated.View style={[styles.floatingFood, { top, left, right, bottom }, floatStyle]}>
      <FoodIcon type={type} size={size} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: {
    minHeight: 260,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phone: {
    width: 194,
    height: 292,
    borderRadius: 34,
    borderWidth: 5,
    borderColor: brandColors.ink,
    backgroundColor: brandColors.sky,
    padding: spacing.md,
    shadowColor: brandColors.ink,
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  cameraTop: {
    alignSelf: 'center',
    width: 68,
    height: 12,
    borderRadius: 999,
    backgroundColor: brandColors.ink,
    marginBottom: spacing.md,
  },
  scannerWindow: {
    flex: 1,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: brandColors.white,
  },
  scanBeam: {
    position: 'absolute',
    left: 18,
    right: 18,
    top: 112,
    height: 8,
    borderRadius: 999,
    backgroundColor: brandColors.green,
    opacity: 0.82,
  },
  floatingFood: {
    position: 'absolute',
  },
  shelfCard: {
    width: 254,
    borderRadius: radii.md,
    borderWidth: 5,
    borderColor: brandColors.ink,
    backgroundColor: brandColors.cream,
    padding: spacing.lg,
    gap: spacing.md,
  },
  shelfRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
  },
  shelfLine: {
    height: 6,
    borderRadius: 999,
    backgroundColor: brandColors.ink,
  },
  recipeCard: {
    width: 176,
    minHeight: 210,
    alignSelf: 'flex-start',
    marginLeft: 34,
    borderRadius: radii.md,
    borderWidth: 5,
    borderColor: brandColors.ink,
    backgroundColor: brandColors.white,
    overflow: 'hidden',
    padding: spacing.lg,
    paddingTop: 76,
    gap: spacing.md,
  },
  recipeBand: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 64,
    backgroundColor: brandColors.peach,
    borderBottomWidth: 5,
    borderBottomColor: brandColors.ink,
  },
  recipeLineWide: {
    width: 112,
    height: 10,
    borderRadius: 999,
    backgroundColor: brandColors.ink,
  },
  recipeLine: {
    width: 78,
    height: 8,
    borderRadius: 999,
    backgroundColor: brandColors.sky,
  },
  recipePillRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  recipePill: {
    width: 54,
    height: 24,
    borderRadius: 999,
    backgroundColor: brandColors.mint,
    borderWidth: 3,
    borderColor: brandColors.ink,
  },
  recipePillAlt: {
    backgroundColor: brandColors.lemon,
  },
  plate: {
    position: 'absolute',
    right: 26,
    bottom: 18,
  },
});
