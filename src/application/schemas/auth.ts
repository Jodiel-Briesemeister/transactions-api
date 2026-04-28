import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  email: z.email().max(255),
  password: z.string().min(8).max(72),
});

export const loginSchema = z.object({
  email: z.email().max(255),
  password: z.string().max(72),
});

export const logoutSchema = z.object({
  refreshToken: z.uuid(),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.uuid(),
});
