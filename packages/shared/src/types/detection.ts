export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Detection {
  label: string;
  confidence: number;
  boundingBox: BoundingBox;
  category?: string;
}

export interface DetectionResult {
  detections: Detection[];
  imageWidth: number;
  imageHeight: number;
  inferenceTimeMs: number;
  modelVersion: string;
  source: 'cloud' | 'on_device';
}
