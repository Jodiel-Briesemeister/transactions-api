import { User } from '@domain/entities/User';

export interface IUserRepository {
  create(user: User): Promise<string>;
  findByEmail(email: string): Promise<User | null>;
}
