import { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, Easing, type ViewStyle } from 'react-native';
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
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;
    let cancelled = false;

    AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (cancelled || disabled || reduceMotion) {
        progress.setValue(0);
        return;
      }

      animation = Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(progress, {
            toValue: 1,
            duration: duration / 2,
            easing: brandMotion.loopEasing,
            useNativeDriver: true,
          }),
          Animated.timing(progress, {
            toValue: 0,
            duration: duration / 2,
            easing: brandMotion.loopEasing,
            useNativeDriver: true,
          }),
        ]),
      );
      animation.start();
    });

    return () => {
      cancelled = true;
      animation?.stop();
    };
  }, [delay, disabled, duration, progress]);

  return {
    transform: [
      {
        translateY: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -distance],
        }),
      },
      {
        rotate: progress.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', `${rotateDegree}deg`],
        }),
      },
    ],
  } satisfies Animated.WithAnimatedObject<ViewStyle>;
}

export function usePopInStyle({
  delay = 0,
  distance = 12,
  duration = motion.slow,
  disabled = false,
}: PopInOptions = {}) {
  const progress = useRef(new Animated.Value(disabled ? 1 : 0)).current;

  useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;
    let cancelled = false;

    AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (cancelled || disabled || reduceMotion) {
        progress.setValue(1);
        return;
      }

      animation = Animated.sequence([
        Animated.delay(delay),
        Animated.timing(progress, {
          toValue: 1,
          duration,
          easing: brandMotion.easing,
          useNativeDriver: true,
        }),
      ]);
      animation.start();
    });

    return () => {
      cancelled = true;
      animation?.stop();
    };
  }, [delay, disabled, duration, progress]);

  return {
    opacity: progress,
    transform: [
      {
        translateY: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [distance, 0],
        }),
      },
      {
        scale: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0.96, 1],
        }),
      },
    ],
  } satisfies Animated.WithAnimatedObject<ViewStyle>;
}
