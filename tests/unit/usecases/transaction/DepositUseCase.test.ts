import { describe, it, expect, vi } from 'vitest';
import { DepositUseCase } from '@application/usecases/transaction/DepositUseCase';
import { AppError } from '@domain/errors/AppError';
import {
  makeLogger,
  makeUnitOfWork,
  makeAccountRepository,
  makeTransactionRepository,
  makeAccount,
  makeUser,
  makeUserRepository,
  makeMessagePublisher,
} from '../../helpers/mocks';

const makeSut = () => {
  const accountRepository = makeAccountRepository();
  const transactionRepository = makeTransactionRepository();
  const logger = makeLogger();
  const unitOfWork = makeUnitOfWork();
  const messagePublisher = makeMessagePublisher();
  const userRepository = makeUserRepository();

  const sut = new DepositUseCase(
    accountRepository,
    transactionRepository,
    logger,
    unitOfWork,
    messagePublisher,
    userRepository,
  );

  return { sut, accountRepository, transactionRepository, logger, userRepository };
};

describe('DepositUseCase', () => {
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

  it('should update balance and create transaction', async () => {
    const { sut, accountRepository, transactionRepository, userRepository } = makeSut();
    vi.mocked(accountRepository.findByUserId).mockResolvedValue(makeAccount(500));
    vi.mocked(userRepository.findById).mockResolvedValue(makeUser());

    await sut.execute({ userId, amount: 100 });

    expect(accountRepository.updateBalance).toHaveBeenCalledWith(userId, 100, {});
    expect(transactionRepository.create).toHaveBeenCalledOnce();
  });

  it('should log the deposit', async () => {
    const { sut, accountRepository, logger, userRepository } = makeSut();
    vi.mocked(accountRepository.findByUserId).mockResolvedValue(makeAccount(500));
    vi.mocked(userRepository.findById).mockResolvedValue(makeUser());

    await sut.execute({ userId, amount: 100 });

    expect(logger.info).toHaveBeenCalledWith('Deposit completed', { userId, amount: 100 });
  });
});
