import { Pressable, View, Text, StyleSheet } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { Typography, Badge } from '../ui';
import { colors, spacing, radii } from '../ui/theme';
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

  const renderLeftActions = () => (
    <Pressable
      style={styles.usedUpAction}
      onPress={() => updateMutation.mutate({ id: item.id, status: 'used_up' })}
    >
      <Ionicons name="checkmark" size={20} color="#fff" />
      <Text style={styles.actionText}>Used Up</Text>
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
            <Typography variant="bodyMedium">{item.displayName ?? item.name}</Typography>
            <Typography variant="caption" color={colors.textSecondary}>
              {item.quantity} {item.unit}
              {item.brand ? ` · ${item.brand}` : ''}
            </Typography>
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
    gap: spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceSecondary,
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
});
