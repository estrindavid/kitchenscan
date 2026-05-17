import crypto from 'node:crypto';
import path from 'node:path';
import type { Ingredient, Recipe, RecipeStep, SkillLevel } from '@kitchenscan/shared';
import { AiServiceUnavailableError, shouldUseDemoAiFallback } from './aiErrors';
import { generateGeminiContent } from './googleGemini';
import { isLocalRocketRideUri } from './systemStatus';

export interface GeneratedIngredient {
  name?: string;
  canonicalName?: string;
  displayText?: string;
  quantity?: number;
  unit?: string;
  category?: string;
  optional?: boolean;
  isOptional?: boolean;
  garnish?: boolean;
  isGarnish?: boolean;
  matched?: boolean;
}

export interface GeneratedRecipe {
  title?: string;
  description?: string;
  servings?: number;
  difficulty?: string;
  cuisineType?: string;
  mealType?: string;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  totalTimeMinutes?: number;
  dietaryTags?: string[];
  allergenWarnings?: string[];
  ingredients?: GeneratedIngredient[];
  steps?: string[] | Array<{ instruction?: string; durationMinutes?: number; timerLabel?: string }>;
}

export interface MissingIngredient {
  name: string;
  isOptional: boolean;
  substitute?: { name: string; notes: string; matchScore: number };
}

export interface RecipeSearchResult extends Omit<Recipe, 'source' | 'steps' | 'ingredients' | 'popularity' | 'createdAt'> {
  matchScore: number;
  matchedIngredients: string[];
  missingIngredients: MissingIngredient[];
  totalIngredients: number;
  substituteCount: number;
}

export interface RecipeDetail extends Recipe {
  ingredients: Ingredient[];
  matchScore: number;
  matchedIngredients: string[];
  missingIngredients: MissingIngredient[];
  totalIngredients: number;
  substituteCount: number;
  pipeline: RecipePipelineMetadata;
}

export interface RecipePipelineMetadata {
  provider: string;
  name: string;
  usedFallback: boolean;
}

export interface GenerateRecipesInput {
  ingredients: string[];
  dietary?: string[];
  maxCookTime?: number;
  cuisineType?: string;
  difficulty?: string;
  limit: number;
  offset: number;
}

export interface GenerateRecipesResult {
  recipes: RecipeDetail[];
  total: number;
  offset: number;
  limit: number;
  pipeline: RecipePipelineMetadata;
}

interface RocketRideClientLike {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  use(input: { filepath: string }): Promise<{ token?: string }>;
  send(token: string, payload: unknown): Promise<unknown>;
}

const PIPELINE_NAME = 'generate-recipes.pipe';
const GEMINI_MODEL = 'gemini-2.5-flash';
const DEFAULT_ROCKETRIDE_RECIPE_TIMEOUT_MS = 3500;
const DEFAULT_GEMINI_RECIPE_TIMEOUT_MS = 28000;
const DEFAULT_PIPELINE: RecipePipelineMetadata = {
  provider: 'RocketRide + Gemini',
  name: PIPELINE_NAME,
  usedFallback: false,
};

const recipeStore = new Map<string, RecipeDetail>();

export function normalizeGeneratedRecipes(
  generatedRecipes: GeneratedRecipe[],
  pantryIngredients: string[],
  pipeline: RecipePipelineMetadata = DEFAULT_PIPELINE,
): RecipeDetail[] {
  const pantrySet = new Set(pantryIngredients.map(normalizeName));

  return generatedRecipes.flatMap((candidate) => {
    const title = candidate.title?.trim();
    if (!title) return [];

    const recipeId = deterministicId(title, pantryIngredients);
    const ingredients = normalizeIngredients(candidate.ingredients ?? [], recipeId);
    const nonGarnish = ingredients.filter((ingredient) => !ingredient.isGarnish);
    const matched = nonGarnish.filter((ingredient) => pantrySet.has(normalizeName(ingredient.canonicalName)));
    const missing = nonGarnish.filter((ingredient) => !pantrySet.has(normalizeName(ingredient.canonicalName)));
    const totalIngredients = nonGarnish.length || 1;
    const matchScore = Math.round((matched.length / totalIngredients) * 100);
    const steps = normalizeSteps(candidate.steps, title);
    const totalTime = candidate.totalTimeMinutes
      ?? ((candidate.prepTimeMinutes ?? 10) + (candidate.cookTimeMinutes ?? 15));

    return [{
      id: recipeId,
      source: 'ai_generated',
      title,
      description: candidate.description?.trim() || buildDescription(title, pantryIngredients),
      prepTimeMinutes: candidate.prepTimeMinutes ?? Math.max(5, Math.round(totalTime * 0.35)),
      cookTimeMinutes: candidate.cookTimeMinutes ?? Math.max(5, Math.round(totalTime * 0.65)),
      totalTimeMinutes: totalTime,
      servings: positiveInt(candidate.servings, 2),
      difficulty: normalizeDifficulty(candidate.difficulty),
      cuisineType: candidate.cuisineType?.trim(),
      mealType: candidate.mealType?.trim() || 'dinner',
      dietaryTags: candidate.dietaryTags ?? [],
      allergenWarnings: candidate.allergenWarnings ?? [],
      nutritionPerServing: undefined,
      steps,
      ingredients,
      popularity: 0,
      createdAt: new Date(0).toISOString(),
      matchScore,
      matchedIngredients: matched.map((ingredient) => ingredient.canonicalName),
      missingIngredients: missing.map((ingredient) => ({
        name: ingredient.canonicalName,
        isOptional: ingredient.isOptional,
      })),
      totalIngredients,
      substituteCount: 0,
      pipeline,
    } satisfies RecipeDetail];
  }).sort((a, b) => b.matchScore - a.matchScore || (a.totalTimeMinutes ?? 999) - (b.totalTimeMinutes ?? 999));
}

