import { z } from 'zod';
import { phoneSchema } from './user';

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  phone: phoneSchema.default(null),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const refreshTokenBodySchema = z.object({
  refreshToken: z.string().uuid(),
});

export const reactivateAccountSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const logoutSchema = refreshTokenBodySchema;
export const refreshTokenSchema = refreshTokenBodySchema;