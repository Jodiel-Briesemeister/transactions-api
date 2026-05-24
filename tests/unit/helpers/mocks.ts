import { vi } from 'vitest';
import { Account } from '@domain/entities/Account';
import { User } from '@domain/entities/User';
import { IAccountRepository } from '@domain/interfaces/IAccountRepository';
import { IUserRepository } from '@domain/interfaces/IUserRepository';
import { ITransactionRepository } from '@domain/interfaces/ITransactionRepository';
import { IUnitOfWork } from '@domain/interfaces/IUnitOfWork';
import { ILogger } from '@domain/interfaces/ILogger';
import { IPasswordService } from '@domain/interfaces/IPasswordService';
import { IAuthService } from '@domain/interfaces/IAuthService';
import { IRefreshTokenService } from '@domain/interfaces/IRefreshTokenService';
import { IRefreshTokenRepository } from '@domain/interfaces/IRefreshTokenRepository';
import { ITokenBlacklistService } from '@domain/interfaces/ITokenBlacklistService';

export const makeLogger = (): ILogger => ({
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
});

export const makeUnitOfWork = (): IUnitOfWork => ({
  transaction: vi.fn().mockImplementation(async (cb: (trx: unknown) => Promise<unknown>) => cb({})),
});

export const makeAccountRepository = (): IAccountRepository => ({
  create: vi.fn(),
  findByUserId: vi.fn(),
  updateBalance: vi.fn(),
});

export const makeUserRepository = (): IUserRepository => ({
  create: vi.fn(),
  findByEmail: vi.fn(),
  findById: vi.fn(),
  update: vi.fn(),
  deactivate: vi.fn(),
  reactivate: vi.fn(),
});

export const makeTransactionRepository = (): ITransactionRepository => ({
  create: vi.fn(),
  listByUser: vi.fn(),
});

export const makePasswordService = (): IPasswordService => ({
  hash: vi.fn(),
  compare: vi.fn(),
});

export const makeAuthService = (): IAuthService => ({
  generateAccessToken: vi.fn().mockReturnValue('access-token'),
  verifyAccessToken: vi.fn(),
  getTokenExpiresIn: vi.fn(),
});

export const makeRefreshTokenService = (): IRefreshTokenService => ({
  createForUser: vi.fn().mockResolvedValue('refresh-token'),
});

export const makeTokenBlacklistService = (): ITokenBlacklistService => ({
  add: vi.fn(),
  has: vi.fn(),
});

export const makeRefreshTokenRepository = (): IRefreshTokenRepository => ({
  create: vi.fn(),
  findByToken: vi.fn(),
  deleteByToken: vi.fn(),
  deleteAllByUser: vi.fn(),
  deleteExpired: vi.fn(),
});

export const makeAccount = (balance = 1000): Account =>
  Account.reconstitute({ id: 'account-id', userId: 'user-id', balance, createdAt: new Date() });

export const makeUser = (overrides: Partial<{ id: string; isActive: boolean }> = {}): User =>
  User.reconstitute({
    id: overrides.id ?? 'user-id',
    name: 'name test',
    email: 'user@test.com',
    passwordHash: 'hashed-password',
    phone: null,
    isActive: overrides.isActive ?? true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
