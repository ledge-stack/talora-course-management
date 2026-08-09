import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  // Make DATABASE_URL optional for local dev/tests; enforce in production below.
  DATABASE_URL: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
  TRUST_PROXY: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

// Enforce DATABASE_URL presence in production
if (parsed.data.NODE_ENV === 'production' && !parsed.data.DATABASE_URL) {
  console.error('❌ DATABASE_URL is required in production');
  process.exit(1);
}

export const env = {
  NODE_ENV: parsed.data.NODE_ENV,
  PORT: parsed.data.PORT,
  DATABASE_URL: parsed.data.DATABASE_URL,
  SENTRY_DSN: parsed.data.SENTRY_DSN,
  TRUST_PROXY: parsed.data.TRUST_PROXY,
};

export default env;
