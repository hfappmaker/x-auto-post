import dotenv from 'dotenv';

dotenv.config();

export const config = {
  x: {
    apiKey: process.env.X_API_KEY || '',
    apiSecret: process.env.X_API_SECRET || '',
    accessToken: process.env.X_ACCESS_TOKEN || '',
    accessSecret: process.env.X_ACCESS_SECRET || '',
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
  },
  postIntervalMinutes: parseInt(process.env.POST_INTERVAL_MINUTES || '60', 10),
};

export function validateConfig(): void {
  const errors: string[] = [];

  if (!config.x.apiKey) errors.push('X_API_KEY is not set');
  if (!config.x.apiSecret) errors.push('X_API_SECRET is not set');
  if (!config.x.accessToken) errors.push('X_ACCESS_TOKEN is not set');
  if (!config.x.accessSecret) errors.push('X_ACCESS_SECRET is not set');
  if (!config.gemini.apiKey) errors.push('GEMINI_API_KEY is not set');

  if (errors.length > 0) {
    throw new Error(`Configuration errors:\n${errors.join('\n')}`);
  }
}
