import { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  Modal,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useScanStore } from '../stores/scanStore';
import { useAddPantryItemsBatch } from '../hooks/usePantry';
import { Button, Typography, Badge } from '../components/ui';
import { colors, spacing, radii } from '../components/ui/theme';
import { MEASUREMENT_UNITS } from '@kitchenscan/shared';
import type { AddPantryItemRequest } from '@kitchenscan/shared';
import type { MeasurementUnit } from '@kitchenscan/shared';

// ─── Category helper ─────────────────────────────────────

function labelToCategory(label: string): AddPantryItemRequest['category'] {
  const l = label.toLowerCase();
  if (/chicken|beef|pork|fish|salmon|tuna|shrimp|egg/.test(l)) return 'protein';
  if (/apple|banana|broccoli|carrot|tomato|onion|garlic|pepper|spinach|lettuce/.test(l)) return 'produce';
  if (/milk|cheese|yogurt|butter|cream/.test(l)) return 'dairy';
  if (/rice|pasta|bread|flour|oat/.test(l)) return 'grains';
  if (/can|bean|soup|sauce/.test(l)) return 'canned';
  if (/frozen/.test(l)) return 'frozen';
  if (/oil|vinegar|ketchup|mustard|soy/.test(l)) return 'condiments';
  if (/salt|pepper|cumin|paprika|oregano/.test(l)) return 'spices';
  return 'other';
}

const UNIT_KEYS = Object.keys(MEASUREMENT_UNITS) as MeasurementUnit[];

// ─── Unit Picker Modal ────────────────────────────────────

interface UnitPickerProps {
  visible: boolean;
  current: string;
  onSelect: (unit: MeasurementUnit) => void;
  onClose: () => void;
}

function UnitPickerModal({ visible, current, onSelect, onClose }: UnitPickerProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <View style={styles.unitSheet}>
          <View style={styles.unitSheetHandle} />
          <Typography variant="bodyMedium" style={styles.unitSheetTitle}>
            Choose Unit
          </Typography>
          <FlatList
            data={UNIT_KEYS}
            keyExtractor={(u) => u}
            numColumns={3}
            contentContainerStyle={styles.unitGrid}
            renderItem={({ item: unit }) => (
              <Pressable
                style={[
                  styles.unitChip,
                  current === unit && styles.unitChipSelected,
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onSelect(unit);
                  onClose();
                }}
              >
                <Typography
                  variant="captionMedium"
                  color={current === unit ? '#fff' : colors.text}
                >
                  {MEASUREMENT_UNITS[unit].label}
                </Typography>
              </Pressable>
            )}
          />
        </View>
      </Pressable>
    </Modal>
  );
}

// ─── Editable row ─────────────────────────────────────────

interface EditableItemRowProps {
  id: string;
  label: string;
  quantity: number;
  unit: string;
  confidence: number;
  onUpdateQuantity: (id: string, qty: number) => void;
  onUpdateUnit: (id: string, unit: MeasurementUnit) => void;
  onRemove: (id: string) => void;
}

function EditableItemRow({
  id,
  label,
  quantity,
  unit,
  confidence,
  onUpdateQuantity,
  onUpdateUnit,
  onRemove,
}: EditableItemRowProps) {
  const [pickerVisible, setPickerVisible] = useState(false);

  return (
    <View style={styles.row}>
      {/* Left: label + confidence */}
      <View style={styles.rowLeft}>
        <Typography variant="bodyMedium" style={styles.rowLabel}>
          {label.charAt(0).toUpperCase() + label.slice(1)}
        </Typography>
        <Typography variant="label" color={colors.textTertiary}>
          {Math.round(confidence * 100)}% confidence
        </Typography>
      </View>

      {/* Center: qty stepper */}
      <View style={styles.stepper}>
        <Pressable
          onPress={() => {
            if (quantity > 1) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onUpdateQuantity(id, quantity - 1);
            }
          }}
          style={styles.stepBtn}
          hitSlop={8}
        >
          <Typography variant="h3" color={quantity > 1 ? colors.text : colors.textTertiary}>
            −
          </Typography>
        </Pressable>
        <Typography variant="bodyMedium" style={styles.qtyText}>
          {quantity}
        </Typography>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onUpdateQuantity(id, quantity + 1);
          }}
          style={styles.stepBtn}
          hitSlop={8}
        >
          <Typography variant="h3" color={colors.text}>+</Typography>
        </Pressable>
      </View>

      {/* Unit picker button */}
      <Pressable
        style={styles.unitBtn}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setPickerVisible(true);
        }}
      >
        <Typography variant="captionMedium" color={colors.primary}>
          {MEASUREMENT_UNITS[unit as MeasurementUnit]?.label ?? unit}
        </Typography>
      </Pressable>

      {/* Remove */}
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onRemove(id);
        }}
        style={styles.removeBtn}
        hitSlop={8}
      >
        <Typography variant="bodyMedium" color={colors.danger}>✕</Typography>
      </Pressable>

      <UnitPickerModal
        visible={pickerVisible}
        current={unit}
        onSelect={(u) => onUpdateUnit(id, u)}
        onClose={() => setPickerVisible(false)}
      />
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────

