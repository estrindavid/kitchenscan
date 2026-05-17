import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { AiServiceUnavailableError } from './aiErrors';

const execFileAsync = promisify(execFile);
const DEFAULT_MODEL = 'gemini-2.5-flash';
const DEFAULT_LOCATION = 'us-central1';

interface AdcFile {
  client_id?: string;
  client_secret?: string;
  refresh_token?: string;
  quota_project_id?: string;
}

interface GenerateContentInput {
  contents: unknown[];
  generationConfig?: Record<string, unknown>;
}

type AuthMode = 'vertex-adc' | 'developer-api-key';

export async function generateGeminiContent(
  input: GenerateContentInput,
  errorPrefix: string,
): Promise<unknown> {
  const authMode = getGoogleAuthMode();
  if (!authMode) return null;

  const response = authMode === 'vertex-adc'
    ? await callVertexGemini(input)
    : await callDeveloperGemini(input);

  if (!response.ok) {
    throw new AiServiceUnavailableError(await readGeminiError(response, errorPrefix, authMode));
  }

  return response.json() as Promise<unknown>;
}

export function hasGeminiAuthConfigured(env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env) {
  return Boolean(getGoogleCloudProject(env)) || Boolean(env.ROCKETRIDE_GEMINI_API_KEY);
}

export function getGoogleCloudProject(env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env) {
  return env.GOOGLE_CLOUD_PROJECT ?? env.GCLOUD_PROJECT ?? env.GCP_PROJECT ?? readAdcFile(env)?.quota_project_id;
}

function getGoogleAuthMode(): AuthMode | null {
  if (getGoogleCloudProject() && canUseAdc()) return 'vertex-adc';
  if (process.env.ROCKETRIDE_GEMINI_API_KEY) return 'developer-api-key';
  return null;
}

function canUseAdc(env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env) {
  return Boolean(env.GOOGLE_APPLICATION_CREDENTIALS || readAdcFile(env));
}

async function callVertexGemini(input: GenerateContentInput) {
  const project = getGoogleCloudProject();
  if (!project) {
    throw new AiServiceUnavailableError('Vertex AI Gemini needs GOOGLE_CLOUD_PROJECT or an ADC quota project.');
  }

  const token = await getAdcAccessToken();
  const location = process.env.GOOGLE_CLOUD_LOCATION ?? process.env.VERTEX_AI_LOCATION ?? DEFAULT_LOCATION;
  const model = process.env.VERTEX_GEMINI_MODEL ?? process.env.GEMINI_MODEL ?? DEFAULT_MODEL;
  const modelPath = `projects/${project}/locations/${location}/publishers/google/models/${model}`;

  return fetch(`https://aiplatform.googleapis.com/v1/${modelPath}:generateContent`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });
}

async function callDeveloperGemini(input: GenerateContentInput) {
  const apiKey = process.env.ROCKETRIDE_GEMINI_API_KEY;
  if (!apiKey) throw new AiServiceUnavailableError('ROCKETRIDE_GEMINI_API_KEY is missing.');

  const model = process.env.GEMINI_MODEL ?? DEFAULT_MODEL;
  return fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    },
  );
}

async function getAdcAccessToken() {
  for (const gcloudPath of getGcloudCandidates()) {
    try {
      const { stdout } = await execFileAsync(gcloudPath, ['auth', 'application-default', 'print-access-token'], {
        timeout: 10000,
        env: getGcloudEnv(),
      });
      const token = stdout.trim();
      if (token) return token;
    } catch {
      // Try the next gcloud path, then fall back to the local ADC file below.
    }
  }

  const adc = readAdcFile();
  if (!adc?.client_id || !adc.client_secret || !adc.refresh_token) {
    throw new AiServiceUnavailableError('ADC is not available. Run the ADC setup command, then restart the API.');
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: adc.client_id,
      client_secret: adc.client_secret,
      refresh_token: adc.refresh_token,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    throw new AiServiceUnavailableError(await readGeminiError(response, 'ADC token refresh', 'vertex-adc'));
  }

  const body = await response.json() as { access_token?: string };
  if (!body.access_token) {
    throw new AiServiceUnavailableError('ADC token refresh did not return an access token.');
  }
  return body.access_token;
}

function getGcloudCandidates() {
  return [
    process.env.GCLOUD_BIN,
    'gcloud',
    path.join(os.homedir(), 'google-cloud-sdk', 'bin', 'gcloud'),
  ].filter(Boolean) as string[];
}

function getGcloudEnv() {
  return {
    ...process.env,
    CLOUDSDK_PYTHON: process.env.CLOUDSDK_PYTHON ?? '/opt/homebrew/bin/python3.14',
  };
}

function readAdcFile(env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env): AdcFile | null {
  const adcPath = env.GOOGLE_APPLICATION_CREDENTIALS
    ?? path.join(os.homedir(), '.config', 'gcloud', 'application_default_credentials.json');
  try {
    return JSON.parse(fs.readFileSync(adcPath, 'utf8')) as AdcFile;
  } catch {
    return null;
  }
}

async function readGeminiError(response: Response, prefix: string, authMode: AuthMode) {
  try {
    const body = await response.json() as { error?: { status?: string; message?: string } };
    const status = body.error?.status;
    const message = body.error?.message;
    if (status === 'RESOURCE_EXHAUSTED') {
      return authMode === 'vertex-adc'
        ? `${prefix} is blocked because Vertex AI quota or billing is unavailable for this Google Cloud project.`
        : `${prefix} is blocked because Gemini API credits are depleted. Use Vertex ADC or a different valid Gemini key.`;
    }
    if (status === 'PERMISSION_DENIED') {
      return `${prefix} is blocked by Google Cloud permissions. Enable Vertex AI API and grant Vertex AI User access to the ADC account.`;
    }
    if (message) return `${prefix} failed: ${message}`;
  } catch {
    // Fall through to a generic sanitized message.
  }
  return `${prefix} failed with Gemini status ${response.status}.`;
}
