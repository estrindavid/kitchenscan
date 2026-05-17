import { useEffect, useRef, useState } from 'react';
import { View, Pressable, Dimensions, ScrollView, StyleSheet, Animated } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { FoodIcon, MemphisBackground } from '../../components/brand';
import { Typography, Button } from '../../components/ui';
import { brandColors, colors, spacing, radii } from '../../components/ui/theme';
import { useCookStore } from '../../stores/cookStore';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function CookScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { steps, currentStep, nextStep, prevStep, endSession } = useCookStore();

  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [rating, setRating] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const slideX = useRef(new Animated.Value(0)).current;

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  // Reset timer when step changes
  useEffect(() => {
    clearTimer();
    if (step?.durationMinutes) {
      setSecondsLeft(step.durationMinutes * 60);
    } else {
      setSecondsLeft(null);
    }
    setTimerRunning(false);
  }, [currentStep]);

  // Redirect if no active session
  useEffect(() => {
    if (steps.length === 0) {
      router.back();
    }
  }, []);

  function clearTimer() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  function toggleTimer() {
    if (timerRunning) {
      clearTimer();
      setTimerRunning(false);
    } else {
      setTimerRunning(true);
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev === null || prev <= 1) {
            clearTimer();
            setTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }

  // Cleanup on unmount
  useEffect(() => () => clearTimer(), []);

  function animateStep(forward: boolean) {
    slideX.setValue(forward ? SCREEN_WIDTH : -SCREEN_WIDTH);
    Animated.spring(slideX, { toValue: 0, damping: 20, stiffness: 200, useNativeDriver: true }).start();
  }

  function handleNext() {
    if (isLastStep) {
      setShowCompletion(true);
    } else {
      animateStep(true);
      nextStep();
    }
  }

  function handleFinish() {
    endSession();
    router.back();
  }

  function formatTime(secs: number) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  if (!step) return null;

  if (showCompletion) {
    return (
      <View style={styles.completionContainer}>
        <MemphisBackground variant="peach" density="high" />
        <FoodIcon type="tomato" size={72} />
        <Typography variant="h1" color={brandColors.ink} style={styles.completionTitle}>Recipe Complete!</Typography>
        <Typography variant="body" color={colors.textSecondary}>
          How did it turn out?
        </Typography>
        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Pressable key={star} onPress={() => setRating(star)} hitSlop={8}>
              <Ionicons
                name={star <= rating ? 'star' : 'star-outline'}
                size={36}
                color={star <= rating ? brandColors.lemon : colors.border}
              />
            </Pressable>
          ))}
        </View>
        <View style={styles.doneBtn}>
          <Button label="Done" onPress={handleFinish} fullWidth size="lg" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MemphisBackground variant="cream" density="low" animated={false} />
      <View style={styles.topCard}>
        <Typography variant="label" color={brandColors.sky}>Cook mode</Typography>
        <Typography variant="h2" color={brandColors.ink}>Step {currentStep + 1} of {steps.length}</Typography>
      </View>
      {/* Progress dots */}
      <View style={styles.progressRow}>
        {steps.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === currentStep && styles.dotActive,
              i < currentStep && styles.dotDone,
            ]}
          />
        ))}
      </View>

      {/* Step content */}
      <Animated.View style={[{ flex: 1 }, { transform: [{ translateX: slideX }] }]}>
        <ScrollView
          contentContainerStyle={styles.stepContent}
          showsVerticalScrollIndicator={false}
        >
          <Typography variant="label" color={colors.textTertiary} style={styles.stepLabel}>
            STEP {currentStep + 1} OF {steps.length}
          </Typography>
          <View style={styles.instructionCard}>
            <FoodIcon type={currentStep % 2 === 0 ? 'carrot' : 'lemon'} size={62} />
            <Typography variant="h2" color={brandColors.ink} style={styles.stepInstruction}>
              {step.instruction}
            </Typography>
          </View>

          {/* Timer */}
          {secondsLeft !== null ? (
            <View style={styles.timerCard}>
              <Typography variant="h1" style={styles.timerText}>
                {formatTime(secondsLeft)}
              </Typography>
              {step.timerLabel ? (
                <Typography variant="caption" color={colors.textSecondary}>
                  {step.timerLabel}
                </Typography>
              ) : null}
              <Pressable style={styles.timerBtn} onPress={toggleTimer}>
                <Ionicons
                  name={timerRunning ? 'pause' : 'play'}
                  size={20}
                  color="#fff"
                />
                <Typography variant="bodyMedium" color="#fff">
                  {timerRunning ? 'Pause' : 'Start Timer'}
                </Typography>
              </Pressable>
            </View>
          ) : null}
        </ScrollView>
      </Animated.View>

      {/* Bottom nav */}
      <View style={styles.bottomBar}>
        <View style={styles.navBtn}>
          <Button
            label="Previous"
            variant="secondary"
            onPress={() => { animateStep(false); prevStep(); }}
            fullWidth
            disabled={currentStep === 0}
          />
        </View>
        <View style={styles.navBtn}>
          <Button
            label={isLastStep ? 'Finish Cooking' : 'Next'}
            onPress={handleNext}
            fullWidth
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: brandColors.cream },
  topCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radii.md,
    borderWidth: 3,
    borderColor: brandColors.ink,
    backgroundColor: brandColors.white,
    gap: spacing.xs,
  },
  progressRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    justifyContent: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: brandColors.ink,
    backgroundColor: colors.borderLight,
  },
  dotActive: { backgroundColor: brandColors.lemon, width: 26 },
  dotDone: { backgroundColor: brandColors.green },
  stepContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing['4xl'],
    gap: spacing.xl,
    alignItems: 'center',
  },
  stepLabel: { alignSelf: 'center' },
  instructionCard: {
    width: '100%',
    alignItems: 'center',
    gap: spacing.lg,
    borderRadius: radii.md,
    borderWidth: 3,
    borderColor: brandColors.ink,
    backgroundColor: brandColors.white,
    padding: spacing['2xl'],
  },
  stepInstruction: {
    textAlign: 'center',
    lineHeight: 32,
  },
  timerCard: {
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: brandColors.skyLight,
    borderRadius: radii.md,
    padding: spacing['3xl'],
    borderWidth: 3,
    borderColor: brandColors.ink,
    width: '100%',
  },
  timerText: { fontSize: 56, lineHeight: 64 },
  timerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: brandColors.ink,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing['2xl'],
    borderRadius: radii.md,
  },
  bottomBar: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['2xl'],
    paddingTop: spacing.md,
    borderTopWidth: 3,
    borderTopColor: brandColors.ink,
    backgroundColor: brandColors.white,
  },
  navBtn: { flex: 1 },
  completionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    padding: spacing['3xl'],
    backgroundColor: brandColors.peachLight,
  },
  completionTitle: { textAlign: 'center' },
  stars: { flexDirection: 'row', gap: spacing.md },
  doneBtn: { marginTop: spacing.xl },
});
