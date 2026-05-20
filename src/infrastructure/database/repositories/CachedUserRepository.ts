import { IUserRepository, UpdateUserData } from '@domain/interfaces/IUserRepository';
import { ICacheService } from '@domain/interfaces/ICacheService';
import { User } from '@domain/entities/User';

export class CachedUserRepository implements IUserRepository {
  constructor(
    private userRepository: IUserRepository,
    private cacheService: ICacheService,
  ) {}

  async create(user: User): Promise<string> {
    return this.userRepository.create(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async findById(id: string): Promise<User | null> {
    const cached = await this.cacheService.get('user', id);

    if (cached) {
      const data = JSON.parse(cached);
      return User.reconstitute({
        ...data,
        createdAt: new Date(data.createdAt),
      });
    }

    const user = await this.userRepository.findById(id);

    if (user) {
      await this.cacheService.set('user', id, JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
        phone: user.phone,
        createdAt: user.createdAt,
      }));
    }

    return user;
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    const user = await this.userRepository.update(id, data);
    await this.cacheService.delete('user', id);
    return user;
  }

  async deactivate(id: string): Promise<void> {
    await this.userRepository.deactivate(id);
    await this.cacheService.delete('user', id);
  }

  async reactivate(id: string): Promise<void> {
    await this.userRepository.reactivate(id);
    await this.cacheService.delete('user', id);
  }
}
