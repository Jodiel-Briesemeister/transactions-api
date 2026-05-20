import { Account } from '@domain/entities/Account';

export interface IAccountRepository {
  create(userId: string, trx: unknown): Promise<void>;
  findByUserId(userId: string, trx?: unknown): Promise<Account | null>;
  updateBalance(userId: string, amount: number, trx: unknown): Promise<void>;
}
