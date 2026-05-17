import path from 'node:path';
import type { Detection } from '@kitchenscan/shared';
import { AiServiceUnavailableError, shouldUseDemoAiFallback } from './aiErrors';
import { generateGeminiContent } from './googleGemini';
import { isLocalRocketRideUri } from './systemStatus';

export interface IngredientCandidate {
  name?: string;
  label?: string;
  category?: string;
  confidence?: number;
  boundingBox?: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
  };
}

export interface ImageSize {
  width: number;
  height: number;
}

export interface ExtractIngredientsInput {
  image: string;
  imageSize: ImageSize;
  minConfidence: number;
  maxDetections: number;
}

export interface ExtractionPipelineMetadata {
  provider: string;
  name: string;
  usedFallback: boolean;
}

export interface ExtractIngredientsResult {
  detections: Detection[];
  modelVersion: string;
  pipeline: ExtractionPipelineMetadata;
}

interface RocketRideClientLike {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  use(input: { filepath: string }): Promise<{ token?: string }>;
  send(token: string, payload: unknown): Promise<unknown>;
}

const PIPELINE_NAME = 'extract-ingredients.pipe';
const DEFAULT_MODEL_VERSION = 'gemini-2.5-flash-via-rocketride';
const GEMINI_MODEL = 'gemini-2.5-flash';

const fallbackCandidates: IngredientCandidate[] = [
  { name: 'Tomatoes', category: 'produce', confidence: 0.87, boundingBox: { x: 0.1, y: 0.2, width: 0.28, height: 0.24 } },
  { name: 'Eggs', category: 'protein', confidence: 0.82, boundingBox: { x: 0.48, y: 0.18, width: 0.2, height: 0.18 } },
  { name: 'Milk', category: 'dairy', confidence: 0.78, boundingBox: { x: 0.7, y: 0.32, width: 0.18, height: 0.34 } },
];

export function normalizeIngredientCandidates(
  candidates: IngredientCandidate[],
  imageSize: ImageSize,
): Detection[] {
  return candidates.flatMap((candidate, index) => {
    const label = (candidate.name ?? candidate.label ?? '').trim();
    if (!label) return [];

    const box = candidate.boundingBox ?? defaultRelativeBox(index);

    return [{
      label,
      category: candidate.category?.trim() || 'other',
      confidence: clamp01(candidate.confidence ?? 0.65),
      boundingBox: {
        x: scaleCoordinate(box.x ?? 0.1, imageSize.width),
        y: scaleCoordinate(box.y ?? 0.1, imageSize.height),
        width: Math.max(1, scaleCoordinate(box.width ?? 0.2, imageSize.width)),
        height: Math.max(1, scaleCoordinate(box.height ?? 0.2, imageSize.height)),
      },
    }];
  });
}

export async function extractIngredientsFromImage(
  input: ExtractIngredientsInput,
): Promise<ExtractIngredientsResult> {
  const pipelinePath = getPipelinePath();
  const rocketRideResult = await executeRocketRidePipeline(pipelinePath, input);

  if (rocketRideResult.length > 0) {
    return {
      detections: normalizeIngredientCandidates(rocketRideResult, input.imageSize)
        .filter((detection) => detection.confidence >= input.minConfidence)
        .slice(0, input.maxDetections),
      modelVersion: DEFAULT_MODEL_VERSION,
      pipeline: {
        provider: 'RocketRide + Gemini',
        name: PIPELINE_NAME,
        usedFallback: false,
      },
    };
  }

  const geminiResult = await executeGeminiVision(input);
  if (geminiResult.length > 0) {
    return {
      detections: normalizeIngredientCandidates(geminiResult, input.imageSize)
        .filter((detection) => detection.confidence >= input.minConfidence)
        .slice(0, input.maxDetections),
      modelVersion: `${GEMINI_MODEL}:direct`,
      pipeline: {
        provider: 'Gemini direct fallback',
        name: PIPELINE_NAME,
        usedFallback: true,
      },
    };
  }

  if (shouldUseDemoAiFallback()) {
    return {
      detections: normalizeIngredientCandidates(fallbackCandidates, input.imageSize)
        .filter((detection) => detection.confidence >= input.minConfidence)
        .slice(0, input.maxDetections),
      modelVersion: `${DEFAULT_MODEL_VERSION}:demo-fallback`,
      pipeline: {
        provider: 'RocketRide + Gemini',
        name: PIPELINE_NAME,
        usedFallback: true,
      },
    };
  }

  return {
    detections: [],
    modelVersion: `${GEMINI_MODEL}:direct`,
    pipeline: {
      provider: 'Gemini direct fallback',
      name: PIPELINE_NAME,
      usedFallback: true,
    },
  };
}

