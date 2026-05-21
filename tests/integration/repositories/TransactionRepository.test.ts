import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { Knex } from 'knex';
import { TransactionRepository } from '@infrastructure/database/repositories/TransactionRepository';
import { UserRepository } from '@infrastructure/database/repositories/UserRepository';
import { Transaction } from '@domain/entities/Transaction';
import { TransactionType } from '@domain/enums/TransactionType';
import { User } from '@domain/entities/User';
import { createTestDb } from '../helpers/database';

let db: Knex;
let repository: TransactionRepository;
let userRepository: UserRepository;
let userId: string;
let recipientId: string;

beforeAll(async () => {
  db = createTestDb();
  await db.migrate.latest();
  repository = new TransactionRepository(db);
  userRepository = new UserRepository(db);

  userId = await userRepository.create(
    User.create({ name: 'sender', email: 'sender@test.com', passwordHash: 'hash', phone: null }),
  );
  recipientId = await userRepository.create(
    User.create({
      name: 'recipient',
      email: 'recipient@test.com',
      passwordHash: 'hash',
      phone: null,
    }),
  );
});

afterEach(async () => {
  await db('transactions').delete();
});

afterAll(async () => {
  await db('users').delete();
  await db.destroy();
});

const makeTransaction = (
  overrides: Partial<{ type: TransactionType; amount: number; recipientId: string | null }> = {},
) =>
  Transaction.create({
    userId,
    type: overrides.type ?? TransactionType.DEPOSIT,
    amount: overrides.amount ?? 500,
    recipientId: overrides.recipientId ?? null,
  });

describe('TransactionRepository', () => {
  describe('create', () => {
    it('should insert transaction and return an id', async () => {
      const id = await db.transaction((trx) => repository.create(makeTransaction(), trx));

      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
    });

    it('should persist transaction data correctly', async () => {
      await db.transaction((trx) => repository.create(makeTransaction({ amount: 300 }), trx));

      const [result] = await repository.listByUser(userId, {});

      expect(result!.amount).toBe(300);
      expect(result!.type).toBe(TransactionType.DEPOSIT);
      expect(result!.recipientId).toBeNull();
    });
  });

  describe('listByUser', () => {
    it('should return only transactions of the given user', async () => {
      await db.transaction((trx) => repository.create(makeTransaction(), trx));
      await db.transaction((trx) =>
        repository.create(
          Transaction.create({
            userId: recipientId,
            type: TransactionType.DEPOSIT,
            amount: 100,
            recipientId: null,
          }),
          trx,
        ),
      );

      const results = await repository.listByUser(userId, {});

      expect(results).toHaveLength(1);
      expect(results[0]!.type).toBe(TransactionType.DEPOSIT);
    });

    it('should return empty array when user has no transactions', async () => {
      const results = await repository.listByUser(userId, {});

      expect(results).toHaveLength(0);
    });

    it('should return transactions ordered by most recent first', async () => {
      await db.transaction((trx) => repository.create(makeTransaction({ amount: 100 }), trx));
      await db.transaction((trx) => repository.create(makeTransaction({ amount: 200 }), trx));
      await db.transaction((trx) => repository.create(makeTransaction({ amount: 300 }), trx));

      const results = await repository.listByUser(userId, {});

      expect(results[0]!.amount).toBe(300);
      expect(results[2]!.amount).toBe(100);
    });

    it('should include recipient name on transfer', async () => {
      await db.transaction((trx) =>
        repository.create(makeTransaction({ type: TransactionType.TRANSFER, recipientId }), trx),
      );

      const results = await repository.listByUser(userId, {});

      expect(results[0]!.recipientName).toBe('recipient');
      expect(results[0]!.recipientId).toBe(recipientId);
    });

    it('should filter by type', async () => {
      await db.transaction((trx) =>
        repository.create(makeTransaction({ type: TransactionType.DEPOSIT }), trx),
      );
      await db.transaction((trx) =>
        repository.create(makeTransaction({ type: TransactionType.WITHDRAW }), trx),
      );

      const results = await repository.listByUser(userId, { type: TransactionType.DEPOSIT });

      expect(results).toHaveLength(1);
      expect(results[0]!.type).toBe(TransactionType.DEPOSIT);
    });

    it('should filter by date range', async () => {
      await db.transaction((trx) => repository.create(makeTransaction(), trx));

      const from = new Date(Date.now() - 1000);
      const to = new Date(Date.now() + 1000);

      const results = await repository.listByUser(userId, { from, to });

      expect(results).toHaveLength(1);
    });
  });
});
