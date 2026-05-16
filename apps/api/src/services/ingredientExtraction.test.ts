import { describe, expect, it } from 'vitest';
import { normalizeIngredientCandidates } from './ingredientExtraction';

describe('normalizeIngredientCandidates', () => {
  it('turns Gemini-style ingredient candidates into mobile detections', () => {
    const detections = normalizeIngredientCandidates(
      [
        {
          name: 'Roma tomatoes',
          category: 'produce',
          confidence: 0.91,
          boundingBox: { x: 0.1, y: 0.2, width: 0.25, height: 0.3 },
        },
        {
          name: 'Greek yogurt',
          category: 'dairy',
          confidence: 1.2,
        },
      ],
      { width: 1280, height: 720 },
    );

    expect(detections).toEqual([
      {
        label: 'Roma tomatoes',
        category: 'produce',
        confidence: 0.91,
        boundingBox: { x: 128, y: 144, width: 320, height: 216 },
      },
      {
        label: 'Greek yogurt',
        category: 'dairy',
        confidence: 1,
        boundingBox: { x: 128, y: 72, width: 256, height: 144 },
      },
    ]);
  });

  it('drops empty labels and clamps invalid confidence scores', () => {
    const detections = normalizeIngredientCandidates(
      [
        { name: '   ', confidence: 0.8 },
        { name: 'Rice', category: 'grains', confidence: -4 },
      ],
      { width: 100, height: 100 },
    );

    expect(detections).toHaveLength(1);
    expect(detections[0]?.label).toBe('Rice');
    expect(detections[0]?.confidence).toBe(0);
  });
});
