/**
 * Image preprocessing utilities for cloud vision requests.
 * These run on the JS thread after frame capture.
 */

export interface PreprocessedFrame {
  base64: string;
  width: number;
  height: number;
  /** Original frame dimensions before resize */
  originalWidth: number;
  originalHeight: number;
  /** Scale factors to map detections back to screen coords */
  scaleX: number;
  scaleY: number;
}

/**
 * Target upload size for Gemini/RocketRide ingredient extraction.
 * We resize on the server side; client just sends the raw frame.
 */
export const INFERENCE_SIZE = 640;

/**
 * Convert a data URI to a base64 string (strips the header).
 */
export function dataUriToBase64(dataUri: string): string {
  const comma = dataUri.indexOf(',');
  return comma >= 0 ? dataUri.slice(comma + 1) : dataUri;
}

/**
 * Resize an image to fit within maxSize × maxSize while maintaining aspect ratio.
 * Returns new dimensions and scale factors.
 */
export function computeResizeDimensions(
  width: number,
  height: number,
  maxSize: number = INFERENCE_SIZE,
): { newWidth: number; newHeight: number; scaleX: number; scaleY: number } {
  const scale = Math.min(maxSize / width, maxSize / height);
  const newWidth = Math.round(width * scale);
  const newHeight = Math.round(height * scale);
  return {
    newWidth,
    newHeight,
    scaleX: width / newWidth,
    scaleY: height / newHeight,
  };
}

/**
 * Resize a captured image using a canvas element (web/Expo web only).
 * On native, the server handles resizing.
 */
export async function resizeImageForInference(
  sourceBase64: string,
  originalWidth: number,
  originalHeight: number,
): Promise<PreprocessedFrame> {
  const { newWidth, newHeight, scaleX, scaleY } = computeResizeDimensions(
    originalWidth,
    originalHeight,
  );

  // On native, skip client-side resize — server will handle it
  return {
    base64: sourceBase64,
    width: newWidth,
    height: newHeight,
    originalWidth,
    originalHeight,
    scaleX,
    scaleY,
  };
}

/**
 * Map a bounding box from inference space back to screen/camera space.
 */
export function scaleDetectionToScreen(
  bbox: { x: number; y: number; width: number; height: number },
  scaleX: number,
  scaleY: number,
) {
  return {
    x: bbox.x * scaleX,
    y: bbox.y * scaleY,
    width: bbox.width * scaleX,
    height: bbox.height * scaleY,
  };
}
