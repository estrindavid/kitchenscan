import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card, Typography, Button, Badge } from '../../components/ui';
import { colors, spacing } from '../../components/ui/theme';
import { usePrefsStore } from '../../stores/prefsStore';
import { useUsageSummary } from '../../hooks/useUsageSummary';

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

  const funnel = usage?.funnel ?? {
    scan_started: 0,
    pantry_items_saved: 0,
    recipe_search_viewed: 0,
    recipe_viewed: 0,
  };

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

function MetricTile({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.metricTile}>
      <Typography variant="h3">{value}</Typography>
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
