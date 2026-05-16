import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Typography, Button, Badge } from '../ui';
import { colors, spacing, radii } from '../ui/theme';
import type { ScannedItem } from '../../stores/scanStore';

interface DetectionTrayProps {
  items: ScannedItem[];
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, qty: number) => void;
  onConfirmAll: () => void;
  onAddToPantry: () => void;
}

export function DetectionTray({
  items,
  onRemove,
  onUpdateQuantity,
  onConfirmAll,
  onAddToPantry,
}: DetectionTrayProps) {
  const confirmedItems = items.filter((i) => i.confirmed);
  const pendingItems = items.filter((i) => !i.confirmed);

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Typography variant="body" color="rgba(255,255,255,0.6)" style={styles.emptyText}>
          No items detected yet
        </Typography>
        <Typography variant="label" color="rgba(255,255,255,0.4)">
          Scan a barcode or type a name below
        </Typography>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header row */}
      <View style={styles.header}>
        <Typography variant="bodyMedium" color="#fff">
          Detected Items
        </Typography>
        <View style={styles.headerBadges}>
          {confirmedItems.length > 0 && (
            <Badge label={`${confirmedItems.length} ready`} variant="success" />
          )}
          {pendingItems.length > 0 && (
            <Badge label={`${pendingItems.length} scanning…`} variant="warning" />
          )}
        </View>
      </View>

      {/* Item list */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {items.map((item) => (
          <View
            key={item.id}
            style={[styles.chip, item.confirmed ? styles.chipConfirmed : styles.chipPending]}
          >
            {/* Remove button */}
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onRemove(item.id);
              }}
              style={styles.removeBtn}
              hitSlop={8}
            >
              <Typography variant="label" color="rgba(255,255,255,0.7)">✕</Typography>
            </Pressable>

            <Typography variant="captionMedium" color="#fff" style={styles.chipLabel}>
              {item.label}
            </Typography>

            {/* Quantity stepper */}
            <View style={styles.stepper}>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  if (item.quantity > 1) onUpdateQuantity(item.id, item.quantity - 1);
                }}
                style={styles.stepBtn}
                hitSlop={4}
              >
                <Typography variant="label" color="#fff">−</Typography>
              </Pressable>
              <Typography variant="captionMedium" color="#fff">
                {item.isEstimated ? `~${item.quantity}` : item.quantity}
              </Typography>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onUpdateQuantity(item.id, item.quantity + 1);
                }}
                style={styles.stepBtn}
                hitSlop={4}
              >
                <Typography variant="label" color="#fff">+</Typography>
              </Pressable>
            </View>

            {/* Confidence */}
            <Typography variant="label" color="rgba(255,255,255,0.6)">
              {Math.round(item.bestConfidence * 100)}%
            </Typography>
          </View>
        ))}
      </ScrollView>

      {/* Action row */}
      <View style={styles.actions}>
        {pendingItems.length > 0 && (
          <Button
            label="Confirm All"
            variant="secondary"
            size="sm"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onConfirmAll();
            }}
          />
        )}
        {confirmedItems.length > 0 && (
          <Button
            label={`Add ${confirmedItems.length} to Pantry`}
            size="sm"
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              onAddToPantry();
            }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 15, 13, 0.92)',
    paddingBottom: 32,
    paddingTop: spacing.md,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  headerBadges: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  list: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  chip: {
    borderRadius: radii.md,
    padding: spacing.sm,
    minWidth: 90,
    alignItems: 'center',
    gap: 4,
  },
  chipConfirmed: {
    backgroundColor: 'rgba(15, 110, 86, 0.7)',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  chipPending: {
    backgroundColor: 'rgba(255, 200, 0, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 200, 0, 0.5)',
  },
  removeBtn: {
    alignSelf: 'flex-end',
  },
  chipLabel: {
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  stepBtn: {
    padding: 2,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  emptyContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 15, 13, 0.75)',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: 32,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
    gap: spacing.xs,
  },
  emptyText: {
    textAlign: 'center',
  },
});