export default function ConfirmScreen() {
  const router = useRouter();
  const { items, removeItem, updateItem, reset } = useScanStore();
  const addBatch = useAddPantryItemsBatch();

  const confirmedItems = items.filter((i) => i.confirmed);

  const handleUpdateQuantity = useCallback(
    (id: string, qty: number) => updateItem(id, { quantity: qty }),
    [updateItem],
  );

  const handleUpdateUnit = useCallback(
    (id: string, unit: MeasurementUnit) => updateItem(id, { unit }),
    [updateItem],
  );

  const handleAddToPantry = useCallback(() => {
    if (confirmedItems.length === 0) return;

    const requests: AddPantryItemRequest[] = confirmedItems.map((item) => ({
      name: item.label.toLowerCase(),
      displayName: item.label.charAt(0).toUpperCase() + item.label.slice(1),
      category: labelToCategory(item.label),
      quantity: item.quantity,
      unit: item.unit,
      detectionSource: 'camera_vision',
      confidenceScore: item.bestConfidence,
    }));

    addBatch.mutate(requests, {
      onSuccess: () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        reset();
        router.replace('/(tabs)/pantry');
      },
    });
  }, [confirmedItems, addBatch, reset, router]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Typography variant="bodyMedium" color={colors.primary}>← Back</Typography>
        </Pressable>
        <Typography variant="h3">Review Items</Typography>
        <Badge label={`${confirmedItems.length}`} variant="primary" />
      </View>

      {confirmedItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Typography variant="h3" color={colors.textSecondary}>
            No confirmed items
          </Typography>
          <Typography variant="body" color={colors.textTertiary} style={styles.emptyHint}>
            Go back and scan more items, or wait for detections to reach 3 frames.
          </Typography>
          <Button label="Back to Scanner" onPress={() => router.back()} variant="secondary" />
        </View>
      ) : (
        <>
          <ScrollView
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          >
            <Typography variant="caption" color={colors.textTertiary} style={styles.listHint}>
              Tap a unit to change it · Use − + to adjust quantity · ✕ to remove
            </Typography>
            {confirmedItems.map((item) => (
              <EditableItemRow
                key={item.id}
                id={item.id}
                label={item.label}
                quantity={item.quantity}
                unit={item.unit}
                confidence={item.bestConfidence}
                onUpdateQuantity={handleUpdateQuantity}
                onUpdateUnit={handleUpdateUnit}
                onRemove={removeItem}
              />
            ))}
          </ScrollView>

          {/* Footer CTA */}
          <View style={styles.footer}>
            <Button
              label={
                addBatch.isPending
                  ? 'Adding…'
                  : `Add ${confirmedItems.length} item${confirmedItems.length === 1 ? '' : 's'} to Pantry`
              }
              onPress={handleAddToPantry}
              loading={addBatch.isPending}
              fullWidth
              size="lg"
            />
            {addBatch.isError && (
              <Typography variant="caption" color={colors.danger} style={styles.errorText}>
                Failed to add items. Please try again.
              </Typography>
            )}
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  backBtn: {
    minWidth: 70,
  },
  list: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  listHint: {
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  rowLeft: {
    flex: 1,
    gap: 2,
  },
  rowLabel: {
    textTransform: 'capitalize',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  stepBtn: {
    padding: 2,
  },
  qtyText: {
    minWidth: 20,
    textAlign: 'center',
  },
  unitBtn: {
    backgroundColor: colors.primaryLight,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    minWidth: 44,
    alignItems: 'center',
  },
  removeBtn: {
    padding: 4,
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  errorText: {
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['3xl'],
    gap: spacing.lg,
  },
  emptyHint: {
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  // Unit picker modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  unitSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.lg,
    paddingBottom: spacing['4xl'],
  },
  unitSheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  unitSheetTitle: {
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  unitGrid: {
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  unitChip: {
    flex: 1,
    margin: 4,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  unitChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
});
