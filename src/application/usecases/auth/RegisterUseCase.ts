import { IUserRepository } from '@domain/interfaces/IUserRepository';
import { ILogger } from '@domain/interfaces/ILogger';
import { IPasswordService } from '@domain/interfaces/IPasswordService';
import { User } from '@domain/entities/User';
import { IAuthService } from '@domain/interfaces/IAuthService';
import { IRefreshTokenService } from '@domain/interfaces/IRefreshTokenService';
import { AppError } from '@domain/errors/AppError';

interface Request {
  name: string;
  email: string;
  password: string;
}

export class RegisterUseCase {
  constructor(
    private cachedUserRepository: IUserRepository,
    private passwordService: IPasswordService,
    private authService: IAuthService,
    private logger: ILogger,
    private refreshTokenService: IRefreshTokenService,
  ) {}

  async execute({ name, email, password }: Request) {
    const existingUser = await this.cachedUserRepository.findByEmail(email);

    if (existingUser) {
      this.logger.warn('User already exists', { email });
      throw new AppError('User already exists', 409);
    }

    const passwordHash = await this.passwordService.hash(password);

    const user = User.create({
      name,
      email,
      passwordHash,
    });

    const userId = await this.cachedUserRepository.create(user);
    this.logger.info('User created', { userId });

    const accessToken = this.authService.generateAccessToken(userId);
    const refreshToken = await this.refreshTokenService.createForUser(userId);

    return {
      accessToken,
      refreshToken,
    };
  }
}