export function buildFallbackRecipes(ingredients: string[]): RecipeDetail[] {
  const pantry = cleanIngredients(ingredients);
  const [first = 'pantry staples', second = 'eggs', third = 'rice'] = pantry;
  const titleBase = toTitleCase(first);

  return normalizeGeneratedRecipes(
    [
      {
        title: `${titleBase} Skillet`,
        description: `A fast one-pan meal built around ${pantry.slice(0, 3).join(', ')}.`,
        servings: 2,
        difficulty: 'beginner',
        cuisineType: 'Weeknight',
        totalTimeMinutes: 20,
        ingredients: [
          { name: first, displayText: `1 cup ${first}`, matched: true },
          { name: second, displayText: `1 cup ${second}`, matched: true },
          { name: 'olive oil', displayText: '1 tbsp olive oil', optional: false },
          { name: 'salt', displayText: 'salt to taste', optional: true },
        ],
        steps: [
          `Prep the ${first} and ${second}.`,
          'Heat oil in a skillet over medium heat.',
          `Cook the ${first} and ${second} until warmed through and lightly browned.`,
          'Season, taste, and serve hot.',
        ],
      },
      {
        title: `${toTitleCase(first)} ${toTitleCase(third)} Bowl`,
        description: 'A flexible bowl that turns scanned pantry items into a complete meal.',
        servings: 2,
        difficulty: 'beginner',
        cuisineType: 'KitchenScan',
        totalTimeMinutes: 25,
        ingredients: [
          { name: first, displayText: `1 cup ${first}`, matched: true },
          { name: third, displayText: `1 cup cooked ${third}`, matched: true },
          { name: 'soy sauce', displayText: '1 tbsp soy sauce', optional: true },
          { name: 'green onions', displayText: '2 green onions', optional: true },
        ],
        steps: [
          `Warm the ${third} and prepare the ${first}.`,
          'Build a bowl with the warm base and pantry toppings.',
          'Finish with sauce or any condiments you have.',
        ],
      },
      {
        title: `Clean-Out-The-Fridge ${titleBase} Soup`,
        description: 'A forgiving soup for using up odds and ends before they go bad.',
        servings: 3,
        difficulty: 'beginner',
        cuisineType: 'Comfort',
        totalTimeMinutes: 35,
        ingredients: [
          { name: first, displayText: `1 cup ${first}`, matched: true },
          { name: second, displayText: `1 cup ${second}`, matched: true },
          { name: 'broth', displayText: '3 cups broth', optional: false },
          { name: 'garlic', displayText: '2 cloves garlic', optional: true },
        ],
        steps: [
          'Saute aromatics if you have them.',
          `Add ${first}, ${second}, and broth.`,
          'Simmer until everything is tender, then season to taste.',
        ],
      },
    ],
    pantry,
    { ...DEFAULT_PIPELINE, usedFallback: true },
  );
}

