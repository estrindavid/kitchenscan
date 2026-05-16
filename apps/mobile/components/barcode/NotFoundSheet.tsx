import { View, StyleSheet } from 'react-native';
import { Typography, Button } from '../ui';
import { colors, spacing, radii } from '../ui/theme';

interface NotFoundSheetProps {
  barcode: string;
  /** Called with the scanned barcode so the add form can pre-fill it */
  onAddManually: (barcode: string) => void;
}

export function NotFoundSheet({ barcode, onAddManually }: NotFoundSheetProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Typography variant="h2" color={colors.textTertiary}>
          ?
        </Typography>
      </View>

      <Typography variant="h3" style={styles.title}>
        Product Not Found
      </Typography>

      <Typography variant="body" color={colors.textSecondary} style={styles.desc}>
        Barcode <Typography variant="bodyMedium" color={colors.text}>{barcode}</Typography> wasn't
        found in Open Food Facts.
      </Typography>

      <Button label="Add Manually" onPress={() => onAddManually(barcode)} fullWidth />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    textAlign: 'center',
  },
  desc: {
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
});
