import { useEffect } from 'react';
import type { ViewStyle } from 'react-native';
import {
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { motion } from '../ui/theme';

type FloatingOptions = {
  distance?: number;
  duration?: number;
  delay?: number;
  rotateDegree?: number;
  disabled?: boolean;
};

type PopInOptions = {
  delay?: number;
  distance?: number;
  duration?: number;
  disabled?: boolean;
};

export const brandMotion = {
  easing: Easing.out(Easing.cubic),
  loopEasing: Easing.inOut(Easing.ease),
  durations: {
    fast: motion.fast,
    medium: motion.medium,
    slow: motion.slow,
    float: motion.float,
  },
  stagger: motion.stagger,
} as const;

export function useFloatingStyle({
  distance = 8,
  duration = motion.float,
  delay = 0,
  rotateDegree = 0,
  disabled = false,
}: FloatingOptions = {}) {
  const reducedMotion = useReducedMotion();
  const progress = useSharedValue(0);

  useEffect(() => {
    if (disabled || reducedMotion) {
      progress.value = 0;
      return;
    }

    progress.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: duration / 2, easing: brandMotion.loopEasing }),
          withTiming(0, { duration: duration / 2, easing: brandMotion.loopEasing }),
        ),
        -1,
        false,
      ),
    );
  }, [delay, disabled, distance, duration, progress, reducedMotion, rotateDegree]);

  return useAnimatedStyle<ViewStyle>(() => {
    const translateY = interpolate(progress.value, [0, 1], [0, -distance]);
    const rotate = interpolate(progress.value, [0, 1], [0, rotateDegree]);

    return {
      transform: [{ translateY }, { rotate: `${rotate}deg` }],
    };
  });
}

export function usePopInStyle({
  delay = 0,
  distance = 12,
  duration = motion.slow,
  disabled = false,
}: PopInOptions = {}) {
  const reducedMotion = useReducedMotion();
  const progress = useSharedValue(disabled || reducedMotion ? 1 : 0);

  useEffect(() => {
    if (disabled || reducedMotion) {
      progress.value = 1;
      return;
    }

    progress.value = withDelay(
      delay,
      withTiming(1, { duration, easing: brandMotion.easing }),
    );
  }, [delay, disabled, distance, duration, progress, reducedMotion]);

  return useAnimatedStyle<ViewStyle>(() => ({
    opacity: progress.value,
    transform: [
      { translateY: interpolate(progress.value, [0, 1], [distance, 0]) },
      { scale: interpolate(progress.value, [0, 1], [0.96, 1]) },
    ],
  }));
}
