import { IUserRepository } from '@domain/interfaces/IUserRepository';
import { ILogger } from '@domain/interfaces/ILogger';
import { AppError } from '@domain/errors/AppError';
import { IAuthService } from '@domain/interfaces/IAuthService';
import { IPasswordService } from '@domain/interfaces/IPasswordService';
import { IRefreshTokenService } from '@domain/interfaces/IRefreshTokenService';

interface Request {
  email: string;
  password: string;
}

export class ReactivateAccountUseCase {
  constructor(
    private cachedUserRepository: IUserRepository,
    private passwordService: IPasswordService,
    private authService: IAuthService,
    private refreshTokenService: IRefreshTokenService,
    private logger: ILogger,
  ) {}

  async execute({ email, password }: Request) {
    const user = await this.cachedUserRepository.findByEmail(email);

    if (!user || !(await this.passwordService.compare(password, user.passwordHash))) {
      this.logger.warn('Invalid credentials', { email });
      throw new AppError('Invalid credentials', 401);
    }

    if (user.isActive) throw new AppError('Account is already active', 409);

    await this.cachedUserRepository.reactivate(user.id);

    this.logger.info('User reactivated', { userId: user.id });

    const accessToken = this.authService.generateAccessToken(user.id);
    const refreshToken = await this.refreshTokenService.createForUser(user.id);

    return { accessToken, refreshToken };
  }
}
