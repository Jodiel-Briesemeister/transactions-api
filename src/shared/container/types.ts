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
import { IRefreshTokenService } from '@domain/interfaces/IRefreshTokenService';
import { ICacheService } from '@domain/interfaces/ICacheService';
import { GetProfileUseCase } from '@application/usecases/user/GetProfileUseCase';
import { UpdateProfileUseCase } from '@application/usecases/user/UpdateProfileUseCase';
import { UserController } from '@presentation/controllers/UserController';
import { IUnitOfWork } from '@domain/interfaces/IUnitOfWork';
import { TransactionController } from '@presentation/controllers/TransactionController';
import { DepositUseCase } from '@application/usecases/transaction/DepositUseCase';
import { GetBalanceUseCase } from '@application/usecases/transaction/GetBalanceUseCase';
import { ListTransactionsUseCase } from '@application/usecases/transaction/ListTransactionsUseCase';
import { TransferUseCase } from '@application/usecases/transaction/TransferUseCase';
import { WithdrawUseCase } from '@application/usecases/transaction/WithdrawUseCase';
import { IAccountRepository } from '@domain/interfaces/IAccountRepository';
import { ITransactionRepository } from '@domain/interfaces/ITransactionRepository';
import { DeactivateAccountUseCase } from '@application/usecases/user/DeactivateAccountUseCase';
import { ReactivateAccountUseCase } from '@application/usecases/auth/ReactivateAccountUseCase';
import Redis from 'ioredis';
import { Knex } from 'knex';
import { ITokenBlacklistService } from '@domain/interfaces/ITokenBlacklistService';
import { HealthService } from '@infrastructure/services/HealthService';

export interface Cradle {
  // infra
  db: Knex;
  redis: Redis;
  unitOfWork: IUnitOfWork;
  logger: ILogger;
  cacheService: ICacheService;
  tokenBlacklistService: ITokenBlacklistService;
  healthService: HealthService;

  // repositories
  userRepository: IUserRepository;
  cachedUserRepository: IUserRepository;
  refreshTokenRepository: IRefreshTokenRepository;
  accountRepository: IAccountRepository;
  transactionRepository: ITransactionRepository;
  
  // services
  passwordService: IPasswordService;
  authService: IAuthService;
  refreshTokenService: IRefreshTokenService;

  // use cases - auth
  registerUseCase: RegisterUseCase;
  loginUseCase: LoginUseCase;
  logoutUseCase: LogoutUseCase;
  refreshTokenUseCase: RefreshTokenUseCase;

  // use cases - user
  getProfileUseCase: GetProfileUseCase;
  updateProfileUseCase: UpdateProfileUseCase;
  deactivateAccountUseCase: DeactivateAccountUseCase;
  reactivateAccountUseCase: ReactivateAccountUseCase;

  // use cases - transaction
  depositUseCase: DepositUseCase;
  withdrawUseCase: WithdrawUseCase;
  transferUseCase: TransferUseCase;
  getBalanceUseCase: GetBalanceUseCase;
  listTransactionsUseCase: ListTransactionsUseCase;

  // controllers
  authController: AuthController;
  userController: UserController;
  transactionController: TransactionController;
}
