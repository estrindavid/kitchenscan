import { useState } from 'react';
import { View, ScrollView, Pressable, StyleSheet, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card, Typography, Button, Badge } from '../../components/ui';
import { colors, spacing } from '../../components/ui/theme';
import { usePrefsStore } from '../../stores/prefsStore';
import { useUsageSummary } from '../../hooks/useUsageSummary';
import { useFeedbackSummary } from '../../hooks/useFeedbackSummary';
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
      <Typography variant="h2">Profile</Typography>

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

function MetricTile({ label, value, suffix = '' }: { label: string; value: number; suffix?: string }) {
  return (
    <View style={styles.metricTile}>
      <Typography variant="h3">{value}{suffix}</Typography>
      <Typography variant="caption" color={colors.textSecondary}>{label}</Typography>
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
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.lg },
  section: { gap: spacing.sm },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tags: { flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap' },
  themeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xs },
  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  metricTile: {
    width: '47%',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 8,
    padding: spacing.md,
    gap: 2,
  },
  feedbackStats: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  ratingRow: { flexDirection: 'row', gap: spacing.xs },
  ratingButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ratingButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  choiceRow: { flexDirection: 'row', gap: spacing.sm },
  choiceButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  choiceButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  feedbackInput: {
    height: 40,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    color: colors.text,
    backgroundColor: colors.surfaceSecondary,
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
    backgroundColor: colors.primaryLight,
  },
  funnelLine: { flex: 1, height: 2, backgroundColor: colors.border, marginHorizontal: spacing.xs },
});
