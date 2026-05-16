import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';

const requiredEnv = ['ROCKETRIDE_URI', 'ROCKETRIDE_APIKEY', 'ROCKETRIDE_GEMINI_API_KEY'];
const pipelinePaths = [
  process.env.KITCHENSCAN_EXTRACT_PIPELINE
    ?? path.resolve(process.cwd(), '../../pipelines/extract-ingredients.pipe'),
  process.env.KITCHENSCAN_RECIPE_PIPELINE
    ?? path.resolve(process.cwd(), '../../pipelines/generate-recipes.pipe'),
];

const missingEnv = requiredEnv.filter((key) => !process.env[key]);
const pipelines = pipelinePaths.map((pipelinePath) => ({
  path: pipelinePath,
  exists: fs.existsSync(pipelinePath),
}));
const hasPipelines = pipelines.every((pipeline) => pipeline.exists);

console.log(JSON.stringify({
  ok: missingEnv.length === 0 && hasPipelines,
  missingEnv,
  pipelines,
}, null, 2));

if (missingEnv.length > 0 || !hasPipelines) {
  process.exitCode = 1;
}
