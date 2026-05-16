import { api } from './api';
import type { Detection } from '@kitchenscan/shared';

// ─── Response type from /detect ──────────────────────────

interface DetectApiResponse {
  data: {
    detections: Detection[];
    count: number;
    latencyMs: number;
    modelVersion: string;
    source: 'cloud';
    imageSize: { width: number; height: number };
  };
}

// ─── Provider interface ───────────────────────────────────

export interface DetectionProvider {
  name: 'cloud' | 'ondevice' | 'hybrid';
  detect(imageBase64: string, width: number, height: number): Promise<Detection[]>;
  isReady(): boolean;
}

// ─── Cloud provider ───────────────────────────────────────

export class CloudDetectionProvider implements DetectionProvider {
  readonly name = 'cloud' as const;

  isReady() {
    return true;
  }

  async detect(imageBase64: string, _width: number, _height: number): Promise<Detection[]> {
    const { data } = await api.post<DetectApiResponse>('/detect', {
      image: imageBase64,
      confidence: 0.45,
      maxDetections: 20,
    });
    return data.data.detections;
  }
}

// ─── On-device provider (future enhancement) ─────────────

export class OnDeviceDetectionProvider implements DetectionProvider {
  readonly name = 'ondevice' as const;
  private ready = false;

  isReady() {
    return this.ready;
  }

  async detect(_imageBase64: string, _width: number, _height: number): Promise<Detection[]> {
    throw new Error('On-device inference is not part of the current hackathon build.');
  }
}

// ─── Hybrid provider ──────────────────────────────────────

export class HybridDetectionProvider implements DetectionProvider {
  readonly name = 'hybrid' as const;
  private readonly onDevice = new OnDeviceDetectionProvider();
  private readonly cloud = new CloudDetectionProvider();
  private readonly lowConfThreshold = 0.6;
  private consecutiveLow = 0;

  isReady() {
    return this.onDevice.isReady() || this.cloud.isReady();
  }

  async detect(imageBase64: string, width: number, height: number): Promise<Detection[]> {
    if (this.onDevice.isReady()) {
      try {
        const results = await this.onDevice.detect(imageBase64, width, height);
        const avg = results.length > 0
          ? results.reduce((s, r) => s + r.confidence, 0) / results.length
          : 0;

        if (avg < this.lowConfThreshold) {
          this.consecutiveLow++;
          if (this.consecutiveLow >= 3) {
            this.consecutiveLow = 0;
            return this.cloud.detect(imageBase64, width, height);
          }
        } else {
          this.consecutiveLow = 0;
        }
        return results;
      } catch {
        // Fall through to cloud
      }
    }
    return this.cloud.detect(imageBase64, width, height);
  }
}

// ─── Singleton ───────────────────────────────────────────

let _provider: DetectionProvider | null = null;

export function getDetectionProvider(): DetectionProvider {
  if (!_provider) {
    // Default to the cloud workflow for the hackathon build.
    _provider = new CloudDetectionProvider();
  }
  return _provider;
}
