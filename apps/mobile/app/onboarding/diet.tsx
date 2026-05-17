import { useState } from 'react';
import { View, ScrollView, Pressable, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { BrandPanel, FoodIcon, MemphisBackground } from '../../components/brand';
import { Button, Typography } from '../../components/ui';
import { brandColors, colors, spacing, radii } from '../../components/ui/theme';
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
    <View style={styles.root}>
      <MemphisBackground variant="cream" density="medium" />
      <SafeAreaView style={styles.container}>
        <BrandPanel tone="peach" style={styles.hero}>
          <View style={styles.heroCopy}>
            <Text style={styles.stepLabel}>Step 1 of 2</Text>
            <Typography variant="h1" color={brandColors.ink}>Any food rules?</Typography>
            <Typography variant="body" color={brandColors.ink} style={styles.subtitle}>
              Pick what matters so recipes stay useful when the clock is loud.
            </Typography>
          </View>
          <View style={styles.heroIcons}>
            <FoodIcon type="broccoli" size={58} />
            <FoodIcon type="milk" size={52} />
          </View>
        </BrandPanel>

        <ScrollView contentContainerStyle={styles.grid} style={styles.scroll} showsVerticalScrollIndicator={false}>
          {DIET_OPTIONS.map(({ id, label, emoji }) => {
            const isSelected = selected.has(id);
            return (
              <Pressable
                key={id}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                onPress={() => toggle(id)}
                style={[styles.chip, isSelected && styles.chipSelected]}
              >
                <Text style={styles.chipEmoji}>{emoji}</Text>
                <Text style={[styles.chipLabel, isSelected && styles.chipLabelSelected]}>
                  {label}
                </Text>
                {isSelected ? <Ionicons name="checkmark-circle" size={18} color={brandColors.ink} /> : null}
              </Pressable>
            );
          })}
        </ScrollView>
        <View style={styles.footer}>
          <Button label="Skip" variant="ghost" onPress={handleNext} />
          <Button label="Next" onPress={handleNext} icon={<Ionicons name="arrow-forward" size={18} color="#FFFFFF" />} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: brandColors.cream },
  container: { flex: 1, paddingHorizontal: spacing.xl },
  hero: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
    padding: spacing.xl,
    flexDirection: 'row',
    minHeight: 172,
  },
  heroCopy: { flex: 1, justifyContent: 'center' },
  heroIcons: { justifyContent: 'center', alignItems: 'center', gap: spacing.xs },
  stepLabel: {
    color: brandColors.ink,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  subtitle: { marginTop: spacing.sm },
  scroll: { flex: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingBottom: spacing.xl },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 11, paddingHorizontal: 15,
    borderRadius: radii.md, borderWidth: 2, borderColor: brandColors.ink,
    backgroundColor: brandColors.white,
  },
  chipSelected: { backgroundColor: brandColors.mint },
  chipEmoji: { fontSize: 18 },
  chipLabel: { fontSize: 14, fontWeight: '700', color: colors.text },
  chipLabelSelected: { color: brandColors.ink },
  footer: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border,
    backgroundColor: brandColors.cream,
  },
});