async function executeGeminiVision(input: ExtractIngredientsInput): Promise<IngredientCandidate[]> {
  if (process.env.NODE_ENV === 'test') return [];

  try {
    const body = await generateGeminiContent({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: [
                'Identify visible grocery or pantry ingredients in this image.',
                'Return only JSON with this exact shape:',
                '{"ingredients":[{"name":"tomato","category":"produce","confidence":0.86,"boundingBox":{"x":0.1,"y":0.2,"width":0.25,"height":0.2}}]}',
                'Use relative bounding boxes from 0 to 1 when possible.',
                'Only include visible food, ingredients, packaged food, or pantry items.',
              ].join('\n'),
            },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: input.image,
              },
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    }, 'Ingredient detection');

    if (!body) return [];
    return parseGeminiCandidates(body);
  } catch (error) {
    if (error instanceof AiServiceUnavailableError) throw error;
    throw new AiServiceUnavailableError('Ingredient detection could not reach Gemini. Check network and API configuration.');
  }
}

function getPipelinePath() {
  return process.env.KITCHENSCAN_EXTRACT_PIPELINE
    ?? path.resolve(process.cwd(), '../../pipelines', PIPELINE_NAME);
}

async function executeRocketRidePipeline(
  filepath: string,
  input: ExtractIngredientsInput,
): Promise<IngredientCandidate[]> {
  if (!canAttemptRocketRide() || process.env.NODE_ENV === 'test') {
    return [];
  }

  let client: RocketRideClientLike | null = null;

  try {
    const module = await import('rocketride') as {
      RocketRideClient: new () => RocketRideClientLike;
    };
    client = new module.RocketRideClient();

    await client.connect();
    const pipeline = await client.use({ filepath });
    if (!pipeline.token) return [];

    const response = await client.send(pipeline.token, {
      image: input.image,
      width: input.imageSize.width,
      height: input.imageSize.height,
      output: 'json',
    });

    return parseRocketRideCandidates(response);
  } catch {
    return [];
  } finally {
    if (client) {
      await client.disconnect().catch(() => undefined);
    }
  }
}

function canAttemptRocketRide() {
  if (!process.env.ROCKETRIDE_URI) return false;
  return Boolean(process.env.ROCKETRIDE_APIKEY) || isLocalRocketRideUri(process.env.ROCKETRIDE_URI);
}

function parseRocketRideCandidates(response: unknown): IngredientCandidate[] {
  const parsed = parseJsonLike(response);
  if (Array.isArray(parsed)) return parsed as IngredientCandidate[];

  if (isRecord(parsed)) {
    const candidates = parsed.ingredients ?? parsed.items ?? parsed.detections ?? parsed.candidates;
    if (Array.isArray(candidates)) return candidates as IngredientCandidate[];

    const text = parsed.text ?? parsed.answers;
    if (typeof text === 'string') return parseRocketRideCandidates(text);
    if (Array.isArray(text) && text.length > 0) return parseRocketRideCandidates(text[0]);
  }

  return [];
}

function parseGeminiCandidates(response: unknown): IngredientCandidate[] {
  if (!isRecord(response)) return [];
  const candidates = response.candidates;
  if (!Array.isArray(candidates)) return [];
  const text = candidates
    .flatMap((candidate) => {
      if (!isRecord(candidate.content)) return [];
      const parts = candidate.content.parts;
      if (!Array.isArray(parts)) return [];
      return parts.flatMap((part) => isRecord(part) && typeof part.text === 'string' ? [part.text] : []);
    })
    .join('\n');

  return parseRocketRideCandidates(text);
}

function parseJsonLike(value: unknown): unknown {
  if (typeof value !== 'string') return value;

  const trimmed = value.trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function clamp01(value: number) {
  if (Number.isNaN(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function scaleCoordinate(value: number, size: number) {
  return Math.round(value <= 1 ? value * size : value);
}

function defaultRelativeBox(index: number) {
  const row = Math.floor(index / 3) % 2;

  return {
    x: 0.1,
    y: 0.1 + row * 0.28,
    width: 0.2,
    height: 0.2,
  };
}
