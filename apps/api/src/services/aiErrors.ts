export class AiServiceUnavailableError extends Error {
  readonly statusCode = 503;
  readonly code = 'AI_SERVICE_UNAVAILABLE';

  constructor(message: string) {
    super(message);
    this.name = 'AiServiceUnavailableError';
  }
}

export function shouldUseDemoAiFallback() {
  return process.env.NODE_ENV === 'test' || process.env.KITCHENSCAN_DEMO_AI_FALLBACK === 'true';
}
