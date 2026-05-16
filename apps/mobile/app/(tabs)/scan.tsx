import { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  TextInput,
  Pressable,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Scanner } from '../../components/camera/Scanner';
import { useScanStore } from '../../stores/scanStore';
import { colors, spacing, radii } from '../../components/ui/theme';

const IS_WEB = Platform.OS === 'web';

const DEMO_ITEMS = [
  { label: 'broccoli', confidence: 1.0, boundingBox: { x: 0.2, y: 0.3, width: 0.2, height: 0.2 } },
  { label: 'chicken', confidence: 1.0, boundingBox: { x: 0.5, y: 0.3, width: 0.2, height: 0.2 } },
  { label: 'bell pepper', confidence: 1.0, boundingBox: { x: 0.7, y: 0.4, width: 0.2, height: 0.2 } },
];

export default function ScanScreen() {
  const router = useRouter();
  const { items, addDetection, addDetections, reset } = useScanStore();
  const [searchText, setSearchText] = useState('');

  const handleAddToPantry = useCallback(() => {
    const confirmed = items.filter((i) => i.confirmed);
    if (confirmed.length === 0) return;
    router.push('/confirm');
  }, [items, router]);

  const handleManualAdd = useCallback(() => {
    const name = searchText.trim();
    if (!name) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addDetection({ label: name, confidence: 1.0, boundingBox: { x: 0.4, y: 0.4, width: 0.2, height: 0.2 } });
    addDetection({ label: name, confidence: 1.0, boundingBox: { x: 0.4, y: 0.4, width: 0.2, height: 0.2 } });
    addDetection({ label: name, confidence: 1.0, boundingBox: { x: 0.4, y: 0.4, width: 0.2, height: 0.2 } });
    setSearchText('');
  }, [searchText, addDetection]);

  const handleSimulateScan = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    reset();
    // Add each demo item 3 times to hit the confirm threshold
    for (const item of DEMO_ITEMS) {
      addDetections([item, item, item]);
    }
    router.push('/confirm');
  }, [addDetections, reset, router]);

  if (IS_WEB) {
    return (
      <View style={styles.demoContainer}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.demoBanner}>
          <Text style={styles.demoBannerText}>📷 Demo Mode</Text>
          <Text style={styles.demoBannerSubtext}>
            Camera is not available in web mode. Use the simulator below to demo the scan flow.
          </Text>
        </View>
        <ScrollView contentContainerStyle={styles.demoBody}>
          <Text style={styles.demoSectionLabel}>SIMULATED DETECTIONS</Text>
          {DEMO_ITEMS.map((item) => (
            <View key={item.label} style={styles.demoItemRow}>
              <Text style={styles.demoItemName}>{item.label}</Text>
              <Text style={styles.demoItemConfidence}>100% confidence</Text>
            </View>
          ))}
          <Pressable style={styles.simulateBtn} onPress={handleSimulateScan}>
            <Text style={styles.simulateBtnText}>Simulate Scan</Text>
          </Pressable>
          <Text style={styles.demoHint}>
            Or type a food name below to add it manually:
          </Text>
          <View style={styles.manualRow}>
            <TextInput
              style={styles.manualInput}
              value={searchText}
              onChangeText={setSearchText}
              placeholder="e.g. tomato, garlic…"
              returnKeyType="done"
              onSubmitEditing={handleManualAdd}
              autoCorrect={false}
              autoCapitalize="none"
            />
            <Pressable
              style={[styles.manualAddBtn, !searchText.trim() && styles.manualAddBtnDisabled]}
              onPress={handleManualAdd}
              disabled={!searchText.trim()}
            >
              <Text style={styles.manualAddBtnText}>Add</Text>
            </Pressable>
          </View>
          {items.filter((i) => i.confirmed).length > 0 && (
            <Pressable style={styles.goToConfirmBtn} onPress={handleAddToPantry}>
              <Text style={styles.goToConfirmText}>
                Review {items.filter((i) => i.confirmed).length} item(s) →
              </Text>
            </Pressable>
          )}
        </ScrollView>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" />
      <Scanner onAddToPantry={handleAddToPantry} />

      {/* Manual add bar — floats above the camera */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Type a food name to add…"
          placeholderTextColor="rgba(255,255,255,0.45)"
          returnKeyType="done"
          onSubmitEditing={handleManualAdd}
          autoCorrect={false}
          autoCapitalize="none"
        />
        <Pressable
          style={[styles.addBtn, !searchText.trim() && styles.addBtnDisabled]}
          onPress={handleManualAdd}
          disabled={!searchText.trim()}
        >
          <Text style={styles.addBtnText}>+</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  // ── Demo Mode ─────────────────────────────────────────────
  demoContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  demoBanner: {
    backgroundColor: colors.primaryLight,
    padding: spacing.lg,
    gap: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  demoBannerText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  demoBannerSubtext: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  demoBody: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  demoSectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textTertiary,
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  demoItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  demoItemName: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
    textTransform: 'capitalize',
  },
  demoItemConfidence: {
    fontSize: 13,
    color: colors.success,
  },
  simulateBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radii.full,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  simulateBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  demoHint: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  manualRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  manualInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  manualAddBtn: {
    backgroundColor: colors.primary,
    height: 44,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
    justifyContent: 'center',
  },
  manualAddBtnDisabled: {
    backgroundColor: colors.borderLight,
  },
  manualAddBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  goToConfirmBtn: {
    backgroundColor: colors.success,
    paddingVertical: spacing.md,
    borderRadius: radii.full,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  goToConfirmText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  // ── Camera Mode ───────────────────────────────────────────
  searchBar: {
    position: 'absolute',
    top: 52,
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    paddingLeft: spacing.md,
    paddingRight: 4,
    gap: spacing.xs,
  },
  searchInput: {
    flex: 1,
    height: 44,
    color: '#fff',
    fontSize: 15,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnDisabled: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  addBtnText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '300',
    lineHeight: 26,
  },
});
