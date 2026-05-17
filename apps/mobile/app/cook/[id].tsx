import { useEffect, useRef, useState } from 'react';
import { View, Pressable, Dimensions, ScrollView, StyleSheet, Animated } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { FoodIcon, MemphisBackground } from '../../components/brand';
import { Typography, Button } from '../../components/ui';
import { brandColors, colors, spacing, radii } from '../../components/ui/theme';
import { useCookStore } from '../../stores/cookStore';
import { usePantryItems, useUpdatePantryItem } from '../../hooks/usePantry';
import type { Ingredient, PantryItem } from '@kitchenscan/shared';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function CookScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { steps, ingredients, currentStep, nextStep, prevStep, endSession } = useCookStore();
  const { data: pantryItems = [] } = usePantryItems();
  const updatePantryItem = useUpdatePantryItem();

  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [rating, setRating] = useState(0);
  const [depletionDraft, setDepletionDraft] = useState<DepletionDraft[]>([]);
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

  useEffect(() => {
    if (!showCompletion) return;
    setDepletionDraft(buildDepletionDraft(ingredients, pantryItems));
  }, [showCompletion, ingredients, pantryItems]);

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

  async function handleFinish() {
    const usedAt = new Date().toISOString();
    const updates = depletionDraft
      .filter((draft) => draft.action !== 'skip')
      .map((draft) => {
        if (draft.action === 'used_all') {
          return updatePantryItem.mutateAsync({
            id: draft.pantryItem.id,
            quantity: 0,
            status: 'used_up',
            usedAt,
          });
        }

        const nextQuantity = Math.max(0, draft.pantryItem.quantity - draft.amount);
        return updatePantryItem.mutateAsync({
          id: draft.pantryItem.id,
          quantity: nextQuantity,
          ...(nextQuantity === 0 ? { status: 'used_up' as const, usedAt } : {}),
        });
      });

    await Promise.allSettled(updates);
    endSession();
    router.back();
  }

  function updateDraft(id: string, updates: Partial<Pick<DepletionDraft, 'action' | 'amount'>>) {
    setDepletionDraft((current) => current.map((draft) => (
      draft.pantryItem.id === id ? { ...draft, ...updates } : draft
    )));
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
        <View style={styles.depletionCard}>
          <Typography variant="h3" color={brandColors.ink}>Update pantry?</Typography>
          <Typography variant="caption" color={colors.textSecondary}>
            Mark what you used so recipes stay matched to what is actually home.
          </Typography>
          {depletionDraft.length > 0 ? (
            <View style={styles.depletionList}>
              {depletionDraft.map((draft) => (
                <View key={draft.pantryItem.id} style={styles.depletionRow}>
                  <View style={styles.depletionInfo}>
                    <Typography variant="bodyMedium" color={brandColors.ink} numberOfLines={1}>
                      {draft.pantryItem.displayName ?? draft.pantryItem.name}
                    </Typography>
                    <Typography variant="caption" color={colors.textSecondary}>
                      {draft.pantryItem.quantity} {draft.pantryItem.unit} in pantry
                    </Typography>
                  </View>
                  <View style={styles.depletionControls}>
                    <Pressable
                      style={[styles.depletionChip, draft.action === 'skip' && styles.depletionChipActive]}
                      onPress={() => updateDraft(draft.pantryItem.id, { action: 'skip' })}
                    >
                      <Typography variant="captionMedium" color={brandColors.ink}>Skip</Typography>
                    </Pressable>
                    <Pressable
                      style={[styles.depletionChip, draft.action === 'decrement' && styles.depletionChipActive]}
                      onPress={() => updateDraft(draft.pantryItem.id, { action: 'decrement' })}
                    >
                      <Typography variant="captionMedium" color={brandColors.ink}>Use some</Typography>
                    </Pressable>
                    <Pressable
                      style={[styles.depletionChip, draft.action === 'used_all' && styles.depletionChipActive]}
                      onPress={() => updateDraft(draft.pantryItem.id, { action: 'used_all' })}
                    >
                      <Typography variant="captionMedium" color={brandColors.ink}>All</Typography>
                    </Pressable>
                  </View>
                  {draft.action === 'decrement' ? (
                    <View style={styles.amountStepper}>
                      <Pressable
                        style={[styles.amountButton, draft.amount <= 1 && styles.amountButtonDisabled]}
                        disabled={draft.amount <= 1}
                        onPress={() => updateDraft(draft.pantryItem.id, { amount: Math.max(1, draft.amount - 1) })}
                      >
                        <Ionicons name="remove" size={14} color={draft.amount <= 1 ? colors.textTertiary : brandColors.ink} />
                      </Pressable>
                      <Typography variant="captionMedium" color={brandColors.ink}>
                        Use {draft.amount} {draft.pantryItem.unit}
                      </Typography>
                      <Pressable
                        style={[styles.amountButton, draft.amount >= draft.pantryItem.quantity && styles.amountButtonDisabled]}
                        disabled={draft.amount >= draft.pantryItem.quantity}
                        onPress={() => updateDraft(draft.pantryItem.id, { amount: Math.min(draft.pantryItem.quantity, draft.amount + 1) })}
                      >
                        <Ionicons name="add" size={14} color={draft.amount >= draft.pantryItem.quantity ? colors.textTertiary : brandColors.ink} />
                      </Pressable>
                    </View>
                  ) : null}
                </View>
              ))}
            </View>
          ) : (
            <Typography variant="caption" color={colors.textSecondary}>
              No matched pantry ingredients were found for this recipe.
            </Typography>
          )}
        </View>
        <View style={styles.doneBtn}>
          <Button
            label={updatePantryItem.isPending ? 'Updating pantry...' : 'Update Pantry & Done'}
            onPress={() => { void handleFinish(); }}
            loading={updatePantryItem.isPending}
            fullWidth
            size="lg"
          />
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

type DepletionAction = 'skip' | 'decrement' | 'used_all';

interface DepletionDraft {
  ingredient: Ingredient;
  pantryItem: PantryItem;
  action: DepletionAction;
  amount: number;
}

function buildDepletionDraft(ingredients: Ingredient[], pantryItems: PantryItem[]): DepletionDraft[] {
  const activePantry = pantryItems.filter((item) => item.status !== 'used_up');
  const matchedIds = new Set<string>();

  return ingredients
    .filter((ingredient) => !ingredient.isOptional && !ingredient.isGarnish)
    .flatMap((ingredient) => {
      const pantryItem = activePantry.find((item) => {
        if (matchedIds.has(item.id)) return false;
        return namesMatch(ingredient.canonicalName, item.name)
          || namesMatch(ingredient.canonicalName, item.displayName ?? '');
      });
      if (!pantryItem) return [];

      matchedIds.add(pantryItem.id);
      return [{
        ingredient,
        pantryItem,
        action: pantryItem.quantity <= 1 ? 'used_all' : 'decrement',
        amount: 1,
      } satisfies DepletionDraft];
    });
}

function namesMatch(left: string, right: string) {
  const a = normalizeName(left);
  const b = normalizeName(right);
  if (!a || !b) return false;
  return a === b || singularize(a) === singularize(b);
}

function normalizeName(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ');
}

function singularize(value: string) {
  return value.endsWith('s') ? value.slice(0, -1) : value;
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
  depletionCard: {
    width: '100%',
    maxWidth: 520,
    gap: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 3,
    borderColor: brandColors.ink,
    backgroundColor: brandColors.white,
    padding: spacing.lg,
  },
  depletionList: {
    gap: spacing.sm,
  },
  depletionRow: {
    gap: spacing.sm,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceSecondary,
    padding: spacing.md,
  },
  depletionInfo: {
    gap: 2,
  },
  depletionControls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  depletionChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    backgroundColor: brandColors.white,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  depletionChipActive: {
    backgroundColor: brandColors.skyLight,
    borderColor: brandColors.ink,
  },
  amountStepper: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  amountButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: brandColors.white,
  },
  amountButtonDisabled: {
    backgroundColor: colors.surfaceSecondary,
    borderColor: colors.borderLight,
  },
  doneBtn: { marginTop: spacing.sm, width: '100%', maxWidth: 520 },
});
