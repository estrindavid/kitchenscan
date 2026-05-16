import { View, FlatList, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Typography, Badge, Button } from '../../components/ui';
import { EmptyState } from '../../components/ui/EmptyState';
import { colors, spacing, radii } from '../../components/ui/theme';
import { useExpiringItems, useUpdatePantryItem } from '../../hooks/usePantry';
import { FOOD_CATEGORIES } from '@kitchenscan/shared';
import type { PantryItem } from '@kitchenscan/shared';

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

function ExpiringItemRow({ item }: { item: PantryItem }) {
  const updateMutation = useUpdatePantryItem();
  const categoryInfo = FOOD_CATEGORIES[item.category as keyof typeof FOOD_CATEGORIES];

  return (
    <View style={styles.row}>
      <View style={styles.iconBox}>
        <Typography variant="h3">{categoryInfo?.icon ?? '📦'}</Typography>
      </View>
      <View style={styles.info}>
        <Typography variant="bodyMedium">{item.displayName ?? item.name}</Typography>
        <Typography variant="caption" color={colors.textSecondary}>
          {item.quantity} {item.unit}
          {item.expiryDate ? ` · Expires ${new Date(item.expiryDate).toLocaleDateString()}` : ''}
        </Typography>
        <Badge label={STATUS_LABEL[item.status]} variant={STATUS_VARIANT[item.status]} />
      </View>
      <View style={styles.actions}>
        <Button
          label="Use Up"
          size="sm"
          variant="secondary"
          onPress={() => updateMutation.mutate({ id: item.id, status: 'used_up' })}
        />
        <Button
          label="Still Good"
          size="sm"
          onPress={() => updateMutation.mutate({ id: item.id, status: 'fresh' })}
        />
      </View>
    </View>
  );
}

export default function ExpiringScreen() {
  const router = useRouter();
  const { data: items = [], isLoading } = useExpiringItems(7);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Typography variant="bodyMedium" color={colors.primary}>← Back</Typography>
        </Pressable>
        <Typography variant="h2">Expiring Items</Typography>
        <Typography variant="caption" color={colors.textSecondary}>
          Items expiring within 7 days
        </Typography>
      </View>

      {!isLoading && items.length === 0 ? (
        <EmptyState
          icon="✅"
          title="Nothing expiring"
          subtitle="All your pantry items are fresh."
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <ExpiringItemRow item={item} />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  list: { padding: spacing.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1, gap: spacing.xs },
  actions: { gap: spacing.xs },
  separator: { height: spacing.sm },
});
