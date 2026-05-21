import { describe, it, expect, vi } from 'vitest';
import { WithdrawUseCase } from '@application/usecases/transaction/WithdrawUseCase';
import { AppError } from '@domain/errors/AppError';
import {
  makeLogger,
  makeUnitOfWork,
  makeAccountRepository,
  makeTransactionRepository,
  makeAccount,
} from '../../helpers/mocks';

const makeSut = () => {
  const accountRepository = makeAccountRepository();
  const transactionRepository = makeTransactionRepository();
  const logger = makeLogger();
  const unitOfWork = makeUnitOfWork();

  const sut = new WithdrawUseCase(accountRepository, transactionRepository, logger, unitOfWork);

  return { sut, accountRepository, transactionRepository, logger };
};

describe('WithdrawUseCase', () => {
  const userId = 'user-id';

  it('should throw if amount is zero', async () => {
    const { sut } = makeSut();
    await expect(sut.execute({ userId, amount: 0 })).rejects.toThrow(
      new AppError('Amount must be greater than zero', 422),
    );
  });

  it('should throw if amount is negative', async () => {
    const { sut } = makeSut();
    await expect(sut.execute({ userId, amount: -50 })).rejects.toThrow(
      new AppError('Amount must be greater than zero', 422),
    );
  });

  it('should throw if account not found', async () => {
    const { sut, accountRepository } = makeSut();
    vi.mocked(accountRepository.findByUserId).mockResolvedValue(null);

    await expect(sut.execute({ userId, amount: 100 })).rejects.toThrow(
      new AppError('Account not found', 404),
    );
  });

  it('should throw if balance is insufficient', async () => {
    const { sut, accountRepository } = makeSut();
    vi.mocked(accountRepository.findByUserId).mockResolvedValue(makeAccount(50));

    await expect(sut.execute({ userId, amount: 100 })).rejects.toThrow(
      new AppError('Insufficient balance', 422),
    );
  });

  it('should update balance and create transaction', async () => {
    const { sut, accountRepository, transactionRepository } = makeSut();
    vi.mocked(accountRepository.findByUserId).mockResolvedValue(makeAccount(500));

    await sut.execute({ userId, amount: 100 });

    expect(accountRepository.updateBalance).toHaveBeenCalledWith(userId, -100, {});
    expect(transactionRepository.create).toHaveBeenCalledOnce();
  });

  it('should log the withdraw', async () => {
    const { sut, accountRepository, logger } = makeSut();
    vi.mocked(accountRepository.findByUserId).mockResolvedValue(makeAccount(500));

    await sut.execute({ userId, amount: 100 });

    expect(logger.info).toHaveBeenCalledWith('Withdraw completed', { userId, amount: 100 });
  });
});
