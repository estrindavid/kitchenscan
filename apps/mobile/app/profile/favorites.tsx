import { View, FlatList, StyleSheet } from 'react-native';
import { Typography } from '../../components/ui';
import { RecipeCard } from '../../components/recipes/RecipeCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { colors, spacing } from '../../components/ui/theme';
import { useFavoriteRecipes } from '../../hooks/useFavorites';

export default function FavoritesScreen() {
  const favorites = useFavoriteRecipes();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Typography variant="h2">Favorites</Typography>
        <Typography variant="caption" color={colors.textSecondary}>
          {favorites.length} saved recipe{favorites.length !== 1 ? 's' : ''}
        </Typography>
      </View>

      {favorites.length === 0 ? (
        <EmptyState
          icon="💚"
          title="No favorites yet"
          subtitle="Tap the heart on any recipe to save it here."
        />
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <RecipeCard recipe={item} />}
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
    gap: 2,
  },
  list: { padding: spacing.lg, gap: spacing.md },
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
