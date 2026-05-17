import { useRef, useCallback, useState, useEffect } from 'react';
import { Image, View, StyleSheet, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import Constants from 'expo-constants';
import { useScanStore } from '../../stores/scanStore';
import { ScannerOverlay } from './ScannerOverlay';
import { DetectionTray } from './DetectionTray';
import { BarcodeResultSheet } from '../barcode/BarcodeResultSheet';
import { filterByConfidence, nms } from '../../utils/deduplication';
import { getDetectionProvider } from '../../services/detectionProvider';
import { dataUriToBase64 } from '../../utils/imagePreprocess';
import { useAddPantryItem } from '../../hooks/usePantry';
import type { Detection, AddPantryItemRequest } from '@kitchenscan/shared';

interface ScannerProps {
  onAddToPantry: () => void;
}

const IS_EXPO_GO = Constants.appOwnership === 'expo';

// ─── Main Scanner ──────────────────────────────────────────

export function Scanner({ onAddToPantry }: ScannerProps) {
  if (Platform.OS === 'web' || IS_EXPO_GO) {
    return <WebScanner onAddToPantry={onAddToPantry} />;
  }
  return <NativeScanner onAddToPantry={onAddToPantry} />;
}

// ─── Native Scanner ────────────────────────────────────────

function NativeScanner({ onAddToPantry }: ScannerProps) {
  const [frameSize, setFrameSize] = useState({ width: 1, height: 1 });
  const [detectedBarcode, setDetectedBarcode] = useState<string | null>(null);
  const [capturedPhotoUri, setCapturedPhotoUri] = useState<string | null>(null);
  const barcodeCooldownRef = useRef(0);
  const BARCODE_COOLDOWN_MS = 3000;

  const {
    items, isScanning, addDetections, removeItem, updateItem, confirmAll,
    setScanning, scanStatus, setScanStatus, setLastError, scanAttempts, lastError,
  } = useScanStore();
  const addItem = useAddPantryItem();

  const confirmedIdsRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    const newlyConfirmed = items.filter(
      (item) => item.confirmed && !confirmedIdsRef.current.has(item.id),
    );
    if (newlyConfirmed.length > 0) {
      newlyConfirmed.forEach((item) => confirmedIdsRef.current.add(item.id));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [items]);

  const VisionCamera = require('react-native-vision-camera');
  const { Camera, useCameraDevice, useCameraPermission, useFrameProcessor, useCodeScanner } =
    VisionCamera;
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');

  const handleDetections = useCallback(
    (detections: Detection[]) => {
      const filtered = filterByConfidence(nms(detections), 0.4);
      if (filtered.length > 0) {
        // Pass all detections at once so aggregateToQuantity can count bboxes
        addDetections(filtered.map((d) => ({
          label: d.label,
          confidence: d.confidence,
          boundingBox: d.boundingBox,
        })));
        setScanStatus('detected');
      } else {
        setScanStatus('empty');
      }
    },
    [addDetections, setScanStatus],
  );

  const codeScanner = useCodeScanner({
    codeTypes: ['ean-13', 'upc-a', 'ean-8', 'code-128', 'code-39'],
    onCodeScanned: (codes: Array<{ value?: string }>) => {
      const now = Date.now();
      if (now - barcodeCooldownRef.current < BARCODE_COOLDOWN_MS) return;
      const value = codes[0]?.value;
      if (!value) return;
      barcodeCooldownRef.current = now;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setDetectedBarcode(value);
    },
  });

  // Frame processor — wired to cloud provider via runOnJS
  const { runOnJS } = require('react-native-worklets-core');
  const cameraRef = useRef<{ takePhoto: (opts: object) => Promise<{ path: string }> } | null>(null);

  const handleCapture = useCallback(async () => {
    if (!cameraRef.current || scanStatus === 'processing') return;
    setScanStatus('processing');
    try {
      const provider = getDetectionProvider();
      const photo = await (cameraRef.current as unknown as {
        takePhoto: (opts: object) => Promise<{ path: string; width: number; height: number }>;
      }).takePhoto({ flash: 'off' });
      const previewUri = photo.path.startsWith('file://') ? photo.path : `file://${photo.path}`;
      setCapturedPhotoUri(previewUri);
      // Convert file path to base64 for the cloud provider
      const base64 = photo.path;
      const detections = await provider.detect(base64, photo.width ?? 1, photo.height ?? 1);
      handleDetections(detections);
    } catch (err) {
      setScanStatus('error');
      setLastError((err as Error).message);
    }
  }, [scanStatus, setScanStatus, setLastError, handleDetections]);

  const handleRetake = useCallback(() => {
    setCapturedPhotoUri(null);
    setLastError(null);
    setScanStatus('idle');
  }, [setLastError, setScanStatus]);

  const frameProcessor = useFrameProcessor(
    (_frame: { width: number; height: number; timestamp: number }) => {
      'worklet';
      // Frame processor intentionally empty — detection is triggered via tap-to-capture button.
      // See handleCapture() above which uses takePhoto() on demand.
    },
    [],
  );

  useEffect(() => {
    setScanning(true);
    return () => setScanning(false);
  }, [setScanning]);

  const handleBarcodeAddToPantry = useCallback(
    (item: AddPantryItemRequest) => {
      addItem.mutate(item, {
        onSuccess: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
        onError: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        },
      });
    },
    [addItem],
  );

  if (!hasPermission) return <PermissionPrompt onRequest={requestPermission} />;
  if (!device) return <View style={styles.centered} />;

  return (
    <View style={StyleSheet.absoluteFill}>
      {capturedPhotoUri ? (
        <Image source={{ uri: capturedPhotoUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      ) : (
        <Camera
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={!detectedBarcode}
          frameProcessor={frameProcessor}
          codeScanner={codeScanner}
          pixelFormat="rgb"
          fps={30}
          photo
          video={false}
          enableBufferCompression
          onInitialized={() =>
            setFrameSize({
              width: device.formats[0]?.videoWidth ?? 1920,
              height: device.formats[0]?.videoHeight ?? 1080,
            })
          }
        />
      )}
      <ScannerOverlay
        scanStatus={scanStatus}
        photoCount={scanAttempts}
        itemCount={items.length}
        errorMessage={lastError}
        onCapture={handleCapture}
        onRetake={handleRetake}
        showingCapturedPhoto={Boolean(capturedPhotoUri)}
        onRetry={handleRetake}
      />
      <DetectionTray
        items={items}
        photoCount={scanAttempts}
        onRemove={removeItem}
        onUpdateQuantity={(id, qty) => updateItem(id, { quantity: qty })}
        onConfirmAll={confirmAll}
        onAddToPantry={onAddToPantry}
      />
      <BarcodeResultSheet
        barcode={detectedBarcode}
        onDismiss={() => setDetectedBarcode(null)}
        onAddToPantry={handleBarcodeAddToPantry}
        onAddManually={() => setDetectedBarcode(null)}
      />
    </View>
  );
}

// ─── Web Scanner (expo-camera fallback / Expo Go) ─────────

function WebScanner({ onAddToPantry }: ScannerProps) {
  const cameraRef = useRef<{
    takePictureAsync: (
      opts: object,
    ) => Promise<{ base64?: string; width: number; height: number }>;
  } | null>(null);
  const [detectedBarcode, setDetectedBarcode] = useState<string | null>(null);
  const [capturedPhotoUri, setCapturedPhotoUri] = useState<string | null>(null);
  const barcodeCooldownRef = useRef(0);
  const BARCODE_COOLDOWN_MS = 3000;

  const {
    items, addDetections, removeItem, updateItem, confirmAll,
    setScanning, scanStatus, setScanStatus, setLastError, scanAttempts, lastError,
  } = useScanStore();
  const addItem = useAddPantryItem();

  const confirmedIdsRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    const newlyConfirmed = items.filter(
      (item) => item.confirmed && !confirmedIdsRef.current.has(item.id),
    );
    if (newlyConfirmed.length > 0) {
      newlyConfirmed.forEach((item) => confirmedIdsRef.current.add(item.id));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [items]);

  const { CameraView, useCameraPermissions } = require('expo-camera');
  const [permission, requestPermission] = useCameraPermissions();

  const handleCapture = useCallback(async () => {
    if (!cameraRef.current || scanStatus === 'processing') return;
    setScanStatus('processing');
    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.6,
        skipProcessing: true,
      });
      if (!photo.base64) {
        setScanStatus('empty');
        return;
      }

      const provider = getDetectionProvider();
      const base64 = dataUriToBase64(photo.base64);
      setCapturedPhotoUri(`data:image/jpeg;base64,${base64}`);
      const detections = await provider.detect(base64, photo.width, photo.height);
      const filtered = filterByConfidence(nms(detections), 0.4);

      if (filtered.length === 0) {
        setScanStatus('empty');
      } else {
        // Pass all detections at once so aggregateToQuantity can count bboxes
        addDetections(filtered.map((d) => ({
          label: d.label,
          confidence: d.confidence,
          boundingBox: d.boundingBox,
        })));
        setScanStatus('detected');
      }
    } catch (err) {
      setScanStatus('error');
      setLastError((err as Error).message);
    }
  }, [scanStatus, setScanStatus, setLastError, addDetections]);

  const handleRetake = useCallback(() => {
    setCapturedPhotoUri(null);
    setLastError(null);
    setScanStatus('idle');
  }, [setLastError, setScanStatus]);

  const handleBarcodeScanned = useCallback(
    (result: { data: string }) => {
      const now = Date.now();
      if (now - barcodeCooldownRef.current < BARCODE_COOLDOWN_MS) return;
      barcodeCooldownRef.current = now;
      setDetectedBarcode(result.data);
    },
    [],
  );

  const handleBarcodeAddToPantry = useCallback(
    (item: AddPantryItemRequest) => {
      addItem.mutate(item, {
        onSuccess: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
        onError: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        },
      });
    },
    [addItem],
  );

  useEffect(() => {
    setScanning(true);
    return () => setScanning(false);
  }, [setScanning]);

  if (!permission) return null;
  if (!permission.granted) return <PermissionPrompt onRequest={requestPermission} />;

  return (
    <View style={StyleSheet.absoluteFill}>
      {capturedPhotoUri ? (
        <Image source={{ uri: capturedPhotoUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      ) : (
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['ean13', 'upc_a', 'ean8', 'code128', 'code39'] }}
          onBarcodeScanned={detectedBarcode ? undefined : handleBarcodeScanned}
        />
      )}
      <ScannerOverlay
        scanStatus={scanStatus}
        photoCount={scanAttempts}
        itemCount={items.length}
        errorMessage={lastError}
        onCapture={handleCapture}
        onRetake={handleRetake}
        showingCapturedPhoto={Boolean(capturedPhotoUri)}
        onRetry={handleRetake}
      />
      <DetectionTray
        items={items}
        photoCount={scanAttempts}
        onRemove={removeItem}
        onUpdateQuantity={(id, qty) => updateItem(id, { quantity: qty })}
        onConfirmAll={confirmAll}
        onAddToPantry={onAddToPantry}
      />
      <BarcodeResultSheet
        barcode={detectedBarcode}
        onDismiss={() => setDetectedBarcode(null)}
        onAddToPantry={handleBarcodeAddToPantry}
        onAddManually={() => setDetectedBarcode(null)}
      />
    </View>
  );
}

// ─── Permission prompt ─────────────────────────────────────

import { TouchableOpacity, Text } from 'react-native';
import { colors, spacing } from '../ui/theme';
import { Typography } from '../ui';

function PermissionPrompt({ onRequest }: { onRequest: () => void }) {
  return (
    <View style={styles.permissionContainer}>
      <Typography variant="h3" color="#fff" style={styles.permissionTitle}>
        Camera Access Required
      </Typography>
      <Typography variant="body" color="rgba(255,255,255,0.7)" style={styles.permissionDesc}>
        KitchenScan needs your camera to scan food items.
      </Typography>
      <TouchableOpacity style={styles.permissionBtn} onPress={onRequest}>
        <Text style={styles.permissionBtnText}>Grant Permission</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['3xl'],
  },
  permissionTitle: {
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  permissionDesc: {
    textAlign: 'center',
    marginBottom: spacing['3xl'],
  },
  permissionBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
    borderRadius: 12,
  },
  permissionBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
