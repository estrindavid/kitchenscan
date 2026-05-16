import { useState, useMemo } from 'react';
import { View, SectionList, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../components/ui';
import { EmptyState } from '../components/ui/EmptyState';
import { colors, spacing, radii } from '../components/ui/theme';
import { useShoppingStore } from '../stores/shoppingStore';
import type { ShoppingItem } from '../stores/shoppingStore';

interface Section {
  title: string;
  recipeId: string | undefined;
  data: ShoppingItem[];
}

export default function ShoppingListScreen() {
  const router = useRouter();
  const items = useShoppingStore((s) => s.items);
  const removeItem = useShoppingStore((s) => s.removeItem);
  const togglePurchased = useShoppingStore((s) => s.togglePurchased);

  const sections: Section[] = useMemo(() => {
    const grouped: Record<string, ShoppingItem[]> = {};
    for (const item of items) {
      const key = item.recipeId ?? '__manual__';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item);
    }
    return Object.entries(grouped).map(([key, data]) => ({
      title: key === '__manual__' ? 'Manual' : (data[0].recipeTitle ?? 'Recipe'),
      recipeId: key === '__manual__' ? undefined : key,
      data,
    }));
  }, [items]);

  const renderRightActions = (id: string) => (
    <Pressable style={styles.deleteAction} onPress={() => removeItem(id)}>
      <Ionicons name="trash-outline" size={20} color="#fff" />
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Typography variant="bodyMedium" color={colors.primary}>← Back</Typography>
        </Pressable>
        <Typography variant="h2">Shopping List</Typography>
        <Typography variant="caption" color={colors.textSecondary}>
          {items.filter((i) => !i.isPurchased).length} remaining
        </Typography>
      </View>

      {items.length === 0 ? (
        <EmptyState
          icon="✅"
          title="All clear!"
          subtitle="Add missing ingredients from a recipe to build your list."
        />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Typography variant="captionMedium" color={colors.textSecondary}>
                {section.title}
              </Typography>
            </View>
          )}
          renderItem={({ item }) => (
            <Swipeable renderRightActions={() => renderRightActions(item.id)}>
              <Pressable
                style={[styles.row, item.isPurchased && styles.rowPurchased]}
                onPress={() => togglePurchased(item.id)}
              >
                <View style={[styles.checkbox, item.isPurchased && styles.checkboxChecked]}>
                  {item.isPurchased ? (
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  ) : null}
                </View>
                <Typography
                  variant="body"
                  color={item.isPurchased ? colors.textTertiary : colors.text}
                  style={item.isPurchased && styles.strikethrough}
                >
                  {item.name}
                </Typography>
                {item.quantity ? (
                  <Typography variant="caption" color={colors.textTertiary} style={styles.qty}>
                    {item.quantity}
                  </Typography>
                ) : null}
              </Pressable>
            </Swipeable>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          SectionSeparatorComponent={() => <View style={styles.sectionSep} />}
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
  sectionHeader: { paddingVertical: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
  },
  rowPurchased: { opacity: 0.6 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  strikethrough: { textDecorationLine: 'line-through' },
  qty: { marginLeft: 'auto' },
  separator: { height: spacing.xs },
  sectionSep: { height: spacing.lg },
  deleteAction: {
    backgroundColor: colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
    width: 64,
    borderRadius: radii.md,
    marginLeft: spacing.xs,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['3xl'],
    gap: spacing.md,
  },
  emptyIcon: { fontSize: 56 },
  emptyDesc: { textAlign: 'center' },
});
