import { View, StyleSheet } from 'react-native';
import { Typography } from '../ui';
import { colors } from '../ui/theme';
import type { ScannedItem } from '../../stores/scanStore';

interface BoundingBoxRendererProps {
  items: ScannedItem[];
  /** Camera preview dimensions on screen */
  previewWidth: number;
  previewHeight: number;
  /** Actual camera frame dimensions */
  frameWidth: number;
  frameHeight: number;
}

export function BoundingBoxRenderer({
  items,
  previewWidth,
  previewHeight,
  frameWidth,
  frameHeight,
}: BoundingBoxRendererProps) {
  if (!frameWidth || !frameHeight) return null;

  const scaleX = previewWidth / frameWidth;
  const scaleY = previewHeight / frameHeight;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {items.map((item) => {
        const left = item.bbox.x * scaleX;
        const top = item.bbox.y * scaleY;
        const width = item.bbox.width * scaleX;
        const height = item.bbox.height * scaleY;

        const boxColor = item.confirmed
          ? colors.primary
          : `rgba(255, 200, 0, 0.9)`;

        const confidencePct = Math.round(item.bestConfidence * 100);
        const progressWidth = Math.min(
          item.detectionCount * (100 / 3),
          100,
        );

        return (
          <View
            key={item.id}
            style={[
              styles.box,
              { left, top, width, height, borderColor: boxColor },
            ]}
          >
            {/* Label chip above the box */}
            <View style={[styles.labelChip, { backgroundColor: boxColor }]}>
              <Typography variant="label" color="#fff" style={styles.labelText}>
                {item.label} {confidencePct}%
              </Typography>
            </View>

            {/* Detection progress bar (fills as more frames confirm the item) */}
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progressWidth}%` as `${number}%`, backgroundColor: boxColor },
                ]}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    position: 'absolute',
    borderWidth: 2,
    borderRadius: 4,
  },
  labelChip: {
    position: 'absolute',
    top: -22,
    left: -1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    minWidth: 60,
  },
  labelText: {
    fontSize: 10,
  },
  progressBar: {
    position: 'absolute',
    bottom: -4,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});
