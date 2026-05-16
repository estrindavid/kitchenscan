import type { BoundingBox } from '@kitchenscan/shared';

// ─── Unit lookup by label ─────────────────────────────────

const BUNCH_UNITS: Record<string, string> = {
  asparagus: 'bunch', celery: 'bunch', spinach: 'bunch',
  kale: 'bunch', chard: 'bunch', arugula: 'bunch',
  herbs: 'bunch', cilantro: 'bunch', parsley: 'bunch', basil: 'bunch',
  green_onion: 'bunch', scallion: 'bunch', leek: 'bunch',
};

const HEAD_UNITS: Record<string, string> = {
  broccoli: 'head', cauliflower: 'head', lettuce: 'head',
  cabbage: 'head', bok_choy: 'head',
};

const EAR_UNITS: Record<string, string> = {
  corn: 'ear',
};

const BULB_UNITS: Record<string, string> = {
  garlic: 'bulb', fennel: 'bulb',
};

const FILLET_UNITS: Record<string, string> = {
  salmon: 'fillet', cod: 'fillet', tilapia: 'fillet',
  halibut: 'fillet', trout: 'fillet',
};

/** Labels where counting bounding boxes gives a weight-based unit */
const LB_LABELS = new Set([
  'beef', 'ground_beef', 'pork', 'lamb', 'ground_turkey',
  'shrimp', 'crab', 'lobster',
]);

/**
 * Infer the most appropriate unit for a detected food label.
 * Returns 'piece' for discrete countable items by default.
 */
export function inferUnit(label: string): string {
  const key = label.toLowerCase().replace(/\s+/g, '_');
  return (
    BUNCH_UNITS[key] ??
    HEAD_UNITS[key] ??
    EAR_UNITS[key] ??
    BULB_UNITS[key] ??
    FILLET_UNITS[key] ??
    (LB_LABELS.has(key) ? 'lb' : 'piece')
  );
}

// ─── Aggregation ──────────────────────────────────────────

export interface RawDetection {
  label: string;
  confidence: number;
  boundingBox: BoundingBox;
}

export interface AggregatedDetection {
  label: string;
  quantity: number;
  unit: string;
  confidence: number;
  bbox: BoundingBox;
}

/**
 * Group raw detections by label and count distinct bounding boxes as quantity.
 * Non-overlapping boxes of the same label = multiple items (e.g. 4 apples).
 */
export function aggregateToQuantity(
  detections: RawDetection[],
): AggregatedDetection[] {
  const grouped = new Map<string, RawDetection[]>();

  for (const d of detections) {
    const key = d.label.toLowerCase();
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(d);
  }

  return Array.from(grouped.entries()).map(([label, group]) => {
    const best = group.reduce((a, b) => (b.confidence > a.confidence ? b : a));
    return {
      label,
      quantity: group.length,
      unit: inferUnit(label),
      confidence: best.confidence,
      bbox: best.boundingBox,
    };
  });
}
