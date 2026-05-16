import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';

const requiredEnv = ['ROCKETRIDE_URI', 'ROCKETRIDE_APIKEY', 'ROCKETRIDE_GEMINI_API_KEY'];
const pipelinePath = process.env.KITCHENSCAN_EXTRACT_PIPELINE
  ?? path.resolve(process.cwd(), '../../pipelines/extract-ingredients.pipe');

const missingEnv = requiredEnv.filter((key) => !process.env[key]);
const hasPipeline = fs.existsSync(pipelinePath);

console.log(JSON.stringify({
  ok: missingEnv.length === 0 && hasPipeline,
  missingEnv,
  pipelinePath,
  hasPipeline,
}, null, 2));

if (missingEnv.length > 0 || !hasPipeline) {
  process.exitCode = 1;
}
