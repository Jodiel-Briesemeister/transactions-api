import { z } from 'zod';
import { phoneSchema } from './user';

const strongPasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
  .refine(
    (val) => !/(.)\1{3,}/.test(val),
    'Password must not contain 4 or more repeated characters',
  )
  .refine((val) => {
    for (let i = 0; i < val.length - 2; i++) {
      if (
        val.charCodeAt(i + 1) === val.charCodeAt(i) + 1 &&
        val.charCodeAt(i + 2) === val.charCodeAt(i) + 2
      ) {
        return false;
      }
    }
    return true;
  }, 'Password must not contain sequential characters');

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: strongPasswordSchema,
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
