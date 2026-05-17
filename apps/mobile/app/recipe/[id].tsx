import { useEffect } from 'react';
import { View, ScrollView, Image, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FoodIcon, MemphisBackground } from '../../components/brand';
import { Typography, Badge, Button } from '../../components/ui';
import { IngredientList } from '../../components/recipes/IngredientList';
import { RecipeDetailSkeleton } from '../../components/recipes/RecipeDetailSkeleton';
import { brandColors, colors, spacing, radii } from '../../components/ui/theme';
import { useRecipe } from '../../hooks/useRecipes';
import { usePantryItems } from '../../hooks/usePantry';
import { useRecipeSearch } from '../../hooks/useRecipes';
import { useFavoritesStore } from '../../stores/favoritesStore';
import { useShoppingStore } from '../../stores/shoppingStore';
import { recipeDetailToSearchResult } from '../../hooks/useFavorites';
import { useCookStore } from '../../stores/cookStore';
import { trackEvent } from '../../services/analytics';

const DIFFICULTY_COLOR: Record<string, 'success' | 'warning' | 'danger'> = {
  beginner: 'success',
  intermediate: 'warning',
  advanced: 'danger',
};

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: recipe, isLoading: recipeLoading, isError } = useRecipe(id ?? null);
  const { data: pantryItems = [] } = usePantryItems();

  const ingredientNames = pantryItems.map((item) => item.name);
  const { data: searchData } = useRecipeSearch(ingredientNames, { limit: 100 });
  const matchData = searchData?.recipes.find((r) => r.id === id);

  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const isFavorite = useFavoritesStore((s) => s.isFavorite);
  const favorited = id ? isFavorite(id) : false;

  const addMissingFromRecipe = useShoppingStore((s) => s.addMissingFromRecipe);

  const startSession = useCookStore((s) => s.startSession);

  useEffect(() => {
    if (recipe?.id) {
      void trackEvent('recipe_viewed', {
        recipeId: recipe.id,
        title: recipe.title,
      });
    }
  }, [recipe?.id, recipe?.title]);

  if (recipeLoading) {
    return <RecipeDetailSkeleton />;
  }

  if (isError || !recipe) {
    return (
      <View style={styles.loading}>
        <Typography variant="body" color={colors.danger}>
          Failed to load recipe.
        </Typography>
        <Button label="Go Back" onPress={() => router.back()} variant="secondary" />
      </View>
    );
  }

  function handleToggleFavorite() {
    if (!recipe) return;
    const asSearchResult = matchData ?? recipeDetailToSearchResult(recipe);
    toggleFavorite(asSearchResult);
  }

  function handleAddToShoppingList() {
    if (!recipe || !matchData?.missingIngredients.length) return;
    addMissingFromRecipe(recipe.id, recipe.title, matchData.missingIngredients);
  }

  function handleStartCooking() {
    if (!recipe) return;
    void trackEvent('cook_mode_started', {
      recipeId: recipe.id,
      stepCount: recipe.steps.length,
    });
    startSession(recipe.id, recipe.steps);
    router.push(`/cook/${recipe.id}`);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <MemphisBackground variant="cream" density="medium" animated={false} />
      {/* Header row: back + heart */}
      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
            <Ionicons name="chevron-back" size={22} color={brandColors.ink} />
            <Typography variant="bodyMedium" color={brandColors.ink}>Back</Typography>
          </Pressable>
          <Pressable onPress={handleToggleFavorite} hitSlop={12} style={styles.heartBtn}>
            <Ionicons
              name={favorited ? 'heart' : 'heart-outline'}
              size={28}
              color={favorited ? brandColors.coral : brandColors.ink}
            />
          </Pressable>
        </View>
      </SafeAreaView>

      {/* Hero image */}
      <View style={styles.hero}>
        {recipe.imageUrl ? (
          <Image source={{ uri: recipe.imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <FoodIcon type="tomato" size={62} />
            <FoodIcon type="pasta" size={76} />
            <FoodIcon type="broccoli" size={62} />
          </View>
        )}
      </View>

      {/* Title + meta */}
      <View style={[styles.section, styles.titleCard]}>
        <Typography variant="label" color={brandColors.sky}>Cook mode ready</Typography>
        <Typography variant="h2" color={brandColors.ink}>{recipe.title}</Typography>
        {recipe.description ? (
          <Typography variant="body" color={colors.textSecondary} style={styles.description}>
            {recipe.description}
          </Typography>
        ) : null}

        <View style={styles.metaRow}>
          {recipe.prepTimeMinutes ? <Badge label={`Prep ${recipe.prepTimeMinutes} min`} /> : null}
          {recipe.cookTimeMinutes ? <Badge label={`Cook ${recipe.cookTimeMinutes} min`} /> : null}
          {recipe.totalTimeMinutes ? (
            <Badge label={`Total ${recipe.totalTimeMinutes} min`} variant="success" />
          ) : null}
          <Badge label={`${recipe.servings} servings`} />
          <Badge label={recipe.difficulty} variant={DIFFICULTY_COLOR[recipe.difficulty]} />
          {recipe.cuisineType ? <Badge label={recipe.cuisineType} /> : null}
        </View>

        {recipe.dietaryTags.length > 0 ? (
          <View style={styles.metaRow}>
            {recipe.dietaryTags.map((tag) => (
              <Badge key={tag} label={tag} variant="success" />
            ))}
          </View>
        ) : null}

        {matchData ? (
          <View style={styles.matchCard}>
            <View style={styles.matchHeader}>
              <Typography variant="h3" color={brandColors.ink}>{matchData.matchScore}%</Typography>
              <Typography variant="captionMedium" color={colors.textSecondary}>pantry match</Typography>
            </View>
            <View style={styles.matchBarBg}>
              <View
                style={[
                  styles.matchBarFill,
                  {
                    width: `${matchData.matchScore}%` as `${number}%`,
                    backgroundColor:
                      matchData.matchScore >= 80
                        ? brandColors.green
                        : matchData.matchScore >= 50
                          ? brandColors.lemon
                          : brandColors.coral,
                  },
                ]}
              />
            </View>
            <Typography variant="captionMedium" color={colors.textSecondary}>
              {matchData.matchScore}% match · {matchData.matchedIngredients.length}/
              {matchData.totalIngredients} ingredients
              {matchData.substituteCount > 0
                ? ` · ${matchData.substituteCount} substitute${matchData.substituteCount > 1 ? 's' : ''} available`
                : ''}
            </Typography>
          </View>
        ) : null}
      </View>

      {/* Ingredients */}
      {recipe.ingredients && recipe.ingredients.length > 0 ? (
        <View style={[styles.section, styles.cardSection]}>
          <Typography variant="h3" color={brandColors.ink} style={styles.sectionTitle}>Ingredients</Typography>
          <IngredientList
            ingredients={recipe.ingredients}
            matchedNames={matchData?.matchedIngredients ?? []}
            missingIngredients={matchData?.missingIngredients ?? []}
          />
          {matchData?.missingIngredients && matchData.missingIngredients.length > 0 ? (
            <Button
              label={`Add ${matchData.missingIngredients.length} Missing to Shopping List`}
              variant="secondary"
              size="sm"
              onPress={handleAddToShoppingList}
            />
          ) : null}
        </View>
      ) : null}

      {/* Steps */}
      {recipe.steps.length > 0 ? (
        <View style={[styles.section, styles.cardSection]}>
          <Typography variant="h3" color={brandColors.ink} style={styles.sectionTitle}>Instructions</Typography>
          <View style={styles.stepList}>
            {recipe.steps.map((step, idx) => (
              <View key={step.order ?? idx} style={styles.step}>
                <View style={styles.stepNumber}>
                  <Typography variant="captionMedium" color={brandColors.ink}>
                    {idx + 1}
                  </Typography>
                </View>
                <View style={styles.stepBody}>
                  <Typography variant="body">{step.instruction}</Typography>
                  {step.durationMinutes ? (
                    <Typography variant="caption" color={colors.textTertiary}>
                      {step.timerLabel ?? `${step.durationMinutes} min`}
                    </Typography>
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {/* Nutrition */}
      {recipe.nutritionPerServing ? (
        <View style={[styles.section, styles.cardSection]}>
          <Typography variant="h3" color={brandColors.ink} style={styles.sectionTitle}>Nutrition per serving</Typography>
          <View style={styles.nutritionGrid}>
            {[
              { label: 'Calories', value: recipe.nutritionPerServing.calories, unit: ' kcal' },
              { label: 'Protein', value: recipe.nutritionPerServing.protein, unit: 'g' },
              { label: 'Carbs', value: recipe.nutritionPerServing.carbs, unit: 'g' },
              { label: 'Fat', value: recipe.nutritionPerServing.fat, unit: 'g' },
              { label: 'Fiber', value: recipe.nutritionPerServing.fiber, unit: 'g' },
              { label: 'Sodium', value: recipe.nutritionPerServing.sodium, unit: 'g' },
            ].map(({ label, value, unit }) =>
              value != null ? (
                <View key={label} style={styles.nutritionCell}>
                  <Typography variant="bodyMedium">{value.toFixed(0)}{unit}</Typography>
                  <Typography variant="caption" color={colors.textSecondary}>{label}</Typography>
                </View>
              ) : null,
            )}
          </View>
        </View>
      ) : null}

      {/* CTA */}
      <View style={[styles.section, styles.ctaSection]}>
        <Button
          label="Start Cooking"
          onPress={handleStartCooking}
          fullWidth
          size="lg"
          disabled={recipe.steps.length === 0}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: brandColors.cream },
  content: { paddingBottom: spacing['4xl'] },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    backgroundColor: colors.background,
  },
  headerSafeArea: {
    backgroundColor: brandColors.white,
    borderBottomWidth: 3,
    borderBottomColor: brandColors.ink,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.md,
  },
  backBtn: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingRight: spacing.md,
  },
  heartBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: brandColors.ink,
    backgroundColor: brandColors.peachLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: { padding: spacing.lg, paddingBottom: 0 },
  image: {
    width: '100%',
    height: 220,
    borderRadius: radii.md,
    borderWidth: 3,
    borderColor: brandColors.ink,
  },
  imagePlaceholder: {
    backgroundColor: brandColors.skyLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  section: { marginHorizontal: spacing.lg, marginTop: spacing.lg, gap: spacing.sm },
  titleCard: {
    backgroundColor: brandColors.white,
    borderRadius: radii.md,
    borderWidth: 3,
    borderColor: brandColors.ink,
    padding: spacing.lg,
  },
  cardSection: {
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: radii.md,
    borderWidth: 2,
    borderColor: brandColors.ink,
    padding: spacing.lg,
  },
  ctaSection: { paddingTop: spacing.xs },
  sectionTitle: { marginBottom: spacing.xs },
  description: { lineHeight: 22 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  matchCard: {
    backgroundColor: brandColors.cream,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.xs,
    borderWidth: 2,
    borderColor: brandColors.ink,
  },
  matchHeader: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  matchBarBg: { height: 8, backgroundColor: colors.borderLight, borderRadius: 999, overflow: 'hidden' },
  matchBarFill: { height: '100%', borderRadius: 999 },
  stepList: { gap: spacing.md },
  step: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  stepNumber: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: brandColors.lemon,
    borderWidth: 2,
    borderColor: brandColors.ink,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, marginTop: 1,
  },
  stepBody: { flex: 1, gap: 2 },
  nutritionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  nutritionCell: {
    width: '30%',
    backgroundColor: brandColors.white,
    borderRadius: radii.md,
    padding: spacing.sm,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: brandColors.ink,
  },
});
