/**
 * Environment Variable Validation Utility
 *
 * Validates all required environment variables at startup
 * Provides type-safe access to environment variables
 */

import { z } from 'zod';

// Define environment variable schema
const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Build mode
  BUILD_MODE: z.enum(['static', 'dynamic']).optional(),
  NEXT_PUBLIC_BUILD_MODE: z.enum(['static', 'dynamic']).optional(),

  // NextAuth.js
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().min(32).optional(),

  // Google AI
  GOOGLE_GENAI_API_KEY: z.string().optional(),

  // Database (auto-injected by Vercel)
  POSTGRES_URL: z.string().url().optional(),
  POSTGRES_PRISMA_URL: z.string().url().optional(),
  POSTGRES_URL_NO_SSL: z.string().url().optional(),
  POSTGRES_URL_NON_POOLING: z.string().url().optional(),
  POSTGRES_USER: z.string().optional(),
  POSTGRES_HOST: z.string().optional(),
  POSTGRES_PASSWORD: z.string().optional(),
  POSTGRES_DATABASE: z.string().optional(),

  // Vercel Blob Storage
  BLOB_READ_WRITE_TOKEN: z.string().optional(),

  // Hedera (optional)
  HEDERA_ACCOUNT_ID: z.string().optional(),
  HEDERA_PRIVATE_KEY: z.string().optional(),
  HEDERA_TOPIC_ID: z.string().optional(),
  HEDERA_NETWORK: z.enum(['testnet', 'mainnet']).default('testnet'),

  // Vercel
  VERCEL: z.string().optional(),
  VERCEL_ENV: z.enum(['development', 'preview', 'production']).optional(),
  VERCEL_URL: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validated environment variables
 * Safe to use throughout the application
 */
let _env: Env | null = null;

export function getEnv(): Env {
  if (_env) return _env;

  try {
    _env = envSchema.parse(process.env);
    return _env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment variable validation failed:');
      error.issues.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
    }
    throw new Error('Invalid environment variables');
  }
}

/**
 * Check if required environment variables are set for specific features
 */
export const envChecks = {
  /** Check if AI is properly configured */
  hasAI(): boolean {
    const env = getEnv();
    return !!env.GOOGLE_GENAI_API_KEY;
  },

  /** Check if database is properly configured */
  hasDatabase(): boolean {
    const env = getEnv();
    return !!env.POSTGRES_URL;
  },

  /** Check if authentication is properly configured */
  hasAuth(): boolean {
    const env = getEnv();
    return !!env.NEXTAUTH_SECRET && !!env.NEXTAUTH_URL;
  },

  /** Check if Hedera is properly configured */
  hasHedera(): boolean {
    const env = getEnv();
    return !!(
      env.HEDERA_ACCOUNT_ID &&
      env.HEDERA_PRIVATE_KEY &&
      env.HEDERA_TOPIC_ID
    );
  },

  /** Check if Blob storage is properly configured */
  hasBlob(): boolean {
    const env = getEnv();
    return !!env.BLOB_READ_WRITE_TOKEN;
  },

  /** Check if running in production */
  isProduction(): boolean {
    const env = getEnv();
    return env.NODE_ENV === 'production' || env.VERCEL_ENV === 'production';
  },

  /** Check if running in Vercel */
  isVercel(): boolean {
    const env = getEnv();
    return !!env.VERCEL;
  },

  /** Check if static build mode */
  isStaticBuild(): boolean {
    const env = getEnv();
    return env.BUILD_MODE === 'static' || env.NEXT_PUBLIC_BUILD_MODE === 'static';
  },
};

/**
 * Get a specific environment variable with type safety
 */
export function requireEnv<K extends keyof Env>(key: K): NonNullable<Env[K]> {
  const env = getEnv();
  const value = env[key];

  if (value === undefined || value === null || value === '') {
    throw new Error(`Required environment variable ${key} is not set`);
  }

  return value as NonNullable<Env[K]>;
}

/**
 * Get environment variable with fallback
 */
export function getEnvOrDefault<K extends keyof Env>(
  key: K,
  defaultValue: NonNullable<Env[K]>
): NonNullable<Env[K]> {
  const env = getEnv();
  const value = env[key];

  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }

  return value as NonNullable<Env[K]>;
}

// Validate environment on module load in production
if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
  try {
    getEnv();
    console.log('✅ Environment variables validated successfully');
  } catch (error) {
    console.error('❌ Environment validation failed:', error);
    // Don't throw in production to allow graceful degradation
  }
}
