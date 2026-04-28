import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.string().optional(),
  HOST: z.string().optional(),
  JWT_SECRET: z.string(),
  REFRESH_TOKEN_EXPIRES_IN_DAYS: z.string(),
  LOG_LEVEL: z.string(),
  REDIS_HOST: z.string(),
  REDIS_PORT: z.string(),

  DB_HOST: z.string(),
  DB_PORT: z.string().optional(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
  DB_SCHEMA: z.string().optional(),
});

const parsed = envSchema.parse(process.env);

export const env = {
  // app
  port: Number(parsed.PORT ?? 3000),
  host: parsed.HOST ?? '127.0.0.1',
  jwtSecret: parsed.JWT_SECRET,
  refreshTokenExpiresInDays: Number(parsed.REFRESH_TOKEN_EXPIRES_IN_DAYS),
  logLevel: parsed.LOG_LEVEL,
  redisHost: parsed.REDIS_HOST,
  redisPort: Number(parsed.REDIS_PORT),

  // database
  dbHost: parsed.DB_HOST,
  dbPort: Number(parsed.DB_PORT ?? 5432),
  dbUser: parsed.DB_USER,
  dbPassword: parsed.DB_PASSWORD,
  dbName: parsed.DB_NAME,
  dbSchema: parsed.DB_SCHEMA ?? 'public',
};
