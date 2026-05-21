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
import { GetProfileUseCase } from '@application/usecases/user/GetProfileUseCase';
import { UpdateProfileUseCase } from '@application/usecases/user/UpdateProfileUseCase';
import { KnexUnitOfWork } from '@infrastructure/database/KnexUnitOfWork';
import { DepositUseCase } from '@application/usecases/transaction/DepositUseCase';
import { GetBalanceUseCase } from '@application/usecases/transaction/GetBalanceUseCase';
import { ListTransactionsUseCase } from '@application/usecases/transaction/ListTransactionsUseCase';
import { TransferUseCase } from '@application/usecases/transaction/TransferUseCase';
import { WithdrawUseCase } from '@application/usecases/transaction/WithdrawUseCase';
import { AccountRepository } from '@infrastructure/database/repositories/AccountRepository';
import { TransactionRepository } from '@infrastructure/database/repositories/TransactionRepository';
import { TransactionController } from '@presentation/controllers/TransactionController';
import { UserController } from '@presentation/controllers/UserController';
import { DeactivateAccountUseCase } from '@application/usecases/user/DeactivateAccountUseCase';
import { ReactivateAccountUseCase } from '@application/usecases/auth/ReactivateAccountUseCase';
import { createRedisConnection } from '@infrastructure/redis/createRedisConnection';
import { TokenBlacklistService } from '@infrastructure/services/TokenBlacklistService';
import { HealthService } from '@infrastructure/services/HealthService';

export const container = createContainer<Cradle>({
  injectionMode: InjectionMode.CLASSIC,
});

container.register({
  // infra
  db: asFunction(createKnexConnection).singleton(),
  unitOfWork: asClass(KnexUnitOfWork).singleton(),
  logger: asClass(WinstonLogger).singleton(),
  redis: asFunction(createRedisConnection).singleton(),
  cacheService: asClass(RedisCacheService).singleton(),
  tokenBlacklistService: asClass(TokenBlacklistService).singleton(),
  healthService: asClass(HealthService).singleton(),

  // repositories
  userRepository: asClass(UserRepository).singleton(),
  cachedUserRepository: asClass(CachedUserRepository).singleton(),
  refreshTokenRepository: asClass(RefreshTokenRepository).singleton(),
  accountRepository: asClass(AccountRepository).singleton(),
  transactionRepository: asClass(TransactionRepository).singleton(),

  // services
  passwordService: asClass(PasswordService).singleton(),
  authService: asClass(AuthService).inject(() => ({ jwtSecret: env.jwtSecret })).singleton(),
  refreshTokenService: asClass(RefreshTokenService).inject(() => ({ expiresInDays: env.refreshTokenExpiresInDays })).singleton(),

  // use cases - auth
  registerUseCase: asClass(RegisterUseCase).singleton(),
  loginUseCase: asClass(LoginUseCase).singleton(),
  logoutUseCase: asClass(LogoutUseCase).singleton(),
  refreshTokenUseCase: asClass(RefreshTokenUseCase).singleton(),

  // use cases - user
  getProfileUseCase: asClass(GetProfileUseCase).singleton(),
  updateProfileUseCase: asClass(UpdateProfileUseCase).singleton(),
  deactivateAccountUseCase: asClass(DeactivateAccountUseCase).singleton(),
  reactivateAccountUseCase: asClass(ReactivateAccountUseCase).singleton(),

  // use cases - transaction
  depositUseCase: asClass(DepositUseCase).singleton(),
  withdrawUseCase: asClass(WithdrawUseCase).singleton(),
  transferUseCase: asClass(TransferUseCase).singleton(),
  getBalanceUseCase: asClass(GetBalanceUseCase).singleton(),
  listTransactionsUseCase: asClass(ListTransactionsUseCase).singleton(),

  // controllers
  authController: asClass(AuthController).singleton(),
  userController: asClass(UserController).singleton(),
  transactionController: asClass(TransactionController).singleton(),
});
