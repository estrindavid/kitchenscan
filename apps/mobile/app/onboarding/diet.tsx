import { useState } from 'react';
import { View, ScrollView, Pressable, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Button, Typography } from '../../components/ui';
import { colors, spacing, radii } from '../../components/ui/theme';
import { usePrefsStore } from '../../stores/prefsStore';
import type { DietaryRestriction } from '@kitchenscan/shared';

const DIET_OPTIONS: { id: DietaryRestriction; label: string; emoji: string }[] = [
  { id: 'vegan',        label: 'Vegan',        emoji: '🌱' },
  { id: 'vegetarian',   label: 'Vegetarian',   emoji: '🥬' },
  { id: 'pescatarian',  label: 'Pescatarian',  emoji: '🐟' },
  { id: 'gluten_free',  label: 'Gluten-free',  emoji: '🌾' },
  { id: 'dairy_free',   label: 'Dairy-free',   emoji: '🥛' },
  { id: 'nut_free',     label: 'Nut-free',     emoji: '🥜' },
  { id: 'keto',         label: 'Keto',         emoji: '🥑' },
  { id: 'paleo',        label: 'Paleo',        emoji: '🍖' },
  { id: 'halal',        label: 'Halal',        emoji: '☪️' },
  { id: 'kosher',       label: 'Kosher',       emoji: '✡️' },
  { id: 'low_fodmap',   label: 'Low FODMAP',   emoji: '🫄' },
];

export default function DietScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const setDietaryRestrictions = usePrefsStore((s) => s.setDietaryRestrictions);

  const toggle = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleNext = () => {
    setDietaryRestrictions(Array.from(selected) as DietaryRestriction[]);
    router.push('/onboarding/preferences');
  };

  return (
    <View style={styles.container}>
      <Typography variant="h1">Any dietary restrictions?</Typography>
      <Typography variant="body" color={colors.textSecondary} style={styles.subtitle}>
        Select all that apply. We'll filter recipes accordingly.
      </Typography>
      <ScrollView contentContainerStyle={styles.grid} style={styles.scroll}>
        {DIET_OPTIONS.map(({ id, label, emoji }) => {
          const isSelected = selected.has(id);
          return (
            <Pressable
              key={id}
              onPress={() => toggle(id)}
              style={[styles.chip, isSelected && styles.chipSelected]}
            >
              <Text style={styles.chipEmoji}>{emoji}</Text>
              <Text style={[styles.chipLabel, isSelected && styles.chipLabelSelected]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <View style={styles.footer}>
        <Button label="Skip" variant="ghost" onPress={handleNext} />
        <Button label="Next" onPress={handleNext} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 60, backgroundColor: colors.background },
  subtitle: { marginTop: spacing.sm, marginBottom: spacing['3xl'] },
  scroll: { flex: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 10, paddingHorizontal: 16,
    borderRadius: radii.full, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipSelected: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  chipEmoji: { fontSize: 18 },
  chipLabel: { fontSize: 14, fontWeight: '500', color: colors.text },
  chipLabelSelected: { color: colors.primary },
  footer: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 20, borderTopWidth: 1, borderTopColor: colors.border,
  },
});
