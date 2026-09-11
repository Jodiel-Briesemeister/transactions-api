import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import { Knex } from 'knex';
import { AccountRepository } from '@infrastructure/database/repositories/AccountRepository';
import { TransactionRepository } from '@infrastructure/database/repositories/TransactionRepository';
import { UserRepository } from '@infrastructure/database/repositories/UserRepository';
import { KnexUnitOfWork } from '@infrastructure/database/KnexUnitOfWork';
import { WithdrawUseCase } from '@application/usecases/transaction/WithdrawUseCase';
import { TransferUseCase } from '@application/usecases/transaction/TransferUseCase';
import { AppError } from '@domain/errors/AppError';
import { User } from '@domain/entities/User';
import { createTestDb } from '../helpers/database';
import { makeLogger, makeMessagePublisher } from '../../unit/helpers/mocks';

/**
 * Exercises `SELECT ... FOR UPDATE` against real rows; the unit tests only check that the locking
 * methods are called.
 */

let db: Knex;
let accountRepository: AccountRepository;
let transactionRepository: TransactionRepository;
let userRepository: UserRepository;
let withdrawUseCase: WithdrawUseCase;
let transferUseCase: TransferUseCase;

beforeAll(async () => {
  // One connection per concurrent task, plus headroom for the assertions.
  db = createTestDb(15);
  await db.migrate.latest();

  accountRepository = new AccountRepository(db);
  transactionRepository = new TransactionRepository(db);
  userRepository = new UserRepository(db);

  const unitOfWork = new KnexUnitOfWork(db);
  const logger = makeLogger();
  const messagePublisher = makeMessagePublisher();

  withdrawUseCase = new WithdrawUseCase(
    accountRepository,
    transactionRepository,
    logger,
    unitOfWork,
    messagePublisher,
    userRepository,
  );

  transferUseCase = new TransferUseCase(
    userRepository,
    accountRepository,
    transactionRepository,
    logger,
    unitOfWork,
    messagePublisher,
  );
});

afterEach(async () => {
  await db('transactions').delete();
  await db('accounts').delete();
  await db('users').delete();
  vi.clearAllMocks();
});

afterAll(async () => {
  await db.destroy();
});

const createFundedUser = async (email: string, balance: number) => {
  const userId = await userRepository.create(
    User.create({ name: 'concurrency user', email, passwordHash: 'hash', phone: null }),
  );

  await db.transaction((trx) => accountRepository.create(userId, trx));
  if (balance > 0) {
    await db.transaction((trx) => accountRepository.updateBalance(userId, balance, trx));
  }

  return userId;
};

const balanceOf = async (userId: string) => {
  const account = await accountRepository.findByUserId(userId);
  return account!.balance;
};

describe('concurrent balance operations', () => {
  it('should allow exactly 5 of 10 simultaneous withdrawals of 100 against a balance of 500', async () => {
    const userId = await createFundedUser('racer@test.com', 500);

    const results = await Promise.allSettled(
      Array.from({ length: 10 }, () => withdrawUseCase.execute({ userId, amount: 100 })),
    );

    const succeeded = results.filter((r) => r.status === 'fulfilled');
    const refused = results.filter(
      (r) =>
        r.status === 'rejected' &&
        r.reason instanceof AppError &&
        r.reason.message === 'Insufficient balance',
    );
    const unexpected = results.filter(
      (r) =>
        r.status === 'rejected' &&
        !(r.reason instanceof AppError && r.reason.message === 'Insufficient balance'),
    );

    expect(unexpected).toHaveLength(0);
    expect(succeeded).toHaveLength(5);
    expect(refused).toHaveLength(5);
    expect(await balanceOf(userId)).toBe(0);
  });

  it('should not deadlock or create money when transfers run in both directions at once', async () => {
    const aliceId = await createFundedUser('alice@test.com', 1000);
    const bobId = await createFundedUser('bob@test.com', 1000);

    // Half go Alice -> Bob, half go Bob -> Alice. Locking the accounts in the order they are named
    // would let two transactions each hold the row the other needs.
    const results = await Promise.allSettled(
      Array.from({ length: 10 }, (_, i) =>
        i % 2 === 0
          ? transferUseCase.execute({
              userId: aliceId,
              recipientEmail: 'bob@test.com',
              amount: 10,
            })
          : transferUseCase.execute({
              userId: bobId,
              recipientEmail: 'alice@test.com',
              amount: 10,
            }),
      ),
    );

    const failures = results.filter((r) => r.status === 'rejected');
    expect(failures).toHaveLength(0);

    const aliceBalance = await balanceOf(aliceId);
    const bobBalance = await balanceOf(bobId);

    // Money is only ever moved, never created or destroyed.
    expect(aliceBalance + bobBalance).toBe(2000);
    expect(aliceBalance).toBeGreaterThanOrEqual(0);
    expect(bobBalance).toBeGreaterThanOrEqual(0);
  });
});
