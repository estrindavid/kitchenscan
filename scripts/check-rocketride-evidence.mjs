import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const checks = [
  checkPackageDependency(),
  checkPipeline({
    file: 'pipelines/extract-ingredients.pipe',
    providers: ['webhook', 'image_vision_gemini', 'response_text'],
    profile: 'gemini-2_5-flash',
    envReference: '${ROCKETRIDE_GEMINI_API_KEY}',
  }),
  checkPipeline({
    file: 'pipelines/generate-recipes.pipe',
    providers: ['webhook', 'llm_gemini', 'response_answers'],
    profile: 'gemini-2_5-flash',
    envReference: '${ROCKETRIDE_GEMINI_API_KEY}',
  }),
  checkRuntimeSdkUse('apps/api/src/services/ingredientExtraction.ts', 'extract-ingredients.pipe'),
  checkRuntimeSdkUse('apps/api/src/services/recipeGeneration.ts', 'generate-recipes.pipe'),
];

console.log('\nRocketRide evidence check\n');
for (const check of checks) {
  console.log(`${check.ok ? 'OK  ' : 'MISS'} ${check.name}`);
  if (!check.ok && check.detail) console.log(`     ${check.detail}`);
}

const missing = checks.filter((check) => !check.ok);
if (missing.length > 0) {
  console.log('\nRocketRide evidence is incomplete. Fix the missing items above.');
  process.exitCode = 1;
} else {
  console.log('\nRocketRide evidence is present: SDK dependency, .pipe workflows, and runtime invocation paths.');
}

function checkPackageDependency() {
  const packageJson = readJson('apps/api/package.json');
  const version = packageJson?.dependencies?.rocketride ?? packageJson?.devDependencies?.rocketride;

  return {
    name: 'API depends on rocketride SDK',
    ok: Boolean(version),
    detail: version ? `rocketride ${version}` : 'apps/api/package.json has no rocketride dependency',
  };
}

function checkPipeline({ file, providers, profile, envReference }) {
  const absolutePath = path.join(root, file);
  const pipeline = readJson(file);
  const components = Array.isArray(pipeline?.components) ? pipeline.components : [];
  const componentProviders = components.map((component) => component.provider);
  const hasProviders = providers.every((provider) => componentProviders.includes(provider));
  const serialized = JSON.stringify(pipeline);
  const hasProfile = serialized.includes(profile);
  const hasEnvReference = serialized.includes(envReference);
  const hasProjectId = typeof pipeline?.project_id === 'string' && pipeline.project_id.length > 0;
  const ok = fs.existsSync(absolutePath) && hasProviders && hasProfile && hasEnvReference && hasProjectId;

  return {
    name: `${file} defines ${providers.join(' -> ')}`,
    ok,
    detail: ok
      ? undefined
      : [
          fs.existsSync(absolutePath) ? '' : 'file missing',
          hasProviders ? '' : `providers found: ${componentProviders.join(', ') || 'none'}`,
          hasProfile ? '' : `missing profile ${profile}`,
          hasEnvReference ? '' : `missing ${envReference}`,
          hasProjectId ? '' : 'missing project_id',
        ].filter(Boolean).join('; '),
  };
}

function checkRuntimeSdkUse(file, pipelineName) {
  const source = readText(file);
  const requiredSnippets = [
    "import('rocketride')",
    'new module.RocketRideClient()',
    'client.use({ filepath })',
    'client.send(',
    pipelineName,
  ];
  const missingSnippets = requiredSnippets.filter((snippet) => !source.includes(snippet));

  return {
    name: `${file} invokes RocketRide SDK for ${pipelineName}`,
    ok: missingSnippets.length === 0,
    detail: missingSnippets.length === 0 ? undefined : `missing snippets: ${missingSnippets.join(', ')}`,
  };
}

function readJson(relativePath) {
  try {
    return JSON.parse(readText(relativePath));
  } catch {
    return null;
  }
}

function readText(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}
