import { View, StyleSheet } from 'react-native';
import { Skeleton } from '../ui/Skeleton';
import { colors, spacing, radii } from '../ui/theme';

export function RecipeCardSkeleton() {
  return (
    <View style={styles.card}>
      <Skeleton width="100%" height={160} borderRadius={0} />
      <View style={styles.body}>
        <Skeleton width="75%" height={18} />
        <Skeleton width="90%" height={13} style={styles.line} />
        <Skeleton width="60%" height={13} />
        <View style={styles.metaRow}>
          <Skeleton width={60} height={20} borderRadius={radii.full} />
          <Skeleton width={80} height={20} borderRadius={radii.full} />
        </View>
        <Skeleton width="100%" height={4} borderRadius={2} style={styles.bar} />
      </View>
    </View>
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
  body: { padding: spacing.md, gap: spacing.sm },
  line: { marginTop: 2 },
  metaRow: { flexDirection: 'row', gap: spacing.xs },
  bar: { marginTop: spacing.xs },
});
