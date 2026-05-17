import { describe, expect, it } from 'vitest';
import { createSystemStatus } from './systemStatus';

describe('system status', () => {
  it('reports configured services without exposing secret values', () => {
    const status = createSystemStatus({
      env: {
        ROCKETRIDE_URI: 'http://localhost:5565',
        ROCKETRIDE_APIKEY: 'secret',
        ROCKETRIDE_GEMINI_API_KEY: 'gemini-secret',
        GOOGLE_CLOUD_PROJECT: 'kitchenscan-demo',
      },
      pipelines: [
        { name: 'extract-ingredients.pipe', exists: true },
        { name: 'generate-recipes.pipe', exists: true },
      ],
      apiBaseUrl: 'http://localhost:3001',
    });

    expect(status.ok).toBe(true);
    expect(status.rocketride.configured).toBe(true);
    expect(status.google.configured).toBe(true);
    expect(status.pipelineFilesReady).toBe(true);
    expect(JSON.stringify(status)).not.toContain('secret');
  });

  it('treats a Gemini key as enough Google configuration for the hackathon requirement', () => {
    const status = createSystemStatus({
      env: {
        ROCKETRIDE_URI: 'http://localhost:5565',
        ROCKETRIDE_GEMINI_API_KEY: 'gemini-secret',
      },
      pipelines: [
        { name: 'extract-ingredients.pipe', exists: true },
        { name: 'generate-recipes.pipe', exists: true },
      ],
      apiBaseUrl: 'http://localhost:3001',
    });

    expect(status.google.configured).toBe(true);
    expect(status.google.projectConfigured).toBe(false);
    expect(status.rocketride.configured).toBe(true);
    expect(status.rocketride.apiKeyRequired).toBe(false);
    expect(status.missing).not.toContain('GOOGLE_CLOUD_PROJECT');
    expect(status.missing).not.toContain('ROCKETRIDE_APIKEY');
    expect(status.ok).toBe(true);
  });

  it('requires a RocketRide API key for non-local RocketRide URIs', () => {
    const status = createSystemStatus({
      env: {
        ROCKETRIDE_URI: 'https://cloud.rocketride.ai',
        ROCKETRIDE_GEMINI_API_KEY: 'gemini-secret',
      },
      pipelines: [
        { name: 'extract-ingredients.pipe', exists: true },
        { name: 'generate-recipes.pipe', exists: true },
      ],
      apiBaseUrl: 'http://localhost:3001',
    });

    expect(status.rocketride.configured).toBe(false);
    expect(status.rocketride.apiKeyRequired).toBe(true);
    expect(status.missing).toContain('ROCKETRIDE_APIKEY');
  });

  it('lists missing setup pieces for the demo checklist', () => {
    const status = createSystemStatus({
      env: {},
      pipelines: [{ name: 'extract-ingredients.pipe', exists: false }],
      apiBaseUrl: 'http://localhost:3001',
    });

    expect(status.ok).toBe(false);
    expect(status.missing).toEqual([
      'ROCKETRIDE_URI',
      'ROCKETRIDE_GEMINI_API_KEY',
      'pipeline:extract-ingredients.pipe',
    ]);
  });
});
