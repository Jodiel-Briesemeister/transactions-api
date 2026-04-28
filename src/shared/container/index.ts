import { env } from '@shared/env';
import { createContainer, asClass, asFunction, InjectionMode } from 'awilix';
import { Cradle } from '@shared/container/types';
import { createKnexConnection } from '@infrastructure/database/knex';
import { UserRepository } from '@infrastructure/database/repositories/UserRepository';
import { WinstonLogger } from '@infrastructure/logger/WinstonLogger';
import { PasswordService } from '@infrastructure/services/PasswordService';
import { AuthService } from '@infrastructure/services/AuthService';
import { RefreshTokenRepository } from '@infrastructure/database/repositories/RefreshTokenRepository';
import { RefreshTokenService } from '@infrastructure/services/RefreshTokenService';
import { RegisterUseCase } from '@application/usecases/auth/RegisterUseCase';
import { LoginUseCase } from '@application/usecases/auth/LoginUseCase';
import { LogoutUseCase } from '@application/usecases/auth/LogoutUseCase';
import { RefreshTokenUseCase } from '@application/usecases/auth/RefreshTokenUseCase';
import { AuthController } from '@presentation/controllers/AuthController';
import { CachedUserRepository } from '@infrastructure/database/repositories/CachedUserRepository';
import { RedisCacheService } from '@infrastructure/services/RedisCacheService';

export const container = createContainer<Cradle>({
  injectionMode: InjectionMode.CLASSIC,
});

container.register({
  // infra
  db: asFunction(createKnexConnection).singleton(),
  logger: asClass(WinstonLogger).singleton(),
  cacheService: asClass(RedisCacheService).singleton(),

  // repositories
  userRepository: asClass(UserRepository).singleton(),
  cachedUserRepository: asClass(CachedUserRepository).singleton(),
  refreshTokenRepository: asClass(RefreshTokenRepository).singleton(),

  // services
  passwordService: asClass(PasswordService).singleton(),
  authService: asClass(AuthService).inject(() => ({
    jwtSecret: env.jwtSecret,
  })).singleton(),
  refreshTokenService: asClass(RefreshTokenService).inject(() => ({
    expiresInDays: env.refreshTokenExpiresInDays,
  })).singleton(),

  // use cases
  registerUseCase: asClass(RegisterUseCase).singleton(),
  loginUseCase: asClass(LoginUseCase).singleton(),
  logoutUseCase: asClass(LogoutUseCase).singleton(),
  refreshTokenUseCase: asClass(RefreshTokenUseCase).singleton(),

  // controllers
  authController: asClass(AuthController).singleton(),
});
