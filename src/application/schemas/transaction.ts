import { z } from 'zod';
import { TransactionType } from '@domain/enums/TransactionType';

export const depositSchema = z.object({
  amount: z.number().int().positive(),
});

export const withdrawSchema = z.object({
  amount: z.number().int().positive(),
});

export const transferSchema = z.object({
  recipientEmail: z.string().email(),
  amount: z.number().int().positive(),
});

export const listTransactionsSchema = z.object({
  type: z.nativeEnum(TransactionType).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});
