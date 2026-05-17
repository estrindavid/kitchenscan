import { useState } from 'react';
import { View, ScrollView, Pressable, StyleSheet, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BrandHeader, FoodIcon, MemphisBackground } from '../../components/brand';
import { Card, Typography, Button, Badge } from '../../components/ui';
import { brandColors, colors, radii, spacing } from '../../components/ui/theme';
import { usePrefsStore } from '../../stores/prefsStore';
import { useUsageSummary } from '../../hooks/useUsageSummary';
import { useFeedbackSummary } from '../../hooks/useFeedbackSummary';
import { useImpactSummary } from '../../hooks/useImpactSummary';
import { useSystemStatus } from '../../hooks/useSystemStatus';
import { api } from '../../services/api';
import { getAnonymousId, trackEvent } from '../../services/analytics';

const SKILL_EMOJI: Record<string, string> = {
  beginner: '🍳',
  intermediate: '👨‍🍳',
  advanced: '⭐',
};

export default function ProfileScreen() {
  const router = useRouter();
  const skillLevel = usePrefsStore((s) => s.skillLevel);
  const dietaryRestrictions = usePrefsStore((s) => s.dietaryRestrictions);
  const allergens = usePrefsStore((s) => s.allergens);
  const householdSize = usePrefsStore((s) => s.householdSize);
  const themeMode = usePrefsStore((s) => s.themeMode);
  const setThemeMode = usePrefsStore((s) => s.setThemeMode);
  const { data: usage } = useUsageSummary();
  const { data: feedback, refetch: refetchFeedback } = useFeedbackSummary();
  const { data: impact } = useImpactSummary();
  const { data: system } = useSystemStatus();
  const [rating, setRating] = useState(5);
  const [wouldUseAgain, setWouldUseAgain] = useState(true);
  const [mostUseful, setMostUseful] = useState('');
  const [friction, setFriction] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const funnel = usage?.funnel ?? {
    scan_started: 0,
    pantry_items_saved: 0,
    recipe_search_viewed: 0,
    recipe_viewed: 0,
  };
  const demoLockItems = [
    { label: 'RocketRide pipeline', ready: system?.rocketride.configured ?? false },
    { label: 'Gemini / Google AI', ready: system?.google.configured ?? false },
    { label: 'Connected API', ready: system?.api.reachable ?? false },
    { label: 'Animated app shell', ready: true },
    { label: 'Impact + validation board', ready: Boolean(impact || usage || feedback) },
  ];
  const lockedItems = demoLockItems.filter((item) => item.ready).length;

  async function handleSubmitFeedback() {
    setFeedbackStatus('saving');
    try {
      const anonymousId = await getAnonymousId();
      await api.post('/feedback', {
        anonymousId,
        rating,
        wouldUseAgain,
        mostUseful: mostUseful.trim() || undefined,
        friction: friction.trim() || undefined,
      });
      await trackEvent('tester_feedback_submitted', { rating, wouldUseAgain });
      setMostUseful('');
      setFriction('');
      setFeedbackStatus('saved');
      void refetchFeedback();
    } catch {
      setFeedbackStatus('error');
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <MemphisBackground variant="cream" density="low" animated={false} />
      <BrandHeader
        eyebrow="Demo board"
        title="KitchenScan"
        subtitle="RocketRide, Gemini, validation, and impact in one judge-ready view."
        accent="peach"
        accessory={<FoodIcon type="milk" size={58} />}
      />

      <Card style={styles.lockCard}>
        <View style={styles.sectionHeader}>
          <View>
            <Typography variant="h3" color={brandColors.ink}>Demo Lock</Typography>
            <Typography variant="caption" color={colors.textSecondary}>
              {lockedItems}/{demoLockItems.length} judge-critical surfaces ready
            </Typography>
          </View>
          <View style={styles.lockBadge}>
            <Typography variant="captionMedium" color={brandColors.ink}>
              Sprint 5
            </Typography>
          </View>
        </View>
        <View style={styles.lockRows}>
          {demoLockItems.map((item) => (
            <DemoLockRow key={item.label} label={item.label} ready={item.ready} />
          ))}
        </View>
      </Card>

      {/* Demo readiness */}
      <Card style={styles.heroSection}>
        <View style={styles.sectionHeader}>
          <Typography variant="h3" color={brandColors.ink}>Demo Readiness</Typography>
          <Badge label={system?.ok ? 'Ready' : 'Needs setup'} variant={system?.ok ? 'success' : 'warning'} />
        </View>
        <View style={styles.statusRows}>
          <StatusRow label="API" ready={system?.api.reachable ?? false} />
          <StatusRow label="RocketRide" ready={system?.rocketride.configured ?? false} />
          <StatusRow label="Gemini / Google" ready={system?.google.configured ?? false} />
          <StatusRow label="Pipelines" ready={system?.pipelineFilesReady ?? false} />
        </View>
        {system?.missing.length ? (
          <Typography variant="caption" color={colors.textSecondary}>
            Missing: {system.missing.slice(0, 4).join(', ')}
          </Typography>
        ) : null}
      </Card>

      {/* Impact snapshot */}
      <Card style={styles.heroSection}>
        <View style={styles.sectionHeader}>
          <Typography variant="h3" color={brandColors.ink}>Impact Snapshot</Typography>
          <Badge
            label={readinessLabel(impact?.validationReadiness ?? 'needs_testers')}
            variant={readinessVariant(impact?.validationReadiness ?? 'needs_testers')}
          />
        </View>
        <View style={styles.metricGrid}>
          <MetricTile label="Meals" value={impact?.estimatedMealsAvailable ?? 0} />
          <MetricTile label="Rescue" value={impact?.estimatedMealsRescuable ?? 0} />
          <MetricTile label="Savings" value={impact?.estimatedGrocerySavingsDollars ?? 0} prefix="$" />
          <MetricTile label="Scan to Recipe" value={impact?.scanToRecipeConversionRate ?? 0} suffix="%" />
        </View>
        <View style={styles.impactHighlights}>
          {(impact?.highlights ?? ['Scan pantry items to unlock meal and savings estimates.']).slice(0, 3).map((highlight) => (
            <View key={highlight} style={styles.impactHighlightRow}>
              <Ionicons name="checkmark-circle" size={16} color={brandColors.green} />
              <Typography variant="caption" color={colors.textSecondary} style={styles.impactHighlightText}>
                {highlight}
              </Typography>
            </View>
          ))}
        </View>
      </Card>

      {/* Validation metrics */}
      <Card style={styles.section}>
        <View style={styles.sectionHeader}>
          <Typography variant="h3">Validation</Typography>
          <Badge label={`${usage?.uniqueUsers ?? 0} users`} variant="primary" />
        </View>
        <View style={styles.metricGrid}>
          <MetricTile label="Events" value={usage?.totalEvents ?? 0} />
          <MetricTile label="Scans" value={funnel.scan_started} />
          <MetricTile label="Pantry Saves" value={funnel.pantry_items_saved} />
          <MetricTile label="Recipe Views" value={funnel.recipe_viewed} />
        </View>
        <View style={styles.funnelRow}>
          <FunnelStep label="Scan" value={funnel.scan_started} />
          <View style={styles.funnelLine} />
          <FunnelStep label="Pantry" value={funnel.pantry_items_saved} />
          <View style={styles.funnelLine} />
          <FunnelStep label="Recipes" value={funnel.recipe_search_viewed} />
        </View>
      </Card>

      {/* Tester feedback */}
      <Card style={styles.section}>
        <View style={styles.sectionHeader}>
          <Typography variant="h3">Tester Feedback</Typography>
          <Badge label={`${feedback?.averageRating ?? 0}/5 avg`} variant="success" />
        </View>
        <View style={styles.feedbackStats}>
          <MetricTile label="Responses" value={feedback?.totalFeedback ?? 0} />
          <MetricTile label="Would Use" value={feedback?.wouldUseAgainRate ?? 0} suffix="%" />
        </View>
        <View style={styles.ratingRow}>
          {[1, 2, 3, 4, 5].map((value) => (
            <Pressable
              key={value}
              style={[styles.ratingButton, rating === value && styles.ratingButtonSelected]}
              onPress={() => setRating(value)}
            >
              <Typography
                variant="bodyMedium"
                color={rating === value ? '#fff' : colors.text}
              >
                {value}
              </Typography>
            </Pressable>
          ))}
        </View>
        <View style={styles.choiceRow}>
          <Pressable
            style={[styles.choiceButton, wouldUseAgain && styles.choiceButtonSelected]}
            onPress={() => setWouldUseAgain(true)}
          >
            <Typography variant="captionMedium" color={wouldUseAgain ? '#fff' : colors.text}>
              Would use
            </Typography>
          </Pressable>
          <Pressable
            style={[styles.choiceButton, !wouldUseAgain && styles.choiceButtonSelected]}
            onPress={() => setWouldUseAgain(false)}
          >
            <Typography variant="captionMedium" color={!wouldUseAgain ? '#fff' : colors.text}>
              Not yet
            </Typography>
          </Pressable>
        </View>
        <TextInput
          style={styles.feedbackInput}
          value={mostUseful}
          onChangeText={setMostUseful}
          placeholder="Most useful part"
          placeholderTextColor={colors.textTertiary}
        />
        <TextInput
          style={styles.feedbackInput}
          value={friction}
          onChangeText={setFriction}
          placeholder="What felt rough?"
          placeholderTextColor={colors.textTertiary}
        />
        <Button
          label={feedbackStatus === 'saving' ? 'Saving...' : 'Submit Feedback'}
          onPress={handleSubmitFeedback}
          loading={feedbackStatus === 'saving'}
          disabled={feedbackStatus === 'saving'}
        />
        {feedbackStatus === 'saved' ? (
          <Typography variant="caption" color={colors.success}>Feedback saved.</Typography>
        ) : feedbackStatus === 'error' ? (
          <Typography variant="caption" color={colors.danger}>Could not save feedback.</Typography>
        ) : null}
      </Card>

      {/* Account info */}
      <Card style={styles.section}>
        <Typography variant="h3">Account</Typography>
        <View style={styles.row}>
          <Typography variant="body" color={colors.textSecondary}>Skill level</Typography>
          <Typography variant="bodyMedium">
            {SKILL_EMOJI[skillLevel]} {skillLevel.charAt(0).toUpperCase() + skillLevel.slice(1)}
          </Typography>
        </View>
        <View style={styles.row}>
          <Typography variant="body" color={colors.textSecondary}>Household size</Typography>
          <Typography variant="bodyMedium">{householdSize}</Typography>
        </View>
      </Card>

      {/* Dietary preferences */}
      <Card style={styles.section}>
        <Typography variant="h3">Dietary Preferences</Typography>
        <View style={styles.tags}>
          {dietaryRestrictions.length > 0 ? (
            dietaryRestrictions.map((r) => <Badge key={r} label={r.replace(/_/g, ' ')} variant="success" />)
          ) : (
            <Badge label="None set" />
          )}
        </View>
        <Button
          label="Edit Preferences"
          variant="secondary"
          size="sm"
          onPress={() => router.push('/profile/edit-preferences')}
        />
      </Card>

      {/* Allergens */}
      <Card style={styles.section}>
        <Typography variant="h3">Allergens</Typography>
        <View style={styles.tags}>
          {allergens.length > 0 ? (
            allergens.map((a) => <Badge key={a} label={a} variant="warning" />)
          ) : (
            <Badge label="None set" />
          )}
        </View>
        <Button
          label="Edit Allergens"
          variant="secondary"
          size="sm"
          onPress={() => router.push('/profile/edit-allergens')}
        />
      </Card>

      {/* Navigation rows */}
      <Card style={styles.section}>
        <Button
          label="Favorites"
          variant="secondary"
          fullWidth
          onPress={() => router.push('/profile/favorites')}
        />
        <Button
          label="Shopping List"
          variant="secondary"
          fullWidth
          onPress={() => router.push('/shopping-list')}
        />
      </Card>

      {/* Appearance */}
      <Card style={styles.section}>
        <Typography variant="h3">Appearance</Typography>
        {(['system', 'light', 'dark'] as const).map((mode) => (
          <Pressable
            key={mode}
            style={styles.themeRow}
            onPress={() => setThemeMode(mode)}
          >
            <Ionicons
              name={themeMode === mode ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={themeMode === mode ? colors.primary : colors.textTertiary}
            />
            <Typography
              variant="body"
              color={themeMode === mode ? colors.primary : colors.text}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </Typography>
          </Pressable>
        ))}
      </Card>

      <Button
        label="Sign Out"
        variant="danger"
        onPress={() => {}}
        fullWidth
      />
    </ScrollView>
  );
}

function MetricTile({
  label,
  value,
  prefix = '',
  suffix = '',
}: {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <View style={styles.metricTile}>
      <Typography variant="h3">{prefix}{value}{suffix}</Typography>
      <Typography variant="caption" color={colors.textSecondary}>{label}</Typography>
    </View>
  );
}

function readinessLabel(readiness: 'needs_testers' | 'promising' | 'demo_ready') {
  if (readiness === 'demo_ready') return 'Demo ready';
  if (readiness === 'promising') return 'Promising';
  return 'Needs testers';
}

function readinessVariant(readiness: 'needs_testers' | 'promising' | 'demo_ready') {
  if (readiness === 'demo_ready') return 'success';
  if (readiness === 'promising') return 'primary';
  return 'warning';
}

function StatusRow({ label, ready }: { label: string; ready: boolean }) {
  return (
    <View style={styles.statusRow}>
      <View style={[styles.statusDot, ready ? styles.statusDotReady : styles.statusDotMissing]} />
      <Typography variant="captionMedium" color={colors.text}>{label}</Typography>
      <Typography variant="caption" color={ready ? colors.success : colors.warning}>
        {ready ? 'Connected' : 'Check'}
      </Typography>
    </View>
  );
}

function DemoLockRow({ label, ready }: { label: string; ready: boolean }) {
  return (
    <View style={styles.lockRow}>
      <Ionicons
        name={ready ? 'checkmark-circle' : 'ellipse-outline'}
        size={18}
        color={ready ? brandColors.green : colors.warning}
      />
      <Typography variant="captionMedium" color={brandColors.ink} style={styles.lockText}>
        {label}
      </Typography>
      <Typography variant="caption" color={ready ? colors.success : colors.warning}>
        {ready ? 'Ready' : 'Check'}
      </Typography>
    </View>
  );
}

function FunnelStep({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.funnelStep}>
      <View style={styles.funnelDot}>
        <Typography variant="captionMedium" color={colors.primary}>{value}</Typography>
      </View>
      <Typography variant="caption" color={colors.textSecondary}>{label}</Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: brandColors.cream },
  content: { padding: spacing.lg, gap: spacing.lg },
  section: {
    gap: spacing.sm,
    borderWidth: 2,
    borderColor: brandColors.ink,
  },
  heroSection: {
    gap: spacing.sm,
    borderWidth: 3,
    borderColor: brandColors.ink,
    backgroundColor: brandColors.white,
  },
  lockCard: {
    gap: spacing.md,
    borderWidth: 3,
    borderColor: brandColors.ink,
    backgroundColor: brandColors.lemon,
  },
  lockBadge: {
    borderRadius: radii.md,
    borderWidth: 2,
    borderColor: brandColors.ink,
    backgroundColor: brandColors.white,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  lockRows: { gap: spacing.xs },
  lockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 2,
    borderColor: brandColors.ink,
    backgroundColor: brandColors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  lockText: { flex: 1 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tags: { flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap' },
  themeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xs },
  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  metricTile: {
    width: '47%',
    backgroundColor: brandColors.white,
    borderRadius: radii.md,
    borderWidth: 2,
    borderColor: brandColors.ink,
    padding: spacing.md,
    gap: 2,
  },
  impactHighlights: { gap: spacing.xs },
  impactHighlightRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs },
  impactHighlightText: { flex: 1 },
  statusRows: { gap: spacing.xs },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: brandColors.cream,
    borderRadius: radii.md,
    borderWidth: 2,
    borderColor: brandColors.ink,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  statusDot: { width: 9, height: 9, borderRadius: 5 },
  statusDotReady: { backgroundColor: brandColors.green },
  statusDotMissing: { backgroundColor: colors.warning },
  feedbackStats: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  ratingRow: { flexDirection: 'row', gap: spacing.xs },
  ratingButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: brandColors.white,
    borderWidth: 2,
    borderColor: brandColors.ink,
  },
  ratingButtonSelected: {
    backgroundColor: brandColors.ink,
    borderColor: brandColors.ink,
  },
  choiceRow: { flexDirection: 'row', gap: spacing.sm },
  choiceButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    backgroundColor: brandColors.white,
    borderWidth: 2,
    borderColor: brandColors.ink,
  },
  choiceButtonSelected: {
    backgroundColor: brandColors.ink,
    borderColor: brandColors.ink,
  },
  feedbackInput: {
    height: 40,
    borderWidth: 2,
    borderColor: brandColors.ink,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    color: colors.text,
    backgroundColor: brandColors.white,
  },
  funnelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.xs,
  },
  funnelStep: { alignItems: 'center', gap: spacing.xs, minWidth: 64 },
  funnelDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: brandColors.lemon,
    borderWidth: 2,
    borderColor: brandColors.ink,
  },
  funnelLine: { flex: 1, height: 3, backgroundColor: brandColors.ink, marginHorizontal: spacing.xs },
});
