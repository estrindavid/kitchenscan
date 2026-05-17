export interface PipelineStatus {
  name: string;
  exists: boolean;
}

export interface SystemStatusInput {
  env: NodeJS.ProcessEnv | Record<string, string | undefined>;
  pipelines: PipelineStatus[];
  apiBaseUrl: string;
}

export interface SystemStatus {
  ok: boolean;
  api: {
    reachable: true;
    baseUrl: string;
  };
  rocketride: {
    configured: boolean;
    uriConfigured: boolean;
    apiKeyConfigured: boolean;
    apiKeyRequired: boolean;
  };
  google: {
    configured: boolean;
    geminiKeyConfigured: boolean;
    /** Optional when using Gemini API keys directly; useful if demoing Vertex/Google Cloud. */
    projectConfigured: boolean;
  };
  pipelineFilesReady: boolean;
  pipelines: PipelineStatus[];
  missing: string[];
}

export function createSystemStatus(input: SystemStatusInput): SystemStatus {
  const rocketride = {
    uriConfigured: Boolean(input.env.ROCKETRIDE_URI),
    apiKeyConfigured: Boolean(input.env.ROCKETRIDE_APIKEY),
  };
  const apiKeyRequired = rocketride.uriConfigured && !isLocalRocketRideUri(input.env.ROCKETRIDE_URI);
  const google = {
    geminiKeyConfigured: Boolean(input.env.ROCKETRIDE_GEMINI_API_KEY),
    projectConfigured: Boolean(input.env.GOOGLE_CLOUD_PROJECT),
  };
  const pipelineFilesReady = input.pipelines.every((pipeline) => pipeline.exists);
  const missing = [
    ...missingEnv('ROCKETRIDE_URI', rocketride.uriConfigured),
    ...missingEnv('ROCKETRIDE_APIKEY', !apiKeyRequired || rocketride.apiKeyConfigured),
    ...missingEnv('ROCKETRIDE_GEMINI_API_KEY', google.geminiKeyConfigured),
    ...input.pipelines
      .filter((pipeline) => !pipeline.exists)
      .map((pipeline) => `pipeline:${pipeline.name}`),
  ];

  return {
    ok: missing.length === 0,
    api: {
      reachable: true,
      baseUrl: input.apiBaseUrl,
    },
    rocketride: {
      ...rocketride,
      apiKeyRequired,
      configured: rocketride.uriConfigured && (!apiKeyRequired || rocketride.apiKeyConfigured),
    },
    google: {
      ...google,
      configured: google.geminiKeyConfigured,
    },
    pipelineFilesReady,
    pipelines: input.pipelines,
    missing,
  };
}

function missingEnv(name: string, configured: boolean) {
  return configured ? [] : [name];
}

export function isLocalRocketRideUri(uri?: string) {
  if (!uri) return false;
  try {
    const parsed = new URL(uri.includes('://') ? uri : `http://${uri}`);
    return ['localhost', '127.0.0.1', '::1'].includes(parsed.hostname);
  } catch {
    return uri.includes('localhost') || uri.includes('127.0.0.1');
  }
}
