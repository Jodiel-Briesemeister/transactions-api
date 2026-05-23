import { describe, it, expect, vi } from 'vitest';
import { RegisterUseCase } from '@application/usecases/auth/RegisterUseCase';
import { AppError } from '@domain/errors/AppError';
import {
  makeLogger,
  makeUnitOfWork,
  makeAccountRepository,
  makeUserRepository,
  makePasswordService,
  makeAuthService,
  makeRefreshTokenService,
  makeUser,
} from '../../helpers/mocks';

const makeSut = () => {
  const userRepository = makeUserRepository();
  const accountRepository = makeAccountRepository();
  const passwordService = makePasswordService();
  const authService = makeAuthService();
  const logger = makeLogger();
  const refreshTokenService = makeRefreshTokenService();
  const unitOfWork = makeUnitOfWork();

  const sut = new RegisterUseCase(
    userRepository,
    accountRepository,
    passwordService,
    authService,
    logger,
    refreshTokenService,
    unitOfWork,
  );

  return {
    sut,
    userRepository,
    accountRepository,
    passwordService,
    authService,
    refreshTokenService,
    logger,
  };
};

const input = {
  name: 'name test',
  email: 'user@test.com',
  password: 'Secure@9mB',
  phone: null,
};

describe('RegisterUseCase', () => {
  it('should throw if email is already registered', async () => {
    const { sut, userRepository } = makeSut();
    vi.mocked(userRepository.findByEmail).mockResolvedValue(makeUser());

    await expect(sut.execute(input)).rejects.toThrow(new AppError('User already exists', 409));
  });

  it('should warn when email already exists', async () => {
    const { sut, userRepository, logger } = makeSut();
    vi.mocked(userRepository.findByEmail).mockResolvedValue(makeUser());

    await expect(sut.execute(input)).rejects.toThrow();
    expect(logger.warn).toHaveBeenCalledWith('User already exists', { email: input.email });
  });

  it('should hash the password before saving', async () => {
    const { sut, userRepository, passwordService } = makeSut();
    vi.mocked(userRepository.findByEmail).mockResolvedValue(null);
    vi.mocked(userRepository.create).mockResolvedValue('new-user-id');
    vi.mocked(passwordService.hash).mockResolvedValue('hashed-password');

    await sut.execute(input);

    expect(passwordService.hash).toHaveBeenCalledWith(input.password);
  });

  it('should return accessToken and refreshToken on success', async () => {
    const { sut, userRepository, passwordService } = makeSut();
    vi.mocked(userRepository.findByEmail).mockResolvedValue(null);
    vi.mocked(userRepository.create).mockResolvedValue('new-user-id');
    vi.mocked(passwordService.hash).mockResolvedValue('hashed-password');

    const result = await sut.execute(input);

    expect(result).toEqual({ accessToken: 'access-token', refreshToken: 'refresh-token' });
  });
});
