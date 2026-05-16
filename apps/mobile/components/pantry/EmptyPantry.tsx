import { View, StyleSheet } from 'react-native';
import { Button } from '../ui';
import { EmptyState } from '../ui/EmptyState';
import { spacing } from '../ui/theme';

interface EmptyPantryProps {
  onAddItem: () => void;
  onScan: () => void;
}

export function EmptyPantry({ onAddItem, onScan }: EmptyPantryProps) {
  return (
    <View style={styles.container}>
      <EmptyState
        icon="🧺"
        title="Your pantry is empty"
        subtitle="Start by scanning items with your camera or adding them manually."
      />
      <View style={styles.actions}>
        <Button label="Scan Items" onPress={onScan} fullWidth size="lg" />
        <Button label="Add Manually" variant="secondary" onPress={onAddItem} fullWidth />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  actions: { gap: spacing.sm, paddingHorizontal: spacing['3xl'], paddingBottom: spacing['3xl'] },
});
