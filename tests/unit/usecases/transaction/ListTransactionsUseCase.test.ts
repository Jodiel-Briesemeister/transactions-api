import { describe, it, expect, vi } from 'vitest';
import { ListTransactionsUseCase } from '@application/usecases/transaction/ListTransactionsUseCase';
import { TransactionType } from '@domain/enums/TransactionType';
import { makeTransactionRepository } from '../../helpers/mocks';

const makeSut = () => {
  const transactionRepository = makeTransactionRepository();
  const sut = new ListTransactionsUseCase(transactionRepository);
  return { sut, transactionRepository };
};

describe('ListTransactionsUseCase', () => {
  const userId = 'user-id';

  it('should return transactions for the user', async () => {
    const { sut, transactionRepository } = makeSut();
    const transactions = [
      {
        id: 'tx-1',
        type: TransactionType.DEPOSIT,
        amount: 100,
        senderId: userId,
        senderName: 'name test',
        recipientId: null,
        recipientName: null,
        createdAt: new Date(),
      },
    ];
    vi.mocked(transactionRepository.listByUser).mockResolvedValue(transactions);

    const result = await sut.execute({ userId, filters: {} });

    expect(result).toEqual(transactions);
  });

  it('should forward filters to the repository', async () => {
    const { sut, transactionRepository } = makeSut();
    vi.mocked(transactionRepository.listByUser).mockResolvedValue([]);

    const filters = { type: TransactionType.TRANSFER, from: new Date('2026-01-01') };
    await sut.execute({ userId, filters });

    expect(transactionRepository.listByUser).toHaveBeenCalledWith(userId, filters);
  });
});