export async function generateRecipes(input: GenerateRecipesInput): Promise<GenerateRecipesResult> {
  const pantry = cleanIngredients(input.ingredients);
  const pipelinePath = getPipelinePath();
  const rocketRideRecipes = await withFallbackTimeout(
    executeRocketRidePipeline(pipelinePath, input),
    getPositiveIntEnv('ROCKETRIDE_RECIPE_TIMEOUT_MS', DEFAULT_ROCKETRIDE_RECIPE_TIMEOUT_MS),
    [],
  );
  const geminiRecipes = rocketRideRecipes.length > 0 ? [] : await executeGeminiRecipeGeneration(input);
  const generatedRecipes = rocketRideRecipes.length > 0 ? rocketRideRecipes : geminiRecipes;
  const pipeline =
    rocketRideRecipes.length > 0
      ? DEFAULT_PIPELINE
      : geminiRecipes.length > 0
        ? { provider: 'Gemini direct fallback', name: PIPELINE_NAME, usedFallback: true }
        : { ...DEFAULT_PIPELINE, usedFallback: true };
  if (generatedRecipes.length === 0 && !shouldUseDemoAiFallback()) {
    throw new AiServiceUnavailableError(
      'Recipe generation could not reach RocketRide/Gemini. Check the Gemini key, billing credits, and RocketRide connection.',
    );
  }

  const recipes = generatedRecipes.length > 0
    ? normalizeGeneratedRecipes(generatedRecipes, pantry, pipeline)
    : buildFallbackRecipes(pantry);
  const filtered = applyFilters(recipes, input);
  const paginated = filtered.slice(input.offset, input.offset + input.limit);

  for (const recipe of paginated) {
    recipeStore.set(recipe.id, recipe);
  }

  return {
    recipes: paginated,
    total: filtered.length,
    offset: input.offset,
    limit: input.limit,
    pipeline,
  };
}

async function executeGeminiRecipeGeneration(input: GenerateRecipesInput): Promise<GeneratedRecipe[]> {
  if (process.env.NODE_ENV === 'test') return [];

  try {
    const body = await generateGeminiContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: buildRecipePrompt(input) }],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.45,
        maxOutputTokens: 2048,
      },
    }, 'Recipe generation', getPositiveIntEnv('GEMINI_RECIPE_TIMEOUT_MS', DEFAULT_GEMINI_RECIPE_TIMEOUT_MS));

    if (!body) return [];
    return parseGeminiRecipes(body);
  } catch (error) {
    if (error instanceof AiServiceUnavailableError) throw error;
    throw new AiServiceUnavailableError('Recipe generation could not reach Gemini. Check network and API configuration.');
  }
}

export function getRecipeById(id: string): RecipeDetail | undefined {
  return recipeStore.get(id);
}

function normalizeIngredients(ingredients: GeneratedIngredient[], recipeId: string): Ingredient[] {
  return ingredients.flatMap((ingredient, index) => {
    const canonicalName = (ingredient.canonicalName ?? ingredient.name ?? '').trim().toLowerCase();
    if (!canonicalName) return [];

    return [{
      id: `${recipeId}-ingredient-${index + 1}`,
      recipeId,
      canonicalName,
      displayText: ingredient.displayText?.trim() || canonicalName,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
      isOptional: Boolean(ingredient.optional ?? ingredient.isOptional),
      isGarnish: Boolean(ingredient.garnish ?? ingredient.isGarnish),
      category: ingredient.category,
    }];
  });
}

function normalizeSteps(steps: GeneratedRecipe['steps'], title: string): RecipeStep[] {
  if (!steps || steps.length === 0) {
    return [
      { order: 1, instruction: `Gather ingredients for ${title}.` },
      { order: 2, instruction: 'Cook everything until hot and seasoned to taste.' },
    ];
  }

  return steps.flatMap((step, index) => {
    const instruction = typeof step === 'string' ? step.trim() : step.instruction?.trim();
    if (!instruction) return [];
    return [{
      order: index + 1,
      instruction,
      durationMinutes: typeof step === 'string' ? undefined : step.durationMinutes,
      timerLabel: typeof step === 'string' ? undefined : step.timerLabel,
    }];
  });
}

function applyFilters(recipes: RecipeDetail[], input: GenerateRecipesInput) {
  return recipes.filter((recipe) => {
    if (input.difficulty && recipe.difficulty !== normalizeDifficulty(input.difficulty)) return false;
    if (input.cuisineType && recipe.cuisineType?.toLowerCase() !== input.cuisineType.toLowerCase()) return false;
    if (input.maxCookTime && recipe.totalTimeMinutes && recipe.totalTimeMinutes > input.maxCookTime) return false;
    if (input.dietary?.length) {
      const tags = new Set(recipe.dietaryTags.map((tag) => tag.toLowerCase()));
      if (!input.dietary.every((tag) => tags.has(tag.toLowerCase()))) return false;
    }
    return true;
  });
}

function getPipelinePath() {
  return process.env.KITCHENSCAN_RECIPE_PIPELINE
    ?? path.resolve(process.cwd(), '../../pipelines', PIPELINE_NAME);
}

