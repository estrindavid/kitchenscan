import { useRef } from 'react';
import { View, Pressable, Image, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { FoodIcon } from '../brand';
import { Typography } from '../ui';
import { brandColors, colors, spacing, radii } from '../ui/theme';
import type { RecipeSearchResult } from '../../hooks/useRecipes';

interface RecipeCardProps {
  recipe: RecipeSearchResult;
}

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
  const matchColor =
    matchVariant === 'success'
      ? brandColors.green
      : matchVariant === 'warning'
        ? brandColors.lemon
        : brandColors.coral;

  return (
    <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
      <Pressable
        onPress={() => router.push(`/recipe/${recipe.id}`)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={styles.hero}>
          {recipe.imageUrl ? (
            <Image source={{ uri: recipe.imageUrl }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={styles.imagePlaceholder}>
              <FoodIcon type="tomato" size={56} />
              <FoodIcon type="pasta" size={64} />
              <FoodIcon type="broccoli" size={54} />
            </View>
          )}
          <View style={[styles.matchBadge, { backgroundColor: matchColor }]}>
            <Typography variant="captionMedium" color={brandColors.ink}>
              {recipe.matchScore}% match
            </Typography>
          </View>
        </View>

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

          <View style={styles.matchRow}>
            <View style={styles.matchStats}>
              <Ionicons name="basket" size={15} color={brandColors.ink} />
              <Typography variant="captionMedium" color={brandColors.ink} style={styles.matchLabel}>
                {recipe.matchedIngredients.length}/{recipe.totalIngredients} ingredients
                {recipe.substituteCount > 0 ? ` · ${recipe.substituteCount} sub` : ''}
              </Typography>
            </View>
            <View style={styles.matchBarBg}>
              <View
                style={[
                  styles.matchBarFill,
                  {
                    width: `${recipe.matchScore}%` as `${number}%`,
                    backgroundColor: matchColor,
                  },
                ]}
              />
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 3,
    borderColor: brandColors.ink,
    overflow: 'hidden',
    shadowColor: brandColors.ink,
    shadowOpacity: 0.10,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  hero: {
    minHeight: 132,
    backgroundColor: brandColors.skyLight,
    borderBottomWidth: 3,
    borderBottomColor: brandColors.ink,
  },
  image: { width: '100%', height: 160, backgroundColor: colors.surfaceSecondary },
  imagePlaceholder: {
    width: '100%',
    minHeight: 132,
    backgroundColor: brandColors.skyLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  matchBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    borderWidth: 2,
    borderColor: brandColors.ink,
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  body: { padding: spacing.md, gap: spacing.sm },
  title: { flexShrink: 1 },
  description: { lineHeight: 18 },
  matchRow: { gap: spacing.xs },
  matchStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.xs,
  },
  matchBarBg: { height: 7, backgroundColor: colors.borderLight, borderRadius: 999, overflow: 'hidden' },
  matchBarFill: { height: '100%', borderRadius: 999 },
  matchLabel: { textAlign: 'right' },
});
