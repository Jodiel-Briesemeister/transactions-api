import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { Knex } from 'knex';
import { UserRepository } from '@infrastructure/database/repositories/UserRepository';
import { User } from '@domain/entities/User';
import { createTestDb } from '../helpers/database';

let db: Knex;
let repository: UserRepository;

beforeAll(async () => {
  db = createTestDb();
  await db.migrate.latest();
  repository = new UserRepository(db);
});

afterEach(async () => {
  await db('users').delete();
});

afterAll(async () => {
  await db.destroy();
});

const makeUser = (email = 'user@test.com') =>
  User.create({
    name: 'test name',
    email,
    passwordHash: 'hashed-password',
    phone: null,
  });

describe('UserRepository', () => {
  describe('create', () => {
    it('should insert user and return an id', async () => {
      const id = await repository.create(makeUser());

      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
    });

    it('should persist the user data correctly', async () => {
      const user = makeUser();
      const id = await repository.create(user);

      const found = await repository.findById(id);

      expect(found).not.toBeNull();
      expect(found!.name).toBe(user.name);
      expect(found!.email).toBe(user.email);
      expect(found!.isActive).toBe(true);
    });
  });

  describe('findByEmail', () => {
    it('should return user when email exists', async () => {
      const user = makeUser();
      await repository.create(user);

      const found = await repository.findByEmail(user.email);

      expect(found).not.toBeNull();
      expect(found!.email).toBe(user.email);
    });

    it('should return null when email does not exist', async () => {
      const found = await repository.findByEmail('nonexistent@test.com');

      expect(found).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return active user', async () => {
      const id = await repository.create(makeUser());

      const found = await repository.findById(id);

      expect(found).not.toBeNull();
      expect(found!.id).toBe(id);
    });

    it('should return null for non-existent id', async () => {
      const found = await repository.findById('00000000-0000-0000-0000-000000000000');

      expect(found).toBeNull();
    });

    it('should return null for inactive user', async () => {
      const id = await repository.create(makeUser());
      await repository.deactivate(id);

      const found = await repository.findById(id);

      expect(found).toBeNull();
    });
  });

  describe('update', () => {
    it('should update user name', async () => {
      const id = await repository.create(makeUser());

      await repository.update(id, { name: 'another test name' });

      const found = await repository.findById(id);
      expect(found!.name).toBe('another test name');
    });

    it('should update user email', async () => {
      const id = await repository.create(makeUser());

      await repository.update(id, { email: 'anotheruser@test.com' });

      const found = await repository.findByEmail('anotheruser@test.com');
      expect(found).not.toBeNull();
    });
  });

  describe('deactivate', () => {
    it('should make user invisible to findById', async () => {
      const id = await repository.create(makeUser());

      await repository.deactivate(id);

      expect(await repository.findById(id)).toBeNull();
    });
  });

  describe('reactivate', () => {
    it('should make user visible to findById again', async () => {
      const id = await repository.create(makeUser());
      await repository.deactivate(id);

      await repository.reactivate(id);

      const found = await repository.findById(id);
      expect(found).not.toBeNull();
      expect(found!.isActive).toBe(true);
    });
  });
});
