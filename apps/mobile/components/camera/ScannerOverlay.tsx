import { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Typography } from '../ui';
import { colors } from '../ui/theme';
import type { ScanStatus } from '../../stores/scanStore';

const CORNER_SIZE = 24;
const CORNER_THICKNESS = 3;
const FRAME_COLOR = colors.primary;

interface ScannerOverlayProps {
  scanStatus: ScanStatus;
  onRetry?: () => void;
  onCapture?: () => void;
  photoCount?: number;
  itemCount?: number;
  errorMessage?: string | null;
}

const STATUS_CONFIG: Record<
  ScanStatus,
  { message: string; showSpinner: boolean; dotColor: string }
> = {
  idle:       { message: 'Tap Capture to scan food items',                         showSpinner: false, dotColor: '#888' },
  processing: { message: 'Identifying items…',                                     showSpinner: true,  dotColor: colors.warning },
  detected:   { message: 'Items found — capture another photo or review below',     showSpinner: false, dotColor: colors.primary },
  empty:      { message: 'Nothing found — try a different angle',                 showSpinner: false, dotColor: '#888' },
  error:      { message: 'Could not reach detection service — try again',          showSpinner: false, dotColor: colors.danger },
};

export function ScannerOverlay({
  scanStatus,
  onRetry,
  onCapture,
  photoCount = 0,
  itemCount = 0,
  errorMessage,
}: ScannerOverlayProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const config = STATUS_CONFIG[scanStatus];
  const message = scanStatus === 'error' && errorMessage ? errorMessage : config.message;

  useEffect(() => {
    if (scanStatus !== 'processing') {
      pulseAnim.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.5, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,   duration: 600, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [scanStatus, pulseAnim]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Dark vignette */}
      <View style={styles.vignette} pointerEvents="none" />

      {/* Scan frame */}
      <View style={styles.frameContainer} pointerEvents="none">
        <Animated.View style={[styles.frame, { opacity: pulseAnim }]}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
        </Animated.View>
      </View>

      {/* Connection status dot (top-right) */}
      <View style={styles.statusDotContainer} pointerEvents="none">
        <View style={[styles.statusDot, { backgroundColor: config.dotColor }]} />
      </View>

      {/* Session progress */}
      <View style={styles.sessionContainer} pointerEvents="none">
        <Typography variant="captionMedium" color="#fff">
          {photoCount} photo{photoCount === 1 ? '' : 's'} · {itemCount} item{itemCount === 1 ? '' : 's'}
        </Typography>
      </View>

      {/* Spinner (processing) */}
      {config.showSpinner && (
        <View style={styles.spinnerContainer} pointerEvents="none">
          <ActivityIndicator size="small" color="#fff" />
        </View>
      )}

      {/* Message banner */}
      {!!message && (
        <View style={styles.hintContainer} pointerEvents="none">
          <Typography variant="body" color="rgba(255,255,255,0.85)" style={styles.hint}>
            {message}
          </Typography>
        </View>
      )}

      {/* Retry button (error state) */}
      {scanStatus === 'error' && onRetry && (
        <View style={styles.retryContainer} pointerEvents="box-none">
          <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
            <Typography variant="captionMedium" color="#fff">
              Try again
            </Typography>
          </TouchableOpacity>
        </View>
      )}

      {/* Capture button (idle / empty states) */}
      {(scanStatus === 'idle' || scanStatus === 'empty' || scanStatus === 'detected') && onCapture && (
        <View style={styles.captureContainer} pointerEvents="box-none">
          <TouchableOpacity style={styles.captureBtn} onPress={onCapture}>
            <View style={styles.captureInner} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const FRAME_SIZE = 260;

const styles = StyleSheet.create({
  vignette: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  frameContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frame: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    backgroundColor: 'transparent',
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: FRAME_COLOR,
  },
  topLeft:     { top: 0, left: 0,   borderTopWidth: CORNER_THICKNESS, borderLeftWidth:  CORNER_THICKNESS, borderTopLeftRadius: 4 },
  topRight:    { top: 0, right: 0,  borderTopWidth: CORNER_THICKNESS, borderRightWidth: CORNER_THICKNESS, borderTopRightRadius: 4 },
  bottomLeft:  { bottom: 0, left: 0,  borderBottomWidth: CORNER_THICKNESS, borderLeftWidth:  CORNER_THICKNESS, borderBottomLeftRadius: 4 },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: CORNER_THICKNESS, borderRightWidth: CORNER_THICKNESS, borderBottomRightRadius: 4 },
  statusDotContainer: {
    position: 'absolute',
    top: 64,
    right: 16,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  sessionContainer: {
    position: 'absolute',
    top: 62,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.48)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  spinnerContainer: {
    position: 'absolute',
    top: '40%',
    alignSelf: 'center',
  },
  hintContainer: {
    position: 'absolute',
    bottom: 250,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  hint: {
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  retryContainer: {
    position: 'absolute',
    bottom: 190,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  retryBtn: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  captureContainer: {
    position: 'absolute',
    bottom: 108,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  captureBtn: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  captureInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255,255,255,0.52)',
  },
});
