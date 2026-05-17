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
  };
  google: {
    configured: boolean;
    geminiKeyConfigured: boolean;
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
  const google = {
    geminiKeyConfigured: Boolean(input.env.ROCKETRIDE_GEMINI_API_KEY),
    projectConfigured: Boolean(input.env.GOOGLE_CLOUD_PROJECT),
  };
  const pipelineFilesReady = input.pipelines.every((pipeline) => pipeline.exists);
  const missing = [
    ...missingEnv('ROCKETRIDE_URI', rocketride.uriConfigured),
    ...missingEnv('ROCKETRIDE_APIKEY', rocketride.apiKeyConfigured),
    ...missingEnv('ROCKETRIDE_GEMINI_API_KEY', google.geminiKeyConfigured),
    ...missingEnv('GOOGLE_CLOUD_PROJECT', google.projectConfigured),
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
      configured: rocketride.uriConfigured && rocketride.apiKeyConfigured,
    },
    google: {
      ...google,
      configured: google.geminiKeyConfigured && google.projectConfigured,
    },
    pipelineFilesReady,
    pipelines: input.pipelines,
    missing,
  };
}

function missingEnv(name: string, configured: boolean) {
  return configured ? [] : [name];
}