async function executeRocketRidePipeline(
  filepath: string,
  input: GenerateRecipesInput,
): Promise<GeneratedRecipe[]> {
  if (!canAttemptRocketRide() || process.env.NODE_ENV === 'test') {
    return [];
  }

  let client: RocketRideClientLike | null = null;

  try {
    const module = await import('rocketride') as {
      RocketRideClient: new () => RocketRideClientLike;
    };
    client = new module.RocketRideClient();

    await client.connect();
    const pipeline = await client.use({ filepath });
    if (!pipeline.token) return [];

    const response = await client.send(pipeline.token, buildRecipePrompt(input));

    return parseRocketRideRecipes(response);
  } catch {
    return [];
  } finally {
    if (client) {
      await client.disconnect().catch(() => undefined);
    }
  }
}

function canAttemptRocketRide() {
  if (!process.env.ROCKETRIDE_URI) return false;
  return Boolean(process.env.ROCKETRIDE_APIKEY) || isLocalRocketRideUri(process.env.ROCKETRIDE_URI);
}

function withFallbackTimeout<T>(promise: Promise<T>, timeoutMs: number, fallback: T): Promise<T> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(fallback), timeoutMs);

    promise
      .then(resolve)
      .catch(() => resolve(fallback))
      .finally(() => clearTimeout(timer));
  });
}

function getPositiveIntEnv(name: string, fallback: number) {
  const value = process.env[name];
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function buildRecipePrompt(input: GenerateRecipesInput) {
  return [
    'Generate 3 practical recipes from this pantry.',
    `Pantry ingredients: ${cleanIngredients(input.ingredients).join(', ')}`,
    input.dietary?.length ? `Dietary requirements: ${input.dietary.join(', ')}` : '',
    input.maxCookTime ? `Maximum total time: ${input.maxCookTime} minutes` : '',
    input.cuisineType ? `Cuisine preference: ${input.cuisineType}` : '',
    input.difficulty ? `Skill level: ${input.difficulty}` : '',
    'Return only JSON with this exact shape:',
    '{"recipes":[{"title":"string","description":"string","servings":2,"difficulty":"beginner|intermediate|advanced","cuisineType":"string","mealType":"string","prepTimeMinutes":5,"cookTimeMinutes":15,"totalTimeMinutes":20,"dietaryTags":[],"allergenWarnings":[],"ingredients":[{"name":"string","displayText":"string","optional":false,"garnish":false,"category":"string"}],"steps":["string"]}]}',
  ].filter(Boolean).join('\n');
}

function parseRocketRideRecipes(response: unknown): GeneratedRecipe[] {
  const parsed = parseJsonLike(response);
  if (Array.isArray(parsed)) return parsed as GeneratedRecipe[];

  if (isRecord(parsed)) {
    const recipes = parsed.recipes ?? parsed.items ?? parsed.results;
    if (Array.isArray(recipes)) return recipes as GeneratedRecipe[];

    const text = parsed.text ?? parsed.answers;
    if (typeof text === 'string') return parseRocketRideRecipes(text);
    if (Array.isArray(text) && text.length > 0) return parseRocketRideRecipes(text[0]);
  }

  return [];
}

function parseGeminiRecipes(response: unknown): GeneratedRecipe[] {
  if (!isRecord(response)) return [];
  const candidates = response.candidates;
  if (!Array.isArray(candidates)) return [];
  const text = candidates
    .flatMap((candidate) => {
      if (!isRecord(candidate.content)) return [];
      const parts = candidate.content.parts;
      if (!Array.isArray(parts)) return [];
      return parts.flatMap((part) => isRecord(part) && typeof part.text === 'string' ? [part.text] : []);
    })
    .join('\n');

  return parseRocketRideRecipes(text);
}

function parseJsonLike(value: unknown): unknown {
  if (typeof value !== 'string') return value;

  const trimmed = value.trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
}

function cleanIngredients(ingredients: string[]) {
  return Array.from(new Set(ingredients.map((ingredient) => ingredient.trim().toLowerCase()).filter(Boolean)));
}

function normalizeName(name: string) {
  return name.trim().toLowerCase();
}

function normalizeDifficulty(value?: string): SkillLevel {
  const normalized = value?.toLowerCase();
  if (normalized === 'advanced') return 'advanced';
  if (normalized === 'intermediate' || normalized === 'medium') return 'intermediate';
  return 'beginner';
}

function positiveInt(value: number | undefined, fallback: number) {
  return value && value > 0 ? Math.round(value) : fallback;
}

function deterministicId(title: string, ingredients: string[]) {
  const hash = crypto
    .createHash('sha1')
    .update(`${title}:${ingredients.map(normalizeName).sort().join(',')}`)
    .digest('hex')
    .slice(0, 12);
  return `ai-${hash}`;
}

function buildDescription(title: string, ingredients: string[]) {
  return `${title} generated from ${ingredients.slice(0, 4).join(', ')}.`;
}

function toTitleCase(value: string) {
  return value.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
