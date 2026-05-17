import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';
import { brandColors } from '../ui/theme';
import { useFloatingStyle } from './motion';

type MemphisBackgroundProps = {
  variant?: 'sky' | 'peach' | 'cream';
  density?: 'low' | 'medium' | 'high';
  animated?: boolean;
  style?: StyleProp<ViewStyle>;
};

const backgrounds = {
  sky: brandColors.sky,
  peach: brandColors.peach,
  cream: brandColors.cream,
} as const;

export function MemphisBackground({
  variant = 'cream',
  density = 'medium',
  animated = true,
  style,
}: MemphisBackgroundProps) {
  const firstFloat = useFloatingStyle({ distance: 10, rotateDegree: 4, delay: 120, disabled: !animated });
  const secondFloat = useFloatingStyle({ distance: 7, rotateDegree: -5, delay: 340, disabled: !animated });
  const showMedium = density === 'medium' || density === 'high';
  const showHigh = density === 'high';

  return (
    <Animated.View pointerEvents="none" style={[styles.container, { backgroundColor: backgrounds[variant] }, style]}>
      <Svg width="100%" height="100%" viewBox="0 0 390 760" preserveAspectRatio="none">
        <Circle cx="340" cy="76" r="58" fill={brandColors.skyLight} opacity="0.75" />
        <Path d="M20 118c36-26 68-25 94 2s57 29 93 5" stroke={brandColors.white} strokeWidth="4" strokeLinecap="round" />
        <Path d="M21 133c36-26 68-25 94 2s57 29 93 5" stroke={brandColors.white} strokeWidth="4" strokeLinecap="round" opacity="0.72" />
        <Rect x="-28" y="542" width="178" height="178" rx="89" fill={brandColors.sky} opacity="0.8" />
        <Path d="M311 602h92" stroke={brandColors.ink} strokeWidth="4" strokeLinecap="round" />
        <Path d="M326 620h62" stroke={brandColors.ink} strokeWidth="4" strokeLinecap="round" />

        {showMedium ? (
          <G opacity="0.92">
            {Array.from({ length: 7 }).map((_, row) =>
              Array.from({ length: 7 }).map((__, col) => (
                <Circle
                  key={`${row}-${col}`}
                  cx={64 + col * 13}
                  cy={218 + row * 13}
                  r="2.4"
                  fill={brandColors.ink}
                />
              )),
            )}
            <Circle cx="58" cy="650" r="22" fill={brandColors.peachLight} stroke={brandColors.ink} strokeWidth="4" />
          </G>
        ) : null}

        {showHigh ? (
          <G opacity="0.8">
            {Array.from({ length: 8 }).map((_, index) => (
              <Line
                key={index}
                x1={290 + index * 11}
                y1="18"
                x2={216 + index * 11}
                y2="120"
                stroke={brandColors.ink}
                strokeWidth="4"
              />
            ))}
            <Path d="M329 302l22 22-22 22-22-22 22-22z" fill={brandColors.white} stroke={brandColors.ink} strokeWidth="4" />
          </G>
        ) : null}
      </Svg>

      <Animated.View style={[styles.floatShape, styles.peachDot, firstFloat]} />
      <Animated.View style={[styles.floatShape, styles.inkTriangle, secondFloat]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  floatShape: {
    position: 'absolute',
  },
  peachDot: {
    right: 34,
    top: 126,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: brandColors.peach,
    borderWidth: 3,
    borderColor: brandColors.ink,
  },
  inkTriangle: {
    left: 26,
    top: 72,
    width: 0,
    height: 0,
    borderLeftWidth: 13,
    borderRightWidth: 13,
    borderBottomWidth: 24,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: brandColors.ink,
    transform: [{ rotate: '-28deg' }],
  },
});
