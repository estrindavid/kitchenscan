import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const mobileRoot = path.join(root, 'apps/mobile');
const mobilePackage = JSON.parse(
  fs.readFileSync(path.join(mobileRoot, 'package.json'), 'utf8'),
);

const dependencies = {
  'react-native-svg': Boolean(mobilePackage.dependencies?.['react-native-svg']),
  'expo-linear-gradient': Boolean(mobilePackage.dependencies?.['expo-linear-gradient']),
  'react-native-reanimated': Boolean(mobilePackage.dependencies?.['react-native-reanimated']),
};

const files = [
  'components/brand/BrandHeader.tsx',
  'components/brand/BrandPanel.tsx',
  'components/brand/FoodIcon.tsx',
  'components/brand/HeroScenes.tsx',
  'components/brand/MemphisBackground.tsx',
  'components/brand/motion.ts',
  'app/onboarding/welcome.tsx',
  'app/(tabs)/pantry.tsx',
  'app/(tabs)/recipes.tsx',
  'app/(tabs)/scan.tsx',
  'app/(tabs)/profile.tsx',
  'app/recipe/[id].tsx',
  'app/cook/[id].tsx',
];

const sourceExpectations = [
  ['welcome intro carousel', 'app/onboarding/welcome.tsx', 'SLIDES'],
  ['reduced motion wrapper', 'components/brand/motion.ts', 'useReducedMotion'],
  ['memphis background', 'components/brand/MemphisBackground.tsx', 'preserveAspectRatio'],
  ['recipe match badge', 'components/recipes/RecipeCard.tsx', 'matchBadge'],
  ['cook completion state', 'app/cook/[id].tsx', 'completionContainer'],
  ['demo board header', 'app/(tabs)/profile.tsx', 'Demo board'],
];

const checks = [
  ...Object.entries(dependencies).map(([name, ok]) => [`dependency: ${name}`, ok]),
  ...files.map((file) => [`file: ${file}`, fs.existsSync(path.join(mobileRoot, file))]),
  ...sourceExpectations.map(([label, file, needle]) => [
    label,
    includes(path.join(mobileRoot, file), needle),
  ]),
];

console.log('\nKitchenScan mobile redesign readiness\n');
for (const [name, ok] of checks) {
  console.log(`${ok ? 'OK  ' : 'MISS'} ${name}`);
}

const missing = checks.filter(([, ok]) => !ok).map(([name]) => name);
if (missing.length > 0) {
  console.log('\nFix before demo:');
  for (const item of missing) {
    console.log(`- ${item}`);
  }
  process.exitCode = 1;
} else {
  console.log('\nReady for visual demo QA.');
}

function includes(filePath, needle) {
  if (!fs.existsSync(filePath)) return false;
  return fs.readFileSync(filePath, 'utf8').includes(needle);
}
