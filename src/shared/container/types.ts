import { ILogger } from '@domain/interfaces/ILogger';
import { IUserRepository } from '@domain/interfaces/IUserRepository';
import { RegisterUseCase } from '@application/usecases/auth/RegisterUseCase';
import { AuthController } from '@presentation/controllers/AuthController';
import { IPasswordService } from '@domain/interfaces/IPasswordService';
import { IAuthService } from '@domain/interfaces/IAuthService';
import { IRefreshTokenRepository } from '@domain/interfaces/IRefreshTokenRepository';
import { LoginUseCase } from '@application/usecases/auth/LoginUseCase';
import { LogoutUseCase } from '@application/usecases/auth/LogoutUseCase';
import { RefreshTokenUseCase } from '@application/usecases/auth/RefreshTokenUseCase';
import { Knex } from 'knex';
import { IRefreshTokenService } from '@domain/interfaces/IRefreshTokenService';
import { ICacheService } from '@domain/interfaces/ICacheService';

export interface Cradle {
  // infra
  db: Knex;
  logger: ILogger;
  cacheService: ICacheService;

  // repositories
  userRepository: IUserRepository;
  cachedUserRepository: IUserRepository;
  refreshTokenRepository: IRefreshTokenRepository;

  // services
  passwordService: IPasswordService;
  authService: IAuthService;
  refreshTokenService: IRefreshTokenService;

  // use cases
  registerUseCase: RegisterUseCase;
  loginUseCase: LoginUseCase;
  logoutUseCase: LogoutUseCase;
  refreshTokenUseCase: RefreshTokenUseCase;

  // controllers
  authController: AuthController;
}
