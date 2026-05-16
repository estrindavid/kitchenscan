import { useState } from 'react';
import {
  View,
  FlatList,
  Pressable,
  TextInput,
  StyleSheet,
} from 'react-native';
import { Typography } from '../../components/ui';
import { RecipeCard } from '../../components/recipes/RecipeCard';
import { RecipeCardSkeleton } from '../../components/recipes/RecipeCardSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { colors, spacing, radii } from '../../components/ui/theme';
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
      {/* Header */}
      <View style={styles.header}>
        <Typography variant="h2">Recipes</Typography>
        <Typography variant="body" color={colors.textSecondary}>
          {pantryItems.length > 0
            ? `Matched to ${pantryItems.length} pantry items`
            : 'Add items to your pantry to get matches'}
        </Typography>
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        {/* Cuisine text filter */}
        <TextInput
          style={styles.cuisineInput}
          placeholder="Cuisine (e.g. Italian)"
          placeholderTextColor={colors.textTertiary}
          value={cuisineFilter}
          onChangeText={setCuisineFilter}
        />

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
                  color={selected ? '#fff' : colors.textSecondary}
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
                  color={selected ? '#fff' : colors.textSecondary}
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
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    gap: 2,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filters: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  cuisineInput: {
    height: 36,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.surfaceSecondary,
  },
  pillRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  pill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
  },
  pillSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
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
