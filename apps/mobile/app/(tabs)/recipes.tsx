import { useState } from 'react';
import {
  View,
  FlatList,
  Pressable,
  TextInput,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BrandHeader, FoodIcon, MemphisBackground } from '../../components/brand';
import { Typography } from '../../components/ui';
import { RecipeCard } from '../../components/recipes/RecipeCard';
import { RecipeCardSkeleton } from '../../components/recipes/RecipeCardSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { brandColors, colors, spacing, radii } from '../../components/ui/theme';
import { usePantryItems } from '../../hooks/usePantry';
import { useRecipeSearch } from '../../hooks/useRecipes';

const DIFFICULTY_OPTIONS = ['Any', 'beginner', 'intermediate', 'advanced'];
const TIME_OPTIONS = [
  { label: 'Any time', value: undefined },
  { label: '≤ 15 min', value: 15 },
  { label: '≤ 30 min', value: 30 },
  { label: '≤ 60 min', value: 60 },
];

export default function RecipesScreen() {
  const [difficulty, setDifficulty] = useState<string | undefined>();
  const [maxCookTime, setMaxCookTime] = useState<number | undefined>();
  const [cuisineFilter, setCuisineFilter] = useState('');

  const { data: pantryItems = [], isLoading: isPantryLoading } = usePantryItems();
  const ingredientNames = pantryItems.map((item) => item.name);

  const { data, isLoading: isRecipesLoading, isError } = useRecipeSearch(ingredientNames, {
    difficulty: difficulty || undefined,
    maxCookTime,
    cuisineType: cuisineFilter.trim() || undefined,
  });

  const recipes = data?.recipes ?? [];
  const isLoading = isPantryLoading || isRecipesLoading;

  return (
    <View style={styles.container}>
      <MemphisBackground variant="sky" density="low" animated={false} />
      {/* Header */}
      <View style={styles.header}>
        <BrandHeader
          eyebrow="Cook what you own"
          title="Recipes"
          subtitle={
            pantryItems.length > 0
              ? `Matched to ${pantryItems.length} pantry item${pantryItems.length === 1 ? '' : 's'}`
              : 'Add items to your pantry to get matches'
          }
          accent="lemon"
          accessory={<FoodIcon type="pasta" size={62} />}
        />
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        {/* Cuisine text filter */}
        <View style={styles.inputWrap}>
          <Ionicons name="search" size={17} color={colors.textTertiary} />
          <TextInput
            style={styles.cuisineInput}
            placeholder="Cuisine (e.g. Italian)"
            placeholderTextColor={colors.textTertiary}
            value={cuisineFilter}
            onChangeText={setCuisineFilter}
          />
        </View>

        {/* Difficulty pills */}
        <View style={styles.pillRow}>
          {DIFFICULTY_OPTIONS.map((d) => {
            const selected = (d === 'Any' && !difficulty) || d === difficulty;
            return (
              <Pressable
                key={d}
                style={[styles.pill, selected && styles.pillSelected]}
                onPress={() => setDifficulty(d === 'Any' ? undefined : d)}
              >
                <Typography
                  variant="captionMedium"
                  color={selected ? brandColors.ink : colors.textSecondary}
                >
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </Typography>
              </Pressable>
            );
          })}
        </View>

        {/* Cook time pills */}
        <View style={styles.pillRow}>
          {TIME_OPTIONS.map(({ label, value }) => {
            const selected = value === maxCookTime;
            return (
              <Pressable
                key={label}
                style={[styles.pill, selected && styles.pillSelected]}
                onPress={() => setMaxCookTime(value)}
              >
                <Typography
                  variant="captionMedium"
                  color={selected ? brandColors.ink : colors.textSecondary}
                >
                  {label}
                </Typography>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.list}>
          {Array.from({ length: 3 }).map((_, i) => <RecipeCardSkeleton key={i} />)}
        </View>
      ) : isError ? (
        <View style={styles.centered}>
          <Typography variant="body" color={colors.danger}>
            Failed to load recipes. Check your connection.
          </Typography>
        </View>
      ) : pantryItems.length === 0 ? (
        <EmptyState
          icon="🍽️"
          title="Your pantry is empty"
          subtitle="Scan food items or add them manually to see matching recipes."
        />
      ) : recipes.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No matching recipes"
          subtitle="Try removing filters, or add more items to your pantry."
        />
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <RecipeCard recipe={item} />}
          ListHeaderComponent={
            <Typography variant="caption" color={colors.textTertiary} style={styles.resultCount}>
              {recipes.length} recipe{recipes.length !== 1 ? 's' : ''} found
            </Typography>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: brandColors.skyLight,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: 'rgba(191,234,255,0.95)',
  },
  filters: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: 'rgba(191,234,255,0.95)',
    borderBottomWidth: 3,
    borderBottomColor: brandColors.ink,
    gap: spacing.sm,
  },
  inputWrap: {
    minHeight: 42,
    borderWidth: 2,
    borderColor: brandColors.ink,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: brandColors.white,
  },
  cuisineInput: {
    flex: 1,
    minHeight: 38,
    fontSize: 14,
    color: colors.text,
  },
  pillRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  pill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radii.md,
    borderWidth: 2,
    borderColor: brandColors.ink,
    backgroundColor: brandColors.white,
  },
  pillSelected: {
    backgroundColor: brandColors.peach,
    borderColor: brandColors.ink,
  },
  list: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  resultCount: {
    marginBottom: spacing.xs,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['3xl'],
    gap: spacing.md,
  },
  emptyTitle: {
    textAlign: 'center',
  },
  emptyDesc: {
    textAlign: 'center',
    lineHeight: 22,
  },
});
