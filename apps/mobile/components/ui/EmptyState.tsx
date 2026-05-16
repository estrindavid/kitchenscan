import { View, StyleSheet } from 'react-native';
import { Typography, Button } from './index';
import { colors, spacing } from './theme';

interface EmptyStateProps {
  icon: string;
  title: string;
  subtitle: string;
  action?: { label: string; onPress: () => void };
}

export function EmptyState({ icon, title, subtitle, action }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Typography variant="h1" style={styles.icon}>{icon}</Typography>
      <Typography variant="h3" color={colors.textSecondary} style={styles.title}>{title}</Typography>
      <Typography variant="body" color={colors.textTertiary} style={styles.subtitle}>{subtitle}</Typography>
      {action ? (
        <Button label={action.label} onPress={action.onPress} size="md" />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['3xl'],
    gap: spacing.md,
  },
  icon: { fontSize: 56, textAlign: 'center' },
  title: { textAlign: 'center' },
  subtitle: { textAlign: 'center', lineHeight: 22 },
});
