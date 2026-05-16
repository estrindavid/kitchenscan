import { View, Image, ScrollView, StyleSheet } from 'react-native';
import { Typography } from '../ui';
import { colors, spacing, radii } from '../ui/theme';
import type { BarcodeProduct, BarcodeNutriments } from '@kitchenscan/shared';

const NUTRISCORE_COLORS: Record<string, string> = {
  a: '#038141',
  b: '#85bb2f',
  c: '#fecb02',
  d: '#ee8100',
  e: '#e63312',
};

interface ProductCardProps {
  product: BarcodeProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const scoreKey = product.nutritionGrades?.toLowerCase() ?? '';
  const scoreColor = NUTRISCORE_COLORS[scoreKey] ?? colors.textTertiary;

  return (
    <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled>
      {/* Product header */}
      <View style={styles.header}>
        {product.imageUrl ? (
          <Image
            source={{ uri: product.imageUrl }}
            style={styles.image}
            resizeMode="contain"
          />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]} />
        )}
        <View style={styles.headerText}>
          <Typography variant="h3" style={styles.productName}>
            {product.productName ?? 'Unknown Product'}
          </Typography>
          {product.brands ? (
            <Typography variant="body" color={colors.textSecondary}>
              {product.brands}
            </Typography>
          ) : null}
        </View>
      </View>

      {/* Badges */}
      <View style={styles.badges}>
        {product.nutritionGrades ? (
          <View style={[styles.badge, { backgroundColor: scoreColor }]}>
            <Typography variant="label" color="#fff">
              Nutri-Score {product.nutritionGrades.toUpperCase()}
            </Typography>
          </View>
        ) : null}
        {product.novaGroup != null ? (
          <View style={[styles.badge, styles.novaBadge]}>
            <Typography variant="label" color={colors.textSecondary}>
              NOVA {product.novaGroup}
            </Typography>
          </View>
        ) : null}
      </View>

      {/* Nutrition table */}
      {product.nutriments ? (
        <View style={styles.section}>
          <Typography variant="bodyMedium" style={styles.sectionTitle}>
            Nutrition per 100 g
          </Typography>
          <NutritionTable nutriments={product.nutriments} />
        </View>
      ) : null}

      {/* Allergens */}
      {product.allergensTags && product.allergensTags.length > 0 ? (
        <View style={styles.section}>
          <Typography variant="bodyMedium" style={styles.sectionTitle}>
            Allergens
          </Typography>
          <View style={styles.chipRow}>
            {product.allergensTags
              .filter((t) => t.startsWith('en:'))
              .map((tag) => (
                <View key={tag} style={styles.allergenChip}>
                  <Typography variant="caption" color={colors.danger}>
                    {tag.replace('en:', '').replace(/-/g, ' ')}
                  </Typography>
                </View>
              ))}
          </View>
        </View>
      ) : null}

      {/* Ingredients */}
      {product.ingredientsText ? (
        <View style={styles.section}>
          <Typography variant="bodyMedium" style={styles.sectionTitle}>
            Ingredients
          </Typography>
          <Typography variant="caption" color={colors.textSecondary}>
            {product.ingredientsText}
          </Typography>
        </View>
      ) : null}
    </ScrollView>
  );
}

function NutritionRow({
  label,
  value,
  unit,
}: {
  label: string;
  value?: number;
  unit: string;
}) {
  if (value == null) return null;
  return (
    <View style={styles.nutritionRow}>
      <Typography variant="body" color={colors.textSecondary}>
        {label}
      </Typography>
      <Typography variant="bodyMedium">
        {value.toFixed(1)}
        {unit}
      </Typography>
    </View>
  );
}

function NutritionTable({ nutriments }: { nutriments: BarcodeNutriments }) {
  return (
    <View style={styles.nutritionTable}>
      <NutritionRow label="Calories" value={nutriments.energyKcal100g} unit=" kcal" />
      <NutritionRow label="Protein" value={nutriments.proteins100g} unit=" g" />
      <NutritionRow label="Fat" value={nutriments.fat100g} unit=" g" />
      <NutritionRow label="Carbohydrates" value={nutriments.carbohydrates100g} unit=" g" />
      <NutritionRow label="Fiber" value={nutriments.fiber100g} unit=" g" />
      <NutritionRow label="Sodium" value={nutriments.sodium100g} unit=" g" />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'flex-start',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: radii.md,
  },
  imagePlaceholder: {
    backgroundColor: colors.surfaceSecondary,
  },
  headerText: {
    flex: 1,
    gap: spacing.xs,
  },
  productName: {
    flexShrink: 1,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
  },
  novaBadge: {
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
  },
  nutritionTable: {
    borderRadius: radii.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  allergenChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.dangerLight,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
  },
});
