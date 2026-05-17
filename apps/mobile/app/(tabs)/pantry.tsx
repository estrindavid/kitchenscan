import { useState, useMemo, useCallback } from 'react';
import { View, SectionList, StyleSheet, RefreshControl, TextInput, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { FoodIcon } from '../../components/brand';
import { Button, Typography, Badge } from '../../components/ui';
import { brandColors, colors, spacing, radii } from '../../components/ui/theme';
import { PantryItemRow } from '../../components/pantry/PantryItem';
import { EmptyPantry } from '../../components/pantry/EmptyPantry';
import { ExpiryBanner } from '../../components/pantry/ExpiryBanner';
import { AddItemSheet } from '../../components/pantry/AddItemSheet';
import { PantryListSkeleton } from '../../components/pantry/PantryListSkeleton';
import { usePantryItems, useAddPantryItem } from '../../hooks/usePantry';
import { FOOD_CATEGORIES } from '@kitchenscan/shared';
import type { PantryItem, AddPantryItemRequest } from '@kitchenscan/shared';

type SortMode = 'category' | 'expiry' | 'name' | 'added';

const SORT_OPTIONS: { key: SortMode; label: string }[] = [
  { key: 'category', label: 'By Category' },
  { key: 'expiry', label: 'By Expiry' },
  { key: 'name', label: 'By Name' },
  { key: 'added', label: 'Recently Added' },
];

const CATEGORY_FILTERS = [
  { key: 'all', label: 'All' },
  ...Object.entries(FOOD_CATEGORIES).map(([key, val]) => ({ key, label: val.label })),
];

export default function PantryScreen() {
  const router = useRouter();
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sort, setSort] = useState<SortMode>('category');

  const { data: items = [], isLoading, refetch, isRefetching } = usePantryItems();
  const addItem = useAddPantryItem();

  const filtered = useMemo(() => {
    let result = items;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((i) =>
        (i.displayName ?? i.name).toLowerCase().includes(q),
      );
    }
    if (categoryFilter !== 'all') {
      result = result.filter((i) => i.category === categoryFilter);
    }
    return result;
  }, [items, search, categoryFilter]);

  const sections = useMemo(() => {
    if (sort === 'category') {
      const grouped: Record<string, PantryItem[]> = {};
      for (const item of filtered) {
        if (!grouped[item.category]) grouped[item.category] = [];
        grouped[item.category].push(item);
      }
      return Object.entries(grouped)
        .map(([category, data]) => {
          const catInfo = FOOD_CATEGORIES[category as keyof typeof FOOD_CATEGORIES];
          return { title: `${catInfo?.icon ?? '📦'} ${catInfo?.label ?? category}`, data, count: data.length };
        })
        .sort((a, b) => a.title.localeCompare(b.title));
    }

    const sorted = [...filtered].sort((a, b) => {
      if (sort === 'name') {
        return (a.displayName ?? a.name).localeCompare(b.displayName ?? b.name);
      }
      if (sort === 'expiry') {
        const aDate = a.expiryDate ? new Date(a.expiryDate).getTime() : Infinity;
        const bDate = b.expiryDate ? new Date(b.expiryDate).getTime() : Infinity;
        return aDate - bDate;
      }
      // 'added' - most recent first
      return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
    });

    return [{ title: 'All Items', data: sorted, count: sorted.length }];
  }, [filtered, sort]);

  const handleAddItem = useCallback(
    (item: AddPantryItemRequest) => addItem.mutate(item),
    [addItem],
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <PantryListSkeleton />
      </View>
    );
  }

  if (!isLoading && items.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyPantry
          onAddItem={() => setShowAddSheet(true)}
          onScan={() => router.push('/(tabs)/scan')}
        />
        <AddItemSheet
          visible={showAddSheet}
          onClose={() => setShowAddSheet(false)}
          onSubmit={handleAddItem}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.heroCard}>
          <View style={styles.heroCopy}>
            <Typography variant="label" color={colors.primaryDark}>Living pantry</Typography>
            <Typography variant="h2" color={brandColors.ink}>My Pantry</Typography>
            <Typography variant="caption" color={colors.textSecondary}>
              {items.length} item{items.length !== 1 ? 's' : ''} ready for recipe matching
            </Typography>
          </View>
          <FoodIcon type="can" size={48} />
          <Button
            label="Add"
            size="sm"
            onPress={() => setShowAddSheet(true)}
            icon={<Ionicons name="add" size={16} color="#FFFFFF" />}
          />
        </View>

        {/* Search */}
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={17} color={colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search items..."
            placeholderTextColor={colors.textTertiary}
            value={search}
            onChangeText={setSearch}
            clearButtonMode="while-editing"
          />
        </View>

        {/* Category filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll} contentContainerStyle={styles.chipRow}>
          {CATEGORY_FILTERS.map(({ key, label }) => {
            const selected = key === categoryFilter;
            return (
              <Pressable
                key={key}
                style={[styles.chip, selected && styles.chipSelected]}
                onPress={() => setCategoryFilter(key)}
              >
                <Typography
                  variant="captionMedium"
                  color={selected ? brandColors.ink : colors.text}
                >
                  {label}
                </Typography>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Sort pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {SORT_OPTIONS.map(({ key, label }) => {
            const selected = key === sort;
            return (
              <Pressable
                key={key}
                style={[styles.sortPill, selected && styles.sortPillSelected]}
                onPress={() => setSort(key)}
              >
                <Typography
                  variant="captionMedium"
                  color={selected ? brandColors.ink : colors.text}
                >
                  {label}
                </Typography>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Expiry banner */}
      <ExpiryBanner />

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        stickySectionHeadersEnabled={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
        }
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Typography variant="captionMedium" color={colors.text}>{section.title}</Typography>
            <Badge label={`${section.count}`} />
          </View>
        )}
        renderItem={({ item }) => <PantryItemRow item={item} onPress={() => {}} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        SectionSeparatorComponent={() => <View style={styles.sectionSeparator} />}
        ListEmptyComponent={
          <View style={styles.emptySearch}>
            <Typography variant="body" color={colors.textSecondary}>No items match your search.</Typography>
          </View>
        }
      />

      <AddItemSheet
        visible={showAddSheet}
        onClose={() => setShowAddSheet(false)}
        onSubmit={handleAddItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.sm,
  },
  heroCard: {
    minHeight: 86,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: brandColors.cream,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  heroCopy: {
    flex: 1,
    gap: 2,
  },
  searchWrap: {
    minHeight: 42,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceSecondary,
  },
  searchInput: {
    flex: 1,
    minHeight: 38,
    fontSize: 14,
    color: colors.text,
  },
  chipScroll: { marginBottom: spacing.xs },
  chipRow: { gap: spacing.xs },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
  },
  chipSelected: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  sortPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
  },
  sortPillSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  list: { padding: spacing.lg, paddingTop: spacing.md },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: 0,
    borderRadius: radii.md,
    backgroundColor: 'transparent',
  },
  separator: { height: spacing.xs },
  sectionSeparator: { height: spacing.lg },
  emptySearch: { paddingVertical: spacing.xl, alignItems: 'center' },
});
