import { IUserRepository } from '@domain/interfaces/IUserRepository';
import { ILogger } from '@domain/interfaces/ILogger';
import { IPasswordService } from '@domain/interfaces/IPasswordService';
import { User } from '@domain/entities/User';
import { IAuthService } from '@domain/interfaces/IAuthService';
import { IRefreshTokenService } from '@domain/interfaces/IRefreshTokenService';
import { AppError } from '@domain/errors/AppError';
import { IUnitOfWork } from '@domain/interfaces/IUnitOfWork';
import { IAccountRepository } from '@domain/interfaces/IAccountRepository';

interface Request {
  name: string;
  email: string;
  password: string;
  phone: string | null;
}

export class RegisterUseCase {
  constructor(
    private cachedUserRepository: IUserRepository,
    private accountRepository: IAccountRepository,
    private passwordService: IPasswordService,
    private authService: IAuthService,
    private logger: ILogger,
    private refreshTokenService: IRefreshTokenService,
    private unitOfWork: IUnitOfWork,
  ) {}

  async execute({ name, email, password, phone }: Request) {
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
      phone,
    });

    const userId = await this.unitOfWork.transaction(async (trx) => {
      const id = await this.cachedUserRepository.create(user, trx);
      await this.accountRepository.create(id, trx);
      return id;
    });
    this.logger.info('User created', { userId });

    const accessToken = this.authService.generateAccessToken(userId);
    const refreshToken = await this.refreshTokenService.createForUser(userId);

    return {
      accessToken,
      refreshToken,
    };
  }
}
