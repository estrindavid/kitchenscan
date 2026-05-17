import { useState } from 'react';
import { View, ScrollView, Pressable, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { BrandPanel, FoodIcon, MemphisBackground } from '../../components/brand';
import { Button, Typography, Input } from '../../components/ui';
import { brandColors, colors, spacing, radii } from '../../components/ui/theme';
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
    <View style={styles.root}>
      <MemphisBackground variant="sky" density="medium" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <BrandPanel tone="sky" style={styles.hero}>
            <View style={styles.heroCopy}>
              <Text style={styles.stepLabel}>Step 2 of 2</Text>
              <Typography variant="h1" color={brandColors.ink}>Make it yours.</Typography>
              <Typography variant="body" color={brandColors.ink} style={styles.heroBody}>
                Tune the recipe brain around how you actually cook.
              </Typography>
            </View>
            <FoodIcon type="pasta" size={72} />
          </BrandPanel>

          <View style={styles.section}>
            <Typography variant="h3" color={brandColors.ink}>Cooking Skill Level</Typography>
            {SKILL_LEVELS.map((level) => {
              const isSelected = skill === level.key;
              return (
                <Pressable
                  key={level.key}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
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
                  {isSelected ? <Ionicons name="checkmark-circle" size={22} color={brandColors.ink} /> : null}
                </Pressable>
              );
            })}
          </View>

          <View style={styles.section}>
            <Typography variant="h3" color={brandColors.ink}>Favorite Cuisines</Typography>
            <Typography variant="caption" color={colors.textSecondary}>
              We'll prioritize these in recipe suggestions.
            </Typography>
            <View style={styles.chipGrid}>
              {CUISINE_OPTIONS.map(({ id, label, emoji }) => {
                const isSelected = cuisines.has(id);
                return (
                  <Pressable
                    key={id}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
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

          <View style={styles.inputPanel}>
            <Input
              label="Household Size"
              value={household}
              onChangeText={setHousehold}
              keyboardType="number-pad"
              placeholder="1"
            />
          </View>

          <Button
            label="Start Cooking"
            onPress={handleFinish}
            fullWidth
            size="lg"
            icon={<Ionicons name="restaurant" size={18} color="#FFFFFF" />}
          />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: brandColors.sky },
  safeArea: { flex: 1 },
  container: { flex: 1 },
  content: { padding: spacing.xl, gap: spacing.xl },
  hero: {
    minHeight: 178,
    padding: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroCopy: { flex: 1 },
  stepLabel: {
    color: brandColors.ink,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  heroBody: { marginTop: spacing.sm },
  section: { gap: spacing.sm },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.md,
    borderWidth: 3,
    borderColor: brandColors.ink,
    backgroundColor: brandColors.white,
  },
  optionSelected: {
    backgroundColor: brandColors.peachLight,
  },
  optionEmoji: { fontSize: 24 },
  optionText: { flex: 1 },
  optionTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
  optionTitleSelected: { color: brandColors.ink },
  optionDesc: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: spacing.xs },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 8, paddingHorizontal: 14,
    borderRadius: radii.md, borderWidth: 2, borderColor: brandColors.ink,
    backgroundColor: brandColors.white,
  },
  chipSelected: { backgroundColor: brandColors.lemon },
  chipEmoji: { fontSize: 16 },
  chipLabel: { fontSize: 13, fontWeight: '700', color: colors.text },
  chipLabelSelected: { color: brandColors.ink },
  inputPanel: {
    backgroundColor: brandColors.white,
    borderRadius: radii.md,
    borderWidth: 3,
    borderColor: brandColors.ink,
    padding: spacing.lg,
  },
});
