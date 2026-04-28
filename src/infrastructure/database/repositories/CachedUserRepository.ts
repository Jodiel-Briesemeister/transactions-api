import { IUserRepository } from '@domain/interfaces/IUserRepository';
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
    const cached = await this.cacheService.get('user', email);

    if (cached) return User.reconstitute(JSON.parse(cached));

    const user = await this.userRepository.findByEmail(email);

    if (user) {
      await this.cacheService.set('user', email, JSON.stringify(user));
    }

    return user;
  }
}
