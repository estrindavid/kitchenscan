import { View, ScrollView, StyleSheet } from 'react-native';
import { Skeleton } from '../ui/Skeleton';
import { colors, spacing, radii } from '../ui/theme';

export function RecipeDetailSkeleton() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.backPlaceholder} />
      <Skeleton width="100%" height={220} borderRadius={0} />
      <View style={styles.section}>
        <Skeleton width="70%" height={26} />
        <Skeleton width="95%" height={14} style={styles.line} />
        <Skeleton width="80%" height={14} />
        <View style={styles.badgeRow}>
          <Skeleton width={80} height={22} borderRadius={radii.full} />
          <Skeleton width={70} height={22} borderRadius={radii.full} />
          <Skeleton width={90} height={22} borderRadius={radii.full} />
        </View>
      </View>
      <View style={styles.section}>
        <Skeleton width="40%" height={18} />
        {Array.from({ length: 5 }).map((_, i) => (
          <View key={i} style={styles.ingredientRow}>
            <Skeleton width={20} height={20} borderRadius={radii.full} />
            <Skeleton width="70%" height={14} />
          </View>
        ))}
      </View>
      <View style={styles.section}>
        <Skeleton width="40%" height={18} />
        {Array.from({ length: 3 }).map((_, i) => (
          <View key={i} style={styles.stepRow}>
            <Skeleton width={28} height={28} borderRadius={14} />
            <View style={styles.stepBody}>
              <Skeleton width="95%" height={14} />
              <Skeleton width="60%" height={14} style={styles.line} />
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 40 },
  backPlaceholder: { height: 48 },
  section: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, gap: spacing.sm },
  line: { marginTop: 2 },
  badgeRow: { flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap' },
  ingredientRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  stepBody: { flex: 1, gap: spacing.xs },
});
