import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default('127.0.0.1'),
  JWT_SECRET: z.string(),
  REFRESH_TOKEN_EXPIRES_IN_DAYS: z.coerce.number(),
  ACCESS_TOKEN_EXPIRES_IN_SECONDS: z.coerce.number().default(900),
  LOG_LEVEL: z.string(),
  REDIS_HOST: z.string(),
  REDIS_PORT: z.coerce.number().default(6379),

  DB_HOST: z.string(),
  DB_PORT: z.coerce.number().default(5432),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
  DB_SCHEMA: z.string().default('public'),

  OTEL_SERVICE_NAME: z.string().default('transactions-api'),
  OTEL_SERVICE_VERSION: z.string().default('1.0.0'),
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().default('http://localhost:4318'),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000),
  RATE_LIMIT_GLOBAL_TRIES: z.coerce.number().default(100),
  RATE_LIMIT_AUTH_TRIES: z.coerce.number().default(50),
  RATE_LIMIT_LOGIN_TRIES: z.coerce.number().default(10),

  CORS_ORIGIN: z.string().default('http://localhost:3002'),
});

const parsed = envSchema.parse(process.env);

export const env = {
  port: parsed.PORT,
  host: parsed.HOST,
  jwtSecret: parsed.JWT_SECRET,
  refreshTokenExpiresInDays: parsed.REFRESH_TOKEN_EXPIRES_IN_DAYS,
  accessTokenExpiresInSeconds: parsed.ACCESS_TOKEN_EXPIRES_IN_SECONDS,
  logLevel: parsed.LOG_LEVEL,
  redisHost: parsed.REDIS_HOST,
  redisPort: parsed.REDIS_PORT,

  dbHost: parsed.DB_HOST,
  dbPort: parsed.DB_PORT,
  dbUser: parsed.DB_USER,
  dbPassword: parsed.DB_PASSWORD,
  dbName: parsed.DB_NAME,
  dbSchema: parsed.DB_SCHEMA,

  otelServiceName: parsed.OTEL_SERVICE_NAME,
  otelServiceVersion: parsed.OTEL_SERVICE_VERSION,
  otlpEndpoint: parsed.OTEL_EXPORTER_OTLP_ENDPOINT,

  rateLimitWindowMs: parsed.RATE_LIMIT_WINDOW_MS,
  rateLimitGlobalTries: parsed.RATE_LIMIT_GLOBAL_TRIES,
  rateLimitAuthTries: parsed.RATE_LIMIT_AUTH_TRIES,
  rateLimitLoginTries: parsed.RATE_LIMIT_LOGIN_TRIES,

  corsOrigin: parsed.CORS_ORIGIN,
};
