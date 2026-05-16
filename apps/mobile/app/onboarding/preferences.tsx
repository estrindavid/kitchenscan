import { useState } from 'react';
import { View, ScrollView, Pressable, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Button, Typography, Input } from '../../components/ui';
import { colors, spacing, radii } from '../../components/ui/theme';
import { usePrefsStore } from '../../stores/prefsStore';
import type { SkillLevel } from '@kitchenscan/shared';

const SKILL_LEVELS: { key: SkillLevel; label: string; emoji: string; desc: string }[] = [
  { key: 'beginner', label: 'Beginner', emoji: '🍳', desc: 'Simple recipes with basic techniques' },
  { key: 'intermediate', label: 'Intermediate', emoji: '👨‍🍳', desc: 'More complex dishes and techniques' },
  { key: 'advanced', label: 'Advanced', emoji: '⭐', desc: 'Challenging recipes and pro techniques' },
];

const CUISINE_OPTIONS = [
  { id: 'italian', label: 'Italian', emoji: '🇮🇹' },
  { id: 'mexican', label: 'Mexican', emoji: '🇲🇽' },
  { id: 'chinese', label: 'Chinese', emoji: '🇨🇳' },
  { id: 'japanese', label: 'Japanese', emoji: '🇯🇵' },
  { id: 'indian', label: 'Indian', emoji: '🇮🇳' },
  { id: 'thai', label: 'Thai', emoji: '🇹🇭' },
  { id: 'french', label: 'French', emoji: '🇫🇷' },
  { id: 'korean', label: 'Korean', emoji: '🇰🇷' },
  { id: 'mediterranean', label: 'Mediterranean', emoji: '🫒' },
  { id: 'american', label: 'American', emoji: '🇺🇸' },
];

export default function PreferencesScreen() {
  const router = useRouter();
  const setSkillLevel = usePrefsStore((s) => s.setSkillLevel);
  const setHouseholdSize = usePrefsStore((s) => s.setHouseholdSize);
  const completeOnboarding = usePrefsStore((s) => s.completeOnboarding);

  const [skill, setSkill] = useState<SkillLevel>('beginner');
  const [household, setHousehold] = useState('1');
  const [cuisines, setCuisines] = useState<Set<string>>(new Set());

  const toggleCuisine = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCuisines((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleFinish = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSkillLevel(skill);
    setHouseholdSize(parseInt(household, 10) || 1);
    completeOnboarding();
    router.replace('/(tabs)/pantry');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Typography variant="h1">Almost done!</Typography>

      <View style={styles.section}>
        <Typography variant="h3">Cooking Skill Level</Typography>
        {SKILL_LEVELS.map((level) => {
          const isSelected = skill === level.key;
          return (
            <Pressable
              key={level.key}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSkill(level.key);
              }}
              style={[styles.option, isSelected && styles.optionSelected]}
            >
              <Text style={styles.optionEmoji}>{level.emoji}</Text>
              <View style={styles.optionText}>
                <Text style={[styles.optionTitle, isSelected && styles.optionTitleSelected]}>
                  {level.label}
                </Text>
                <Text style={styles.optionDesc}>{level.desc}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.section}>
        <Typography variant="h3">Favorite Cuisines</Typography>
        <Typography variant="caption" color={colors.textSecondary}>
          We'll prioritize these in recipe suggestions
        </Typography>
        <View style={styles.chipGrid}>
          {CUISINE_OPTIONS.map(({ id, label, emoji }) => {
            const isSelected = cuisines.has(id);
            return (
              <Pressable
                key={id}
                onPress={() => toggleCuisine(id)}
                style={[styles.chip, isSelected && styles.chipSelected]}
              >
                <Text style={styles.chipEmoji}>{emoji}</Text>
                <Text style={[styles.chipLabel, isSelected && styles.chipLabelSelected]}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Input
        label="Household Size"
        value={household}
        onChangeText={setHousehold}
        keyboardType="number-pad"
        placeholder="1"
      />

      <Button
        label="Start Cooking"
        onPress={handleFinish}
        fullWidth
        size="lg"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing['3xl'], gap: spacing.xl },
  section: { gap: spacing.sm },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  optionEmoji: { fontSize: 24 },
  optionText: { flex: 1 },
  optionTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
  optionTitleSelected: { color: colors.primary },
  optionDesc: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: spacing.xs },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 8, paddingHorizontal: 14,
    borderRadius: radii.full, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipSelected: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  chipEmoji: { fontSize: 16 },
  chipLabel: { fontSize: 13, fontWeight: '500', color: colors.text },
  chipLabelSelected: { color: colors.primary },
});
