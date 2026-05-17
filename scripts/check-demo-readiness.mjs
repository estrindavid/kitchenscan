import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const env = {
  ...process.env,
  ...readDotEnv(path.join(root, '.env')),
};

const checks = [
  ['ROCKETRIDE_URI', Boolean(env.ROCKETRIDE_URI)],
  ['ROCKETRIDE_APIKEY or local RocketRide', Boolean(env.ROCKETRIDE_APIKEY) || isLocalRocketRideUri(env.ROCKETRIDE_URI)],
  ['ROCKETRIDE_GEMINI_API_KEY', Boolean(env.ROCKETRIDE_GEMINI_API_KEY)],
  ['extract-ingredients.pipe', fs.existsSync(path.join(root, 'pipelines/extract-ingredients.pipe'))],
  ['generate-recipes.pipe', fs.existsSync(path.join(root, 'pipelines/generate-recipes.pipe'))],
];

const geminiGenerate = await checkGeminiGenerate(env.ROCKETRIDE_GEMINI_API_KEY);
checks.push(['Gemini generateContent credits', geminiGenerate.ok]);

let apiReachable = false;
try {
  const response = await fetch('http://127.0.0.1:3001/health');
  apiReachable = response.ok;
} catch {
  apiReachable = false;
}
checks.push(['API health on :3001', apiReachable]);

console.log('\nKitchenScan demo readiness\n');
for (const [name, ok] of checks) {
  console.log(`${ok ? 'OK  ' : 'MISS'} ${name}`);
}

const missing = checks.filter(([, ok]) => !ok).map(([name]) => name);
if (missing.length > 0) {
  console.log('\nNext fixes:');
  for (const item of missing) {
    console.log(`- ${item}`);
  }
  if (!geminiGenerate.ok && geminiGenerate.reason) {
    console.log(`\nGemini detail: ${geminiGenerate.reason}`);
  }
  process.exitCode = 1;
} else {
  console.log('\nReady for the connected demo.');
}

async function checkGeminiGenerate(apiKey) {
  if (!apiKey) return { ok: false, reason: 'ROCKETRIDE_GEMINI_API_KEY is missing.' };

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: 'Return JSON only: {"ok":true}' }],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0,
          },
        }),
      },
    );

    if (response.ok) return { ok: true };

    const body = await response.json().catch(() => ({}));
    const message = body?.error?.message ?? `Gemini returned HTTP ${response.status}.`;
    return { ok: false, reason: message };
  } catch (error) {
    return { ok: false, reason: error instanceof Error ? error.message : 'Gemini request failed.' };
  }
}

function readDotEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const out = {};
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const index = trimmed.indexOf('=');
    if (index < 0) continue;
    out[trimmed.slice(0, index)] = trimmed.slice(index + 1);
  }
  return out;
}

function isLocalRocketRideUri(uri) {
  if (!uri) return false;
  try {
    const parsed = new URL(uri.includes('://') ? uri : `http://${uri}`);
    return ['localhost', '127.0.0.1', '::1'].includes(parsed.hostname);
  } catch {
    return uri.includes('localhost') || uri.includes('127.0.0.1');
  }
}
