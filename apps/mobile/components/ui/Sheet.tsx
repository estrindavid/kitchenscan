import { Modal, View, Pressable, StyleSheet, ScrollView } from 'react-native';
import { radii, spacing } from './theme';
import { useThemeColors } from './ThemeProvider';

interface SheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Sheet({ visible, onClose, children }: SheetProps) {
  const c = useThemeColors();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { backgroundColor: c.surface }]}
          onPress={() => {}}
        >
          <View style={[styles.handle, { backgroundColor: c.border }]} />
          <ScrollView contentContainerStyle={styles.content}>
            {children}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    maxHeight: '90%',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginVertical: spacing.md,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing['4xl'],
  },
});
