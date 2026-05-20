import { IUserRepository } from '@domain/interfaces/IUserRepository';
import { ILogger } from '@domain/interfaces/ILogger';
import { IPasswordService } from '@domain/interfaces/IPasswordService';
import { IAuthService } from '@domain/interfaces/IAuthService';
import { IRefreshTokenService } from '@domain/interfaces/IRefreshTokenService';
import { AppError } from '@domain/errors/AppError';

interface Request {
  email: string;
  password: string;
}

export class LoginUseCase {
  constructor(
    private cachedUserRepository: IUserRepository,
    private passwordService: IPasswordService,
    private authService: IAuthService,
    private logger: ILogger,
    private refreshTokenService: IRefreshTokenService,
  ) {}

  async execute({ email, password }: Request) {
    const user = await this.cachedUserRepository.findByEmail(email);

    if (!user || !(await this.passwordService.compare(password, user.passwordHash))) {
      this.logger.warn('Invalid credentials', { email });
      throw new AppError('Invalid credentials', 401);
    }

    if (!user.isActive) {
      throw new AppError('Account is inactive', 403, 'ACCOUNT_INACTIVE');
    }

    const accessToken = this.authService.generateAccessToken(user.id);
    const refreshToken = await this.refreshTokenService.createForUser(user.id);
    this.logger.info('User logged in', { userId: user.id });

    return {
      accessToken,
      refreshToken,
    };
  }
}
