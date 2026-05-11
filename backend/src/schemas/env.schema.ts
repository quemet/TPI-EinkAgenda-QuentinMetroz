import z from 'zod';

const envSchema = z.object({
  DB_HOST: z.string(),
  DB_PORT: z.string(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
  DB_SYNC_MODE: z.enum(['force', 'alter', 'none']),
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string(),
  PORT: z.string(),
  CORS_ORIGIN: z.string(),
  NODE_ENV: z.enum(['development', 'production', 'test']),
});

export default envSchema;
