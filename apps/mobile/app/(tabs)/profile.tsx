import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card, Typography, Button, Badge } from '../../components/ui';
import { colors, spacing } from '../../components/ui/theme';
import { usePrefsStore } from '../../stores/prefsStore';

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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Typography variant="h2">Profile</Typography>

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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.lg },
  section: { gap: spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tags: { flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap' },
  themeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xs },
});
