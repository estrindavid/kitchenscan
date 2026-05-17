import { Pressable, View, Text, StyleSheet } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { Typography, Badge } from '../ui';
import { brandColors, colors, spacing, radii } from '../ui/theme';
import { useDeletePantryItem, useUpdatePantryItem } from '../../hooks/usePantry';
import { FOOD_CATEGORIES } from '@kitchenscan/shared';
import type { PantryItem as PantryItemType } from '@kitchenscan/shared';

const STATUS_VARIANT = {
  fresh: 'success',
  expiring_soon: 'warning',
  expired: 'danger',
  used_up: 'default',
} as const;

const STATUS_LABEL = {
  fresh: 'Fresh',
  expiring_soon: 'Expiring Soon',
  expired: 'Expired',
  used_up: 'Used Up',
} as const;

interface PantryItemProps {
  item: PantryItemType;
  onPress?: () => void;
}

export function PantryItemRow({ item, onPress }: PantryItemProps) {
  const deleteMutation = useDeletePantryItem();
  const updateMutation = useUpdatePantryItem();
  const categoryInfo = FOOD_CATEGORIES[item.category as keyof typeof FOOD_CATEGORIES];
  const isUsedUp = item.status === 'used_up';

  const markUsedUp = () => updateMutation.mutate({
    id: item.id,
    quantity: 0,
    status: 'used_up',
    usedAt: new Date().toISOString(),
  });

  const restore = () => updateMutation.mutate({
    id: item.id,
    quantity: item.quantity > 0 ? item.quantity : 1,
    status: 'fresh',
    usedAt: undefined,
  });

  const decrement = () => {
    const quantity = Math.max(0, item.quantity - 1);
    updateMutation.mutate({
      id: item.id,
      quantity,
      ...(quantity === 0 ? { status: 'used_up' as const, usedAt: new Date().toISOString() } : {}),
    });
  };

  const increment = () => updateMutation.mutate({
    id: item.id,
    quantity: item.quantity + 1,
    ...(isUsedUp ? { status: 'fresh' as const, usedAt: undefined } : {}),
  });

  const renderLeftActions = () => (
    <Pressable
      style={[styles.usedUpAction, isUsedUp && styles.restoreAction]}
      onPress={isUsedUp ? restore : markUsedUp}
    >
      <Ionicons name={isUsedUp ? 'refresh' : 'checkmark'} size={20} color="#fff" />
      <Text style={styles.actionText}>{isUsedUp ? 'Restore' : 'Used Up'}</Text>
    </Pressable>
  );

  const renderRightActions = () => (
    <Pressable
      style={styles.deleteAction}
      onPress={() => deleteMutation.mutate(item.id)}
    >
      <Ionicons name="trash-outline" size={20} color="#fff" />
      <Text style={styles.actionText}>Delete</Text>
    </Pressable>
  );

  return (
    <View>
      <Swipeable
        renderLeftActions={renderLeftActions}
        renderRightActions={renderRightActions}
        overshootLeft={false}
        overshootRight={false}
      >
        <Pressable onPress={onPress} style={styles.container}>
          <View style={styles.iconContainer}>
            <Typography variant="h3">{categoryInfo?.icon ?? '📦'}</Typography>
          </View>
          <View style={styles.info}>
            <Typography variant="bodyMedium" color={colors.text} numberOfLines={1}>
              {item.displayName ?? item.name}
            </Typography>
            <Typography variant="caption" color={colors.textSecondary}>
              {item.quantity} {item.unit}
              {item.brand ? ` · ${item.brand}` : ''}
            </Typography>
            <View style={styles.quickActions}>
              <Pressable
                style={[styles.quantityButton, item.quantity <= 0 && styles.quantityButtonDisabled]}
                onPress={decrement}
                disabled={item.quantity <= 0}
                hitSlop={8}
              >
                <Ionicons name="remove" size={14} color={item.quantity <= 0 ? colors.textTertiary : brandColors.ink} />
              </Pressable>
              <Pressable style={styles.quantityButton} onPress={increment} hitSlop={8}>
                <Ionicons name="add" size={14} color={brandColors.ink} />
              </Pressable>
              <Pressable
                style={[styles.usedButton, isUsedUp && styles.restoreButton]}
                onPress={isUsedUp ? restore : markUsedUp}
                hitSlop={8}
              >
                <Typography variant="captionMedium" color={brandColors.ink}>
                  {isUsedUp ? 'Restore' : 'Used up'}
                </Typography>
              </Pressable>
            </View>
          </View>
          <Badge
            label={STATUS_LABEL[item.status]}
            variant={STATUS_VARIANT[item.status]}
          />
        </Pressable>
      </Swipeable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: radii.sm,
    backgroundColor: brandColors.cream,
    borderWidth: 1,
    borderColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: { flex: 1, gap: 2 },
  usedUpAction: {
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
    gap: spacing.xs,
    marginRight: spacing.xs,
  },
  restoreAction: {
    backgroundColor: colors.primary,
  },
  deleteAction: {
    backgroundColor: colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
    gap: spacing.xs,
    marginLeft: spacing.xs,
  },
  actionText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: brandColors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonDisabled: {
    backgroundColor: colors.surfaceSecondary,
    borderColor: colors.borderLight,
  },
  usedButton: {
    minHeight: 28,
    justifyContent: 'center',
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: brandColors.skyLight,
    paddingHorizontal: spacing.sm,
  },
  restoreButton: {
    backgroundColor: brandColors.white,
    borderColor: brandColors.ink,
  },
});
