import { create } from 'zustand';
import type { BoundingBox } from '@kitchenscan/shared';
import { aggregateToQuantity, inferUnit } from '../utils/unitInference';
import type { RawDetection } from '../utils/unitInference';

// ─── Types ───────────────────────────────────────────────

export type ScanStatus = 'idle' | 'processing' | 'detected' | 'empty' | 'error';

export interface ScannedItem {
  id: string;
  label: string;
  bestConfidence: number;
  detectionCount: number;
  firstSeen: number;
  lastSeen: number;
  bbox: BoundingBox;
  confirmed: boolean;
  quantity: number;
  unit: string;
  /** true = quantity was estimated from bbox count; false = user manually set it */
  isEstimated: boolean;
}

interface ScanState {
  items: ScannedItem[];
  isScanning: boolean;
  scanStatus: ScanStatus;
  lastError: string | null;
  scanAttempts: number;
  sessionStartedAt: number | null;

  /**
   * Add a batch of raw detections. Detections are aggregated by label
   * (non-overlapping bboxes of the same label → quantity > 1).
   */
  addDetections: (detections: RawDetection[]) => void;
  /** Convenience wrapper for a single detection (used by legacy callers). */
  addDetection: (detection: RawDetection) => void;
  recordCapture: (count?: number) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<ScannedItem>) => void;
  confirmAll: () => void;
  setScanning: (active: boolean) => void;
  setScanStatus: (status: ScanStatus) => void;
  setLastError: (error: string | null) => void;
  reset: () => void;
}

// ─── IoU (Intersection over Union) ───────────────────────

function computeIoU(a: BoundingBox, b: BoundingBox): number {
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

// ─── Thresholds ───────────────────────────────────────────

const CONFIRM_THRESHOLD = 3;
const IOU_THRESHOLD = 0.4;
const STALE_MS = 5000;

// ─── Store ────────────────────────────────────────────────

export const useScanStore = create<ScanState>((set) => ({
  items: [],
  isScanning: false,
  scanStatus: 'idle',
  lastError: null,
  scanAttempts: 0,
  sessionStartedAt: null,

  addDetections: (rawDetections) => {
    set((state) => {
      const now = Date.now();
      const items = [...state.items];

      // Aggregate: count distinct bboxes per label as quantity
      const aggregated = aggregateToQuantity(rawDetections);

      for (const agg of aggregated) {
        // Look for an existing item with the same label (any position)
        const matchIdx = items.findIndex(
          (item) => item.label.toLowerCase() === agg.label.toLowerCase(),
        );

        if (matchIdx >= 0) {
          const item = { ...items[matchIdx] };
          item.detectionCount += 1;
          item.lastSeen = now;
          item.bbox = agg.bbox;
          if (agg.confidence > item.bestConfidence) item.bestConfidence = agg.confidence;
          // Update quantity to the highest seen across scan attempts
          if (agg.quantity > item.quantity) {
            item.quantity = agg.quantity;
            item.unit = agg.unit;
            item.isEstimated = true;
          }
          if (item.detectionCount >= CONFIRM_THRESHOLD && !item.confirmed) {
            item.confirmed = true;
          }
          items[matchIdx] = item;
        } else {
          items.push({
            id: `scan-${now}-${Math.random().toString(36).slice(2, 8)}`,
            label: agg.label,
            bestConfidence: agg.confidence,
            detectionCount: 1,
            firstSeen: now,
            lastSeen: now,
            bbox: agg.bbox,
            confirmed: false,
            quantity: agg.quantity,
            unit: agg.unit,
            isEstimated: agg.quantity > 1, // single items aren't labelled as estimates
          });
        }
      }

      const filtered = items.filter(
        (item) => item.confirmed || now - item.lastSeen < STALE_MS,
      );

      return { items: filtered };
    });
  },

  addDetection: (detection) => {
    // Delegates to addDetections for a single raw detection
    set((state) => {
      const store = useScanStore.getState();
      store.addDetections([detection]);
      return state; // addDetections calls set internally; no-op here
    });
  },

  recordCapture: (count = 1) =>
    set((s) => ({
      scanAttempts: s.scanAttempts + count,
      sessionStartedAt: s.sessionStartedAt ?? Date.now(),
    })),

  removeItem: (id) =>
    set((s) => ({ items: s.items.filter((i) => i.id !== id) })),

  updateItem: (id, updates) =>
    set((s) => ({
      items: s.items.map((i) =>
        i.id === id
          ? { ...i, ...updates, isEstimated: 'quantity' in updates ? false : i.isEstimated }
          : i,
      ),
    })),

  confirmAll: () =>
    set((s) => ({ items: s.items.map((i) => ({ ...i, confirmed: true })) })),

  setScanning: (active) => set({ isScanning: active }),

  setScanStatus: (scanStatus) =>
    set((s) => ({
      scanStatus,
      scanAttempts: scanStatus === 'processing' ? s.scanAttempts + 1 : s.scanAttempts,
      sessionStartedAt: scanStatus === 'processing' ? s.sessionStartedAt ?? Date.now() : s.sessionStartedAt,
    })),

  setLastError: (lastError) => set({ lastError }),

  reset: () =>
    set({
      items: [],
      isScanning: false,
      scanStatus: 'idle',
      lastError: null,
      scanAttempts: 0,
      sessionStartedAt: null,
    }),
}));
