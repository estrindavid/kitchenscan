import type { BoundingBox } from '@kitchenscan/shared';

/**
 * Compute Intersection over Union for two bounding boxes.
 * Returns a value in [0, 1] where 1 = identical boxes.
 */
export function computeIoU(a: BoundingBox, b: BoundingBox): number {
  const xA = Math.max(a.x, b.x);
  const yA = Math.max(a.y, b.y);
  const xB = Math.min(a.x + a.width, b.x + b.width);
  const yB = Math.min(a.y + a.height, b.y + b.height);

  const interArea = Math.max(0, xB - xA) * Math.max(0, yB - yA);
  const areaA = a.width * a.height;
  const areaB = b.width * b.height;
  const unionArea = areaA + areaB - interArea;

  return unionArea === 0 ? 0 : interArea / unionArea;
}

/**
 * Non-Maximum Suppression: remove overlapping boxes keeping the highest confidence.
 */
export function nms<T extends { confidence: number; boundingBox: BoundingBox }>(
  detections: T[],
  iouThreshold = 0.5,
): T[] {
  const sorted = [...detections].sort((a, b) => b.confidence - a.confidence);
  const kept: T[] = [];

  for (const detection of sorted) {
    const overlap = kept.some(
      (k) => computeIoU(k.boundingBox, detection.boundingBox) > iouThreshold,
    );
    if (!overlap) {
      kept.push(detection);
    }
  }

  return kept;
}

/**
 * Filter detections below a confidence threshold.
 */
export function filterByConfidence<T extends { confidence: number }>(
  detections: T[],
  minConfidence = 0.4,
): T[] {
  return detections.filter((d) => d.confidence >= minConfidence);
}

/**
 * Deduplicate detections by label within the same frame (keep highest confidence per label).
 */
export function deduplicateByLabel<T extends { label: string; confidence: number }>(
  detections: T[],
): T[] {
  const best = new Map<string, T>();
  for (const d of detections) {
    const key = d.label.toLowerCase();
    if (!best.has(key) || d.confidence > best.get(key)!.confidence) {
      best.set(key, d);
    }
  }
  return Array.from(best.values());
}
