import { View, StyleSheet } from 'react-native';
import { Skeleton } from '../ui/Skeleton';
import { colors, spacing, radii } from '../ui/theme';

function SkeletonRow() {
  return (
    <View style={styles.row}>
      <Skeleton width={40} height={40} borderRadius={radii.md} />
      <View style={styles.rowBody}>
        <Skeleton width="55%" height={14} />
        <Skeleton width="35%" height={12} style={styles.subLine} />
      </View>
      <Skeleton width={48} height={20} borderRadius={radii.full} />
    </View>
  );
}

export function PantryListSkeleton() {
  return (
    <View style={styles.container}>
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, gap: spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowBody: { flex: 1, gap: spacing.xs },
  subLine: { marginTop: 2 },
});
