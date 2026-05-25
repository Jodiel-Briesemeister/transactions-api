import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TransferUseCase } from '@application/usecases/transaction/TransferUseCase';
import { AppError } from '@domain/errors/AppError';
import {
  makeLogger,
  makeUnitOfWork,
  makeAccountRepository,
  makeUserRepository,
  makeTransactionRepository,
  makeAccount,
  makeUser,
  makeMessagePublisher,
} from '../../helpers/mocks';

const makeSut = () => {
  const userRepository = makeUserRepository();
  const accountRepository = makeAccountRepository();
  const transactionRepository = makeTransactionRepository();
  const logger = makeLogger();
  const unitOfWork = makeUnitOfWork();
  const messagePublisher = makeMessagePublisher();

  const sut = new TransferUseCase(
    userRepository,
    accountRepository,
    transactionRepository,
    logger,
    unitOfWork,
    messagePublisher,
  );

  return { sut, userRepository, accountRepository, transactionRepository, logger, unitOfWork };
};

describe('TransferUseCase', () => {
  const userId = 'user-id';
  const recipientEmail = 'recipient@test.com';

  describe('input validation', () => {
    it('should throw if amount is zero', async () => {
      const { sut } = makeSut();
      await expect(sut.execute({ userId, recipientEmail, amount: 0 })).rejects.toThrow(
        new AppError('Amount must be greater than zero', 422),
      );
    });

    it('should throw if amount is negative', async () => {
      const { sut } = makeSut();
      await expect(sut.execute({ userId, recipientEmail, amount: -100 })).rejects.toThrow(
        new AppError('Amount must be greater than zero', 422),
      );
    });

    it('should throw if user transfers to themselves', async () => {
      const { sut, accountRepository, userRepository } = makeSut();
      vi.mocked(accountRepository.findByUserId).mockResolvedValue(makeAccount(1000));
      vi.mocked(userRepository.findByEmail).mockResolvedValue(makeUser({ id: userId }));

      await expect(sut.execute({ userId, recipientEmail, amount: 100 })).rejects.toThrow(
        new AppError('Cannot transfer to yourself', 422),
      );
    });
  });

  describe('business rules', () => {
    it('should throw if sender account not found', async () => {
      const { sut, accountRepository, userRepository } = makeSut();
      vi.mocked(accountRepository.findByUserId).mockResolvedValue(null);
      vi.mocked(userRepository.findByEmail).mockResolvedValue(makeUser({ id: 'recipient-id' }));

      await expect(sut.execute({ userId, recipientEmail, amount: 100 })).rejects.toThrow(
        new AppError('Account not found', 404),
      );
    });

    it('should throw if recipient not found', async () => {
      const { sut, accountRepository, userRepository } = makeSut();
      vi.mocked(accountRepository.findByUserId).mockResolvedValue(makeAccount(1000));
      vi.mocked(userRepository.findByEmail).mockResolvedValue(null);

      await expect(sut.execute({ userId, recipientEmail, amount: 100 })).rejects.toThrow(
        new AppError('Recipient not found', 404),
      );
    });

    it('should throw if recipient account is inactive', async () => {
      const { sut, accountRepository, userRepository } = makeSut();
      vi.mocked(accountRepository.findByUserId).mockResolvedValue(makeAccount(1000));
      vi.mocked(userRepository.findByEmail).mockResolvedValue(
        makeUser({ id: 'recipient-id', isActive: false }),
      );

      await expect(sut.execute({ userId, recipientEmail, amount: 100 })).rejects.toThrow(
        new AppError('Recipient account is inactive', 422),
      );
    });

    it('should throw if balance is insufficient', async () => {
      const { sut, accountRepository, userRepository } = makeSut();
      vi.mocked(accountRepository.findByUserId).mockResolvedValue(makeAccount(50));
      vi.mocked(userRepository.findByEmail).mockResolvedValue(makeUser({ id: 'recipient-id' }));

      await expect(sut.execute({ userId, recipientEmail, amount: 100 })).rejects.toThrow(
        new AppError('Insufficient balance', 422),
      );
    });
  });

  describe('success', () => {
    beforeEach(() => {});

    it('should debit sender and credit recipient', async () => {
      const { sut, accountRepository, userRepository } = makeSut();
      vi.mocked(accountRepository.findByUserId).mockResolvedValue(makeAccount(1000));
      vi.mocked(userRepository.findByEmail).mockResolvedValue(makeUser({ id: 'recipient-id' }));
      vi.mocked(userRepository.findById).mockResolvedValue(makeUser());

      await sut.execute({ userId, recipientEmail, amount: 200 });

      expect(accountRepository.updateBalance).toHaveBeenCalledWith(userId, -200, {});
      expect(accountRepository.updateBalance).toHaveBeenCalledWith('recipient-id', 200, {});
    });

    it('should create the transaction record', async () => {
      const { sut, accountRepository, userRepository, transactionRepository } = makeSut();
      vi.mocked(accountRepository.findByUserId).mockResolvedValue(makeAccount(1000));
      vi.mocked(userRepository.findByEmail).mockResolvedValue(makeUser({ id: 'recipient-id' }));
      vi.mocked(userRepository.findById).mockResolvedValue(makeUser());

      await sut.execute({ userId, recipientEmail, amount: 200 });

      expect(transactionRepository.create).toHaveBeenCalledOnce();
    });

    it('should log the transfer', async () => {
      const { sut, accountRepository, userRepository, logger } = makeSut();
      vi.mocked(accountRepository.findByUserId).mockResolvedValue(makeAccount(1000));
      vi.mocked(userRepository.findByEmail).mockResolvedValue(makeUser({ id: 'recipient-id' }));
      vi.mocked(userRepository.findById).mockResolvedValue(makeUser());

      await sut.execute({ userId, recipientEmail, amount: 200 });

      expect(logger.info).toHaveBeenCalledWith('Transfer completed', {
        userId,
        recipientEmail,
        amount: 200,
      });
    });
  });
});
