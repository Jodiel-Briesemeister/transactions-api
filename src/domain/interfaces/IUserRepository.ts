import { User } from '@domain/entities/User';

export type UpdateUserData = {
  name?: string;
  email?: string;
  phone?: string | null;
};

export interface IUserRepository {
  create(user: User, trx?: unknown): Promise<string>;
  findByEmail(email: string, trx?: unknown): Promise<User | null>;
  findById(id: string, trx?: unknown): Promise<User | null>;
  update(id: string, data: UpdateUserData): Promise<User>;
  deactivate(id: string): Promise<void>;
  reactivate(id: string): Promise<void>;
}
