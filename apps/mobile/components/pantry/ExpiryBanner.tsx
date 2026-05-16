import { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../ui';
import { colors, spacing, radii } from '../ui/theme';
import { useExpiringItems } from '../../hooks/usePantry';

export function ExpiryBanner() {
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);
  const { data: expiring = [] } = useExpiringItems(3);

  if (dismissed || expiring.length === 0) return null;

  return (
    <View style={styles.banner}>
      <Ionicons name="warning-outline" size={18} color={colors.warning} />
      <Typography variant="captionMedium" color={colors.warning} style={styles.text}>
        {expiring.length} item{expiring.length !== 1 ? 's' : ''} expiring within 3 days
      </Typography>
      <Pressable
        onPress={() => router.push('/pantry/expiring')}
        style={styles.viewBtn}
        hitSlop={8}
      >
        <Typography variant="captionMedium" color={colors.primary}>View</Typography>
      </Pressable>
      <Pressable onPress={() => setDismissed(true)} hitSlop={8}>
        <Ionicons name="close" size={16} color={colors.textTertiary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    backgroundColor: colors.warningLight,
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  text: { flex: 1 },
  viewBtn: {
    paddingHorizontal: spacing.xs,
  },
});
