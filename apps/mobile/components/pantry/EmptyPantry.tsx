import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Typography } from '../ui';
import { brandColors, colors, spacing } from '../ui/theme';
import { MemphisBackground, PantryShelfScene } from '../brand';

interface EmptyPantryProps {
  onAddItem: () => void;
  onScan: () => void;
}

export function EmptyPantry({ onAddItem, onScan }: EmptyPantryProps) {
  return (
    <View style={styles.container}>
      <MemphisBackground variant="cream" density="medium" />
      <View style={styles.sceneWrap}>
        <PantryShelfScene />
      </View>
      <View style={styles.copy}>
        <Typography variant="h1" color={brandColors.ink} style={styles.title}>
          Your kitchen is ready for its first scan.
        </Typography>
        <Typography variant="body" color={colors.textSecondary} style={styles.subtitle}>
          Add a few ingredients and KitchenScan will start matching recipes around what is already home.
        </Typography>
      </View>
      <View style={styles.actions}>
        <Button
          label="Scan Items"
          onPress={onScan}
          fullWidth
          size="lg"
          icon={<Ionicons name="scan" size={18} color="#FFFFFF" />}
        />
        <Button
          label="Add Manually"
          variant="secondary"
          onPress={onAddItem}
          fullWidth
          icon={<Ionicons name="add" size={18} color={colors.text} />}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    backgroundColor: brandColors.cream,
  },
  sceneWrap: {
    minHeight: 250,
    justifyContent: 'center',
  },
  copy: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 22,
  },
  actions: {
    gap: spacing.sm,
    paddingTop: spacing['2xl'],
    paddingBottom: spacing['3xl'],
  },
});
