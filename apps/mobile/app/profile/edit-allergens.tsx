import { useState } from 'react';
import { View, ScrollView, Pressable, TextInput, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Button, Typography, Badge } from '../../components/ui';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radii } from '../../components/ui/theme';
import { usePrefsStore } from '../../stores/prefsStore';

export default function EditAllergensScreen() {
  const router = useRouter();
  const currentAllergens = usePrefsStore((s) => s.allergens);
  const setAllergens = usePrefsStore((s) => s.setAllergens);

  const [allergens, setLocalAllergens] = useState<string[]>([...currentAllergens]);
  const [input, setInput] = useState('');

  const addAllergen = () => {
    const trimmed = input.trim();
    if (!trimmed || allergens.some((a) => a.toLowerCase() === trimmed.toLowerCase())) {
      setInput('');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLocalAllergens([...allergens, trimmed]);
    setInput('');
  };

  const removeAllergen = (name: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLocalAllergens(allergens.filter((a) => a !== name));
  };

  const handleSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setAllergens(allergens);
    router.back();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
        <Typography variant="bodyMedium" color={colors.primary}>← Back</Typography>
      </Pressable>

      <Typography variant="h2">Edit Allergens</Typography>
      <Typography variant="body" color={colors.textSecondary}>
        We'll warn you when recipes contain these ingredients.
      </Typography>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="e.g. peanuts, shellfish..."
          placeholderTextColor={colors.textTertiary}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={addAllergen}
          returnKeyType="done"
        />
        <Pressable style={styles.addBtn} onPress={addAllergen}>
          <Ionicons name="add" size={22} color="#fff" />
        </Pressable>
      </View>

      {allergens.length > 0 ? (
        <View style={styles.tagList}>
          {allergens.map((allergen) => (
            <Pressable
              key={allergen}
              style={styles.tag}
              onPress={() => removeAllergen(allergen)}
            >
              <Typography variant="captionMedium" color={colors.primary}>{allergen}</Typography>
              <Ionicons name="close" size={14} color={colors.primary} />
            </Pressable>
          ))}
        </View>
      ) : (
        <Typography variant="body" color={colors.textTertiary} style={styles.empty}>
          No allergens added yet.
        </Typography>
      )}

      <Button label="Save" onPress={handleSave} fullWidth size="lg" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.xl },
  backBtn: { paddingVertical: spacing.sm },
  inputRow: { flexDirection: 'row', gap: spacing.sm },
  input: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagList: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  empty: { textAlign: 'center', paddingVertical: spacing.lg },
});
