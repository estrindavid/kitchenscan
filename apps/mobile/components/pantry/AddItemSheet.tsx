import { useState, useCallback } from 'react';
import { View, ScrollView, Pressable, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Sheet } from '../ui/Sheet';
import { Button, Input, Typography } from '../ui';
import { colors, spacing, radii } from '../ui/theme';
import { FOOD_CATEGORIES, type FoodCategory } from '@kitchenscan/shared';
import type { AddPantryItemRequest } from '@kitchenscan/shared';

interface AddItemSheetProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (item: AddPantryItemRequest) => void;
}

export function AddItemSheet({ visible, onClose, onSubmit }: AddItemSheetProps) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('piece');
  const [category, setCategory] = useState<FoodCategory>('produce');

  const handleSubmit = useCallback(() => {
    if (!name.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSubmit({
      name: name.trim(),
      displayName: name.trim(),
      category,
      quantity: parseFloat(quantity) || 1,
      unit,
      detectionSource: 'manual_entry',
    });
    // Reset form
    setName('');
    setQuantity('1');
    setUnit('piece');
    setCategory('produce');
    onClose();
  }, [name, quantity, unit, category, onSubmit, onClose]);

  return (
    <Sheet visible={visible} onClose={onClose}>
      <Typography variant="h3">Add Pantry Item</Typography>

      <Input label="Item Name" value={name} onChangeText={setName} placeholder="e.g. Chicken Breast" />

      <View style={styles.row}>
        <View style={styles.halfInput}>
          <Input label="Quantity" value={quantity} onChangeText={setQuantity} keyboardType="decimal-pad" />
        </View>
        <View style={styles.halfInput}>
          <Input label="Unit" value={unit} onChangeText={setUnit} placeholder="piece" />
        </View>
      </View>

      <View style={styles.categorySection}>
        <Typography variant="captionMedium" color={colors.textSecondary}>CATEGORY</Typography>
        <View style={styles.categoryGrid}>
          {(Object.entries(FOOD_CATEGORIES) as [FoodCategory, typeof FOOD_CATEGORIES[FoodCategory]][]).map(
            ([key, cat]) => {
              const isSelected = category === key;
              return (
                <Pressable
                  key={key}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setCategory(key);
                  }}
                  style={[styles.categoryChip, isSelected && styles.categoryChipSelected]}
                >
                  <Text style={styles.categoryEmoji}>{cat.icon}</Text>
                  <Text style={[styles.categoryLabel, isSelected && styles.categoryLabelSelected]}>
                    {cat.label}
                  </Text>
                </Pressable>
              );
            },
          )}
        </View>
      </View>

      <Button label="Add to Pantry" onPress={handleSubmit} fullWidth size="lg" disabled={!name.trim()} />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  halfInput: { flex: 1 },
  categorySection: { gap: spacing.sm, marginTop: spacing.sm },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingVertical: 6, paddingHorizontal: 10,
    borderRadius: radii.full, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  categoryChipSelected: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  categoryEmoji: { fontSize: 14 },
  categoryLabel: { fontSize: 12, fontWeight: '500', color: colors.text },
  categoryLabelSelected: { color: colors.primary },
});
