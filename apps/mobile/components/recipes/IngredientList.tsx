import { View, StyleSheet } from 'react-native';
import { Typography } from '../ui';
import { brandColors, colors, spacing, radii } from '../ui/theme';
import type { Ingredient } from '@kitchenscan/shared';
import type { MissingIngredient } from '../../hooks/useRecipes';

type IngredientStatus = 'matched' | 'substitute' | 'missing' | 'optional';

interface ResolvedIngredient {
  ingredient: Ingredient;
  status: IngredientStatus;
  substituteInfo?: MissingIngredient['substitute'];
}

interface IngredientListProps {
  ingredients: Ingredient[];
  matchedNames: string[];
  missingIngredients: MissingIngredient[];
}

const STATUS_CONFIG: Record<
  IngredientStatus,
  { icon: string; color: string; bgColor: string }
> = {
  matched: { icon: '✓', color: brandColors.green, bgColor: brandColors.mint },
  substitute: { icon: '~', color: colors.warning, bgColor: colors.warningLight },
  missing: { icon: '✕', color: colors.danger, bgColor: colors.dangerLight },
  optional: { icon: '○', color: colors.textTertiary, bgColor: colors.surfaceSecondary },
};

export function IngredientList({
  ingredients,
  matchedNames,
  missingIngredients,
}: IngredientListProps) {
  const matchedSet = new Set(matchedNames.map((n) => n.toLowerCase()));
  const missingMap = new Map(
    missingIngredients.map((m) => [m.name.toLowerCase(), m]),
  );

  const resolved: ResolvedIngredient[] = ingredients.map((ing) => {
    const displayLower = ing.displayText.toLowerCase();
    if (matchedSet.has(displayLower)) {
      return { ingredient: ing, status: 'matched' };
    }
    const missing = missingMap.get(displayLower);
    if (missing?.substitute) {
      return { ingredient: ing, status: 'substitute', substituteInfo: missing.substitute };
    }
    if (ing.isOptional || ing.isGarnish) {
      return { ingredient: ing, status: 'optional' };
    }
    return { ingredient: ing, status: 'missing' };
  });

  // Sort: matched first, then substituted, then optional, then missing
  const order: IngredientStatus[] = ['matched', 'substitute', 'optional', 'missing'];
  resolved.sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status));

  return (
    <View style={styles.container}>
      {resolved.map(({ ingredient, status, substituteInfo }) => {
        const cfg = STATUS_CONFIG[status];
        return (
          <View key={ingredient.id} style={[styles.row, { backgroundColor: cfg.bgColor }]}>
            {/* Status icon */}
            <View style={[styles.icon, { borderColor: cfg.color }]}>
              <Typography variant="captionMedium" color={cfg.color}>
                {cfg.icon}
              </Typography>
            </View>

            {/* Ingredient info */}
            <View style={styles.text}>
              <View style={styles.nameRow}>
                <Typography
                  variant="body"
                  color={status === 'missing' ? colors.danger : colors.text}
                  style={styles.displayText}
                >
                  {ingredient.quantity != null ? `${ingredient.quantity} ` : ''}
                  {ingredient.unit ? `${ingredient.unit} ` : ''}
                  {ingredient.displayText}
                </Typography>
                {(ingredient.isOptional || ingredient.isGarnish) ? (
                  <Typography variant="caption" color={colors.textTertiary}>
                    {ingredient.isGarnish ? 'garnish' : 'optional'}
                  </Typography>
                ) : null}
              </View>

              {/* Substitute hint */}
              {status === 'substitute' && substituteInfo ? (
                <Typography variant="caption" color={colors.warning}>
                  Use {substituteInfo.name}
                  {substituteInfo.notes ? ` — ${substituteInfo.notes}` : ''}
                </Typography>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderRadius: radii.md,
    padding: spacing.sm,
    borderWidth: 2,
    borderColor: brandColors.ink,
  },
  icon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  displayText: {
    flexShrink: 1,
  },
});
