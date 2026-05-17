import { useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BrandHeader, FoodIcon } from '../../components/brand';
import { Button, Typography } from '../../components/ui';
import { RecipeCard } from '../../components/recipes/RecipeCard';
import { RecipeCardSkeleton } from '../../components/recipes/RecipeCardSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { brandColors, colors, spacing, radii } from '../../components/ui/theme';
import { usePantryItems } from '../../hooks/usePantry';
import { useRecipeSearch } from '../../hooks/useRecipes';

export default function RecipesScreen() {
  const [hasRequestedRecipes, setHasRequestedRecipes] = useState(false);

  const { data: pantryItems = [], isLoading: isPantryLoading } = usePantryItems();
  const activePantryItems = pantryItems.filter((item) => item.status !== 'used_up');
  const ingredientNames = activePantryItems.map((item) => item.name);

  const {
    data,
    isFetching: isRecipesLoading,
    isError,
    error,
    refetch,
  } = useRecipeSearch(
    ingredientNames,
    {},
    { enabled: hasRequestedRecipes },
  );

  const recipes = data?.recipes ?? [];
  const isLoading = isPantryLoading || isRecipesLoading;
  const errorMessage = getRecipeErrorMessage(error);

  const handleFindRecipes = () => {
    if (ingredientNames.length === 0) return;
    if (!hasRequestedRecipes) {
      setHasRequestedRecipes(true);
      return;
    }
    void refetch();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BrandHeader
          eyebrow="AI recipes"
          title="Recipes"
          subtitle={
            activePantryItems.length > 0
              ? `From ${activePantryItems.length} pantry item${activePantryItems.length === 1 ? '' : 's'} you already have`
              : 'Scan or add ingredients to start matching meals'
          }
          accent="lemon"
          accessory={<FoodIcon type="pasta" size={50} />}
        />
      </View>

      {/* Content */}
      {isLoading && (hasRequestedRecipes || isPantryLoading) ? (
        <View style={[styles.resultsList, styles.list]}>
          {Array.from({ length: 3 }).map((_, i) => <RecipeCardSkeleton key={i} />)}
        </View>
      ) : isError ? (
        <View style={styles.centered}>
          <Typography variant="body" color={colors.danger}>
            {errorMessage}
          </Typography>
        </View>
      ) : activePantryItems.length === 0 ? (
        <View style={styles.emptyPanel}>
          <EmptyState
            icon="🍽️"
            title={pantryItems.length > 0 ? 'No active pantry items' : 'Your pantry is empty'}
            subtitle={pantryItems.length > 0
              ? 'Restore or scan fresh items to find recipes.'
              : 'Scan food items or add them manually to see matching recipes.'}
            titleColor={brandColors.ink}
            subtitleColor={colors.text}
          />
        </View>
      ) : !hasRequestedRecipes ? (
        <View style={styles.emptyPanel}>
          <EmptyState
            icon="✨"
            title="Ready when you are"
            subtitle="Tap Find me recipes to turn your pantry into meal ideas."
            titleColor={brandColors.ink}
            subtitleColor={colors.text}
          />
        </View>
      ) : recipes.length === 0 ? (
        <View style={styles.emptyPanel}>
          <EmptyState
            icon="🔍"
            title="No matching recipes"
            subtitle="Try scanning more ingredients or adding items to your pantry."
            titleColor={brandColors.ink}
            subtitleColor={colors.text}
          />
        </View>
      ) : (
        <FlatList
          data={recipes}
          style={styles.resultsList}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <RecipeCard recipe={item} />}
          ListHeaderComponent={
            <Typography variant="caption" color={colors.textTertiary} style={styles.resultCount}>
              {recipes.length} recipe{recipes.length !== 1 ? 's' : ''} from your pantry
            </Typography>
          }
        />
      )}

      <View style={styles.bottomBar}>
        <Button
          label={isRecipesLoading ? 'Finding recipes...' : 'Find me recipes'}
          onPress={handleFindRecipes}
          fullWidth
          size="lg"
          loading={isRecipesLoading}
          disabled={isPantryLoading || ingredientNames.length === 0 || isRecipesLoading}
          icon={<Ionicons name="sparkles" size={18} color="#FFFFFF" />}
        />
      </View>
    </View>
  );
}

function getRecipeErrorMessage(error: unknown) {
  const fallback = 'Could not generate recipes. Check RocketRide/Gemini setup, then try again.';
  if (!error || typeof error !== 'object') return fallback;
  const maybeAxios = error as { code?: string; response?: { data?: { message?: string } }; message?: string };
  if (maybeAxios.code === 'ECONNABORTED') {
    return 'Recipe generation took too long. Check that the API terminal is still running, then try again.';
  }
  return maybeAxios.response?.data?.message ?? maybeAxios.message ?? fallback;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF8FF',
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: 'rgba(234,248,255,0.96)',
    borderBottomWidth: 2,
    borderBottomColor: brandColors.ink,
  },
  resultsList: {
    flex: 1,
  },
  list: {
    padding: spacing.lg,
    paddingBottom: 112,
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
  emptyPanel: {
    flex: 1,
    margin: spacing.lg,
    marginBottom: 112,
    borderRadius: radii.lg,
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderWidth: 2,
    borderColor: 'rgba(16,22,47,0.12)',
    overflow: 'hidden',
  },
  bottomBar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing['2xl'],
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderTopWidth: 2,
    borderTopColor: brandColors.ink,
  },
});
