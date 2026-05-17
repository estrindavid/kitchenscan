import { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  TextInput,
  Pressable,
  Text,
  Platform,
  ScrollView,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Scanner } from '../../components/camera/Scanner';
import { FoodIcon, MemphisBackground } from '../../components/brand';
import { useScanStore } from '../../stores/scanStore';
import { brandColors, colors, spacing, radii } from '../../components/ui/theme';
import { trackEvent } from '../../services/analytics';

const IS_WEB = Platform.OS === 'web';

const DEMO_ITEMS = [
  { label: 'broccoli', confidence: 1.0, boundingBox: { x: 0.2, y: 0.3, width: 0.2, height: 0.2 } },
  { label: 'chicken', confidence: 1.0, boundingBox: { x: 0.5, y: 0.3, width: 0.2, height: 0.2 } },
  { label: 'bell pepper', confidence: 1.0, boundingBox: { x: 0.7, y: 0.4, width: 0.2, height: 0.2 } },
];

export default function ScanScreen() {
  const router = useRouter();
  const { items, addDetection, addDetections, reset, recordCapture, scanAttempts, setScanning, setScanStatus } = useScanStore();
  const [searchText, setSearchText] = useState('');
  const [isFocused, setIsFocused] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => {
        setIsFocused(false);
        setScanning(false);
        setScanStatus('idle');
      };
    }, [setScanning, setScanStatus]),
  );

  const handleAddToPantry = useCallback(() => {
    const confirmed = items.filter((i) => i.confirmed);
    if (confirmed.length === 0) return;
    router.push('/confirm');
  }, [items, router]);

  const handleManualAdd = useCallback(() => {
    const name = searchText.trim();
    if (!name) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    void trackEvent('manual_item_added', { source: 'scan_tab', label: name });
    recordCapture();
    addDetection({ label: name, confidence: 1.0, boundingBox: { x: 0.4, y: 0.4, width: 0.2, height: 0.2 } });
    addDetection({ label: name, confidence: 1.0, boundingBox: { x: 0.4, y: 0.4, width: 0.2, height: 0.2 } });
    addDetection({ label: name, confidence: 1.0, boundingBox: { x: 0.4, y: 0.4, width: 0.2, height: 0.2 } });
    setSearchText('');
  }, [searchText, addDetection, recordCapture]);

  const handleSimulateScan = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    void trackEvent('scan_started', { source: 'web_demo' });
    reset();
    recordCapture(3);
    // Add each demo item 3 times to hit the confirm threshold
    for (const item of DEMO_ITEMS) {
      addDetections([item, item, item]);
    }
    void trackEvent('scan_completed', { source: 'web_demo', detectionCount: DEMO_ITEMS.length });
    router.push('/confirm');
  }, [addDetections, reset, recordCapture, router]);

  if (IS_WEB) {
    return (
      <View style={styles.demoContainer}>
        <MemphisBackground variant="cream" density="medium" />
        <StatusBar barStyle="dark-content" />
        <View style={styles.demoBanner}>
          <View style={styles.demoBannerIcon}>
            <Ionicons name="scan" size={22} color={brandColors.ink} />
          </View>
          <View style={styles.demoBannerCopy}>
            <Text style={styles.demoBannerText}>Demo scanner</Text>
            <Text style={styles.demoBannerSubtext}>
              Camera is not available in web mode. Use the simulator below to demo the scan flow.
            </Text>
          </View>
          <FoodIcon type="tomato" size={48} />
        </View>
        <ScrollView contentContainerStyle={styles.demoBody}>
          <Text style={styles.demoSectionLabel}>SIMULATED DETECTIONS</Text>
          <View style={styles.sessionSummary}>
            <Text style={styles.sessionSummaryText}>
              Session: {scanAttempts} photo{scanAttempts === 1 ? '' : 's'} captured
            </Text>
            <Text style={styles.sessionSummarySubtext}>
              Capture several shelves, counters, or fridge angles before reviewing.
            </Text>
          </View>
          {DEMO_ITEMS.map((item) => (
            <View key={item.label} style={styles.demoItemRow}>
              <View style={styles.demoItemNameWrap}>
                <View style={styles.demoItemDot} />
                <Text style={styles.demoItemName}>{item.label}</Text>
              </View>
              <Text style={styles.demoItemConfidence}>100% confidence</Text>
            </View>
          ))}
          <Pressable style={styles.simulateBtn} onPress={handleSimulateScan}>
            <Text style={styles.simulateBtnText}>Simulate Scan</Text>
            <Ionicons name="sparkles" size={17} color={brandColors.white} />
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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      {isFocused ? <Scanner onAddToPantry={handleAddToPantry} /> : null}
    </View>
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
    backgroundColor: brandColors.cream,
  },
  demoBanner: {
    backgroundColor: brandColors.skyLight,
    padding: spacing.lg,
    gap: spacing.md,
    borderBottomWidth: 3,
    borderBottomColor: brandColors.ink,
    flexDirection: 'row',
    alignItems: 'center',
  },
  demoBannerIcon: {
    width: 46,
    height: 46,
    borderRadius: radii.md,
    borderWidth: 3,
    borderColor: brandColors.ink,
    backgroundColor: brandColors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoBannerCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  demoBannerText: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800',
    color: brandColors.ink,
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
    fontWeight: '800',
    color: brandColors.ink,
    marginBottom: spacing.xs,
  },
  demoItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: brandColors.white,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 2,
    borderColor: brandColors.ink,
  },
  demoItemNameWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  demoItemDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: brandColors.ink,
  },
  demoItemName: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
    textTransform: 'capitalize',
  },
  demoItemConfidence: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  sessionSummary: {
    backgroundColor: brandColors.white,
    borderRadius: radii.md,
    borderWidth: 3,
    borderColor: brandColors.ink,
    padding: spacing.md,
    gap: 4,
  },
  sessionSummaryText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  sessionSummarySubtext: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  simulateBtn: {
    backgroundColor: brandColors.ink,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    borderWidth: 3,
    borderColor: brandColors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
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
    borderColor: brandColors.ink,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  manualAddBtn: {
    backgroundColor: brandColors.ink,
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
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    borderWidth: 3,
    borderColor: brandColors.ink,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  goToConfirmText: {
    color: brandColors.ink,
    fontSize: 15,
    fontWeight: '600',
  },
});
