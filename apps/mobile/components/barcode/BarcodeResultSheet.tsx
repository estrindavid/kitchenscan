import { useState, useEffect } from 'react';
import {
  View, Modal, Pressable, ActivityIndicator, StyleSheet,
  TextInput, TouchableOpacity, ScrollView, Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useBarcodeLookup } from '../../hooks/useBarcode';
import { ProductCard } from './ProductCard';
import { NotFoundSheet } from './NotFoundSheet';
import { Typography, Button } from '../ui';
import { colors, spacing, radii } from '../ui/theme';
import { categorizeFromOFF } from '../../utils/categoryMapper';
import type { AddPantryItemRequest, FoodCategory } from '@kitchenscan/shared';

const CATEGORIES: FoodCategory[] = [
  'produce', 'protein', 'dairy', 'grains', 'canned',
  'frozen', 'condiments', 'spices', 'snacks', 'beverages', 'other',
];

const UNITS = ['piece', 'lb', 'oz', 'kg', 'g', 'bunch', 'bag', 'box', 'can', 'bottle', 'jar'];

interface BarcodeResultSheetProps {
  barcode: string | null;
  onDismiss: () => void;
  onAddToPantry: (item: AddPantryItemRequest) => void;
  onAddManually: (barcode?: string) => void;
}

export function BarcodeResultSheet({
  barcode,
  onDismiss,
  onAddToPantry,
  onAddManually,
}: BarcodeResultSheetProps) {
  const { data: product, isLoading, isError } = useBarcodeLookup(barcode);

  // Editable pre-add fields
  const [editableName, setEditableName] = useState('');
  const [editableCategory, setEditableCategory] = useState<FoodCategory>('other');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('piece');

  // Initialise editable fields when product loads
  useEffect(() => {
    if (product) {
      setEditableName(product.productName ?? 'Unknown Product');
      setEditableCategory(categorizeFromOFF(product.categories));
      setQuantity(1);
      setUnit('piece');
    }
  }, [product]);

  const handleAdd = () => {
    if (!product) return;
    onAddToPantry({
      name: editableName.toLowerCase().trim(),
      displayName: editableName.trim(),
      category: editableCategory,
      quantity,
      unit,
      detectionSource: 'barcode_scan',
      barcode: product.barcode,
      brand: product.brands,
      imageUrl: product.imageUrl,
      nutritionPer100g: product.nutriments
        ? {
            calories: product.nutriments.energyKcal100g ?? 0,
            protein:  product.nutriments.proteins100g ?? 0,
            fat:      product.nutriments.fat100g ?? 0,
            carbs:    product.nutriments.carbohydrates100g ?? 0,
            fiber:    product.nutriments.fiber100g ?? 0,
            sodium:   product.nutriments.sodium100g ?? 0,
          }
        : undefined,
    });
    onDismiss();
  };

  return (
    <Modal visible={!!barcode} transparent animationType="slide" onRequestClose={onDismiss}>
      <Pressable style={styles.backdrop} onPress={onDismiss}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <Typography variant="h3">Barcode Scanned</Typography>
            <Pressable onPress={onDismiss} hitSlop={12}>
              <Typography variant="bodyMedium" color={colors.textTertiary}>Dismiss</Typography>
            </Pressable>
          </View>

          {isLoading ? (
            <View style={styles.centeredContent}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Typography variant="body" color={colors.textSecondary} style={styles.loadingText}>
                Looking up product…
              </Typography>
            </View>
          ) : isError ? (
            <View style={styles.centeredContent}>
              <Typography variant="body" color={colors.danger} style={styles.loadingText}>
                Failed to look up product. Check your connection.
              </Typography>
              <Button label="Dismiss" onPress={onDismiss} variant="secondary" />
            </View>
          ) : product ? (
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Product info card */}
              <View style={styles.cardContent}>
                <ProductCard product={product} />
              </View>

              {/* Editable fields */}
              <View style={styles.editSection}>
                <Typography variant="label" color={colors.textSecondary} style={styles.fieldLabel}>
                  Name
                </Typography>
                <TextInput
                  style={styles.textInput}
                  value={editableName}
                  onChangeText={setEditableName}
                  placeholderTextColor={colors.textTertiary}
                />

                <Typography variant="label" color={colors.textSecondary} style={styles.fieldLabel}>
                  Category
                </Typography>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
                  {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => setEditableCategory(cat)}
                      style={[styles.chip, editableCategory === cat && styles.chipSelected]}
                    >
                      <Typography
                        variant="label"
                        color={editableCategory === cat ? '#fff' : colors.textSecondary}
                      >
                        {cat}
                      </Typography>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <View style={styles.row}>
                  <View style={styles.flex1}>
                    <Typography variant="label" color={colors.textSecondary} style={styles.fieldLabel}>
                      Quantity
                    </Typography>
                    <View style={styles.stepper}>
                      <TouchableOpacity
                        onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                        style={styles.stepBtn}
                      >
                        <Typography variant="bodyMedium">−</Typography>
                      </TouchableOpacity>
                      <Typography variant="bodyMedium" style={styles.stepValue}>
                        {quantity}
                      </Typography>
                      <TouchableOpacity
                        onPress={() => setQuantity((q) => q + 1)}
                        style={styles.stepBtn}
                      >
                        <Typography variant="bodyMedium">+</Typography>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.flex1}>
                    <Typography variant="label" color={colors.textSecondary} style={styles.fieldLabel}>
                      Unit
                    </Typography>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {UNITS.map((u) => (
                        <TouchableOpacity
                          key={u}
                          onPress={() => setUnit(u)}
                          style={[styles.chip, unit === u && styles.chipSelected]}
                        >
                          <Typography
                            variant="label"
                            color={unit === u ? '#fff' : colors.textSecondary}
                          >
                            {u}
                          </Typography>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </View>
              </View>

              {/* Add button */}
              <View style={styles.footer}>
                <Button
                  label="Add to Pantry"
                  onPress={handleAdd}
                  fullWidth
                  size="lg"
                />
              </View>
            </ScrollView>
          ) : (
            <View style={styles.cardContent}>
              <NotFoundSheet
                barcode={barcode ?? ''}
                onAddManually={() => {
                  onAddManually(barcode ?? undefined);
                  onDismiss();
                }}
              />
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['4xl'],
    maxHeight: '90%',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginVertical: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  centeredContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['4xl'],
    gap: spacing.md,
  },
  loadingText: { textAlign: 'center' },
  cardContent: { flex: 1 },
  editSection: {
    paddingTop: spacing.lg,
    gap: spacing.xs,
  },
  fieldLabel: {
    marginBottom: 4,
    marginTop: spacing.sm,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.surfaceSecondary,
  },
  chipRow: { flexDirection: 'row' },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.xs,
    backgroundColor: colors.surfaceSecondary,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
  flex1: { flex: 1 },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  stepBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceSecondary,
  },
  stepValue: {
    paddingHorizontal: spacing.lg,
  },
  footer: {
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.md,
  },
});
