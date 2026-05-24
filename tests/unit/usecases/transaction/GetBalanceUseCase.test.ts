import { describe, it, expect, vi } from 'vitest';
import { GetBalanceUseCase } from '@application/usecases/transaction/GetBalanceUseCase';
import { AppError } from '@domain/errors/AppError';
import { makeAccountRepository, makeLogger, makeAccount } from '../../helpers/mocks';

const makeSut = () => {
  const accountRepository = makeAccountRepository();
  const logger = makeLogger();

  const sut = new GetBalanceUseCase(accountRepository, logger);

  return { sut, accountRepository, logger };
};

describe('GetBalanceUseCase', () => {
  const userId = 'user-id';

  it('should throw if account is not found', async () => {
    const { sut, accountRepository } = makeSut();
    vi.mocked(accountRepository.findByUserId).mockResolvedValue(null);

    await expect(sut.execute({ userId })).rejects.toThrow(new AppError('Account not found', 404));
  });

  it('should return the account balance', async () => {
    const { sut, accountRepository } = makeSut();
    vi.mocked(accountRepository.findByUserId).mockResolvedValue(makeAccount(500));

    const result = await sut.execute({ userId });

    expect(result).toEqual({ balance: 500 });
  });
});
