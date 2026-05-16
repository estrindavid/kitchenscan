import { useRef } from 'react';
import { View, Pressable, Image, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Typography, Badge } from '../ui';
import { colors, spacing, radii } from '../ui/theme';
import type { RecipeSearchResult } from '../../hooks/useRecipes';

interface RecipeCardProps {
  recipe: RecipeSearchResult;
}

const DIFFICULTY_COLOR: Record<string, 'success' | 'warning' | 'danger'> = {
  beginner: 'success',
  intermediate: 'warning',
  advanced: 'danger',
};

export function RecipeCard({ recipe }: RecipeCardProps) {
  const router = useRouter();
  const scale = useRef(new Animated.Value(1)).current;

  function handlePressIn() {
    Animated.spring(scale, { toValue: 0.97, damping: 15, stiffness: 300, useNativeDriver: true }).start();
  }

  function handlePressOut() {
    Animated.spring(scale, { toValue: 1, damping: 15, stiffness: 300, useNativeDriver: true }).start();
  }

  const matchVariant =
    recipe.matchScore >= 80 ? 'success' : recipe.matchScore >= 50 ? 'warning' : 'error';

  return (
    <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
      <Pressable
        onPress={() => router.push(`/recipe/${recipe.id}`)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {recipe.imageUrl ? (
          <Image source={{ uri: recipe.imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder} />
        )}

        <View style={styles.body}>
          <Typography variant="h3" style={styles.title} numberOfLines={2}>
            {recipe.title}
          </Typography>

          {recipe.description ? (
            <Typography
              variant="caption"
              color={colors.textSecondary}
              style={styles.description}
              numberOfLines={2}
            >
              {recipe.description}
            </Typography>
          ) : null}

          <View style={styles.meta}>
            {recipe.totalTimeMinutes ? <Badge label={`${recipe.totalTimeMinutes} min`} /> : null}
            <Badge label={recipe.difficulty} variant={DIFFICULTY_COLOR[recipe.difficulty]} />
            {recipe.cuisineType ? <Badge label={recipe.cuisineType} /> : null}
          </View>

          <View style={styles.matchRow}>
            <View style={styles.matchBarBg}>
              <View
                style={[
                  styles.matchBarFill,
                  {
                    width: `${recipe.matchScore}%` as `${number}%`,
                    backgroundColor:
                      matchVariant === 'success'
                        ? colors.success
                        : matchVariant === 'warning'
                          ? colors.warning
                          : colors.danger,
                  },
                ]}
              />
            </View>
            <Typography variant="captionMedium" color={colors.textSecondary} style={styles.matchLabel}>
              {recipe.matchedIngredients.length}/{recipe.totalIngredients} ingredients
              {recipe.substituteCount > 0 ? ` · ${recipe.substituteCount} sub` : ''}
            </Typography>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  image: { width: '100%', height: 160, backgroundColor: colors.surfaceSecondary },
  imagePlaceholder: { width: '100%', height: 100, backgroundColor: colors.surfaceSecondary },
  body: { padding: spacing.md, gap: spacing.sm },
  title: { flexShrink: 1 },
  description: { lineHeight: 18 },
  meta: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  matchRow: { gap: spacing.xs },
  matchBarBg: { height: 4, backgroundColor: colors.borderLight, borderRadius: 2, overflow: 'hidden' },
  matchBarFill: { height: '100%', borderRadius: 2 },
  matchLabel: { textAlign: 'right' },
});
