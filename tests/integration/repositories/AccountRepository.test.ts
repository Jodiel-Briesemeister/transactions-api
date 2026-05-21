import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { Knex } from 'knex';
import { AccountRepository } from '@infrastructure/database/repositories/AccountRepository';
import { UserRepository } from '@infrastructure/database/repositories/UserRepository';
import { User } from '@domain/entities/User';
import { createTestDb } from '../helpers/database';

let db: Knex;
let repository: AccountRepository;
let userRepository: UserRepository;
let userId: string;

beforeAll(async () => {
  db = createTestDb();
  await db.migrate.latest();
  repository = new AccountRepository(db);
  userRepository = new UserRepository(db);
});

afterEach(async () => {
  await db('users').delete();
});

afterAll(async () => {
  await db.destroy();
});

const createUser = async () => {
  return userRepository.create(
    User.create({ name: 'test name', email: 'user@test.com', passwordHash: 'hash', phone: null }),
  );
};

describe('AccountRepository', () => {
  describe('create', () => {
    it('should create account with zero balance', async () => {
      userId = await createUser();

      await db.transaction((trx) => repository.create(userId, trx));

      const account = await repository.findByUserId(userId);
      expect(account).not.toBeNull();
      expect(account!.balance).toBe(0);
      expect(account!.userId).toBe(userId);
    });
  });

  describe('findByUserId', () => {
    it('should return account when it exists', async () => {
      userId = await createUser();
      await db.transaction((trx) => repository.create(userId, trx));

      const account = await repository.findByUserId(userId);

      expect(account).not.toBeNull();
      expect(account!.userId).toBe(userId);
    });

    it('should return null when account does not exist', async () => {
      const account = await repository.findByUserId('00000000-0000-0000-0000-000000000000');

      expect(account).toBeNull();
    });
  });

  describe('updateBalance', () => {
    it('should increment balance', async () => {
      userId = await createUser();
      await db.transaction((trx) => repository.create(userId, trx));

      await db.transaction((trx) => repository.updateBalance(userId, 500, trx));

      const account = await repository.findByUserId(userId);
      expect(account!.balance).toBe(500);
    });

    it('should decrement balance', async () => {
      userId = await createUser();
      await db.transaction((trx) => repository.create(userId, trx));
      await db.transaction((trx) => repository.updateBalance(userId, 1000, trx));

      await db.transaction((trx) => repository.updateBalance(userId, -300, trx));

      const account = await repository.findByUserId(userId);
      expect(account!.balance).toBe(700);
    });

    it('should accumulate multiple updates', async () => {
      userId = await createUser();
      await db.transaction((trx) => repository.create(userId, trx));

      await db.transaction((trx) => repository.updateBalance(userId, 1000, trx));
      await db.transaction((trx) => repository.updateBalance(userId, 500, trx));
      await db.transaction((trx) => repository.updateBalance(userId, -200, trx));

      const account = await repository.findByUserId(userId);
      expect(account!.balance).toBe(1300);
    });
  });
});
