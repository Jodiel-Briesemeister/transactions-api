import { describe, it, expect, vi } from 'vitest';
import { LoginUseCase } from '@application/usecases/auth/LoginUseCase';
import { AppError } from '@domain/errors/AppError';
import {
  makeLogger,
  makeUserRepository,
  makePasswordService,
  makeAuthService,
  makeRefreshTokenService,
  makeUser,
} from '../../helpers/mocks';

const makeSut = () => {
  const userRepository = makeUserRepository();
  const passwordService = makePasswordService();
  const authService = makeAuthService();
  const logger = makeLogger();
  const refreshTokenService = makeRefreshTokenService();

  const sut = new LoginUseCase(
    userRepository,
    passwordService,
    authService,
    logger,
    refreshTokenService,
  );

  return { sut, userRepository, passwordService, authService, refreshTokenService, logger };
};

const input = { email: 'user@test.com', password: 'secret123' };

describe('LoginUseCase', () => {
  it('should throw if user is not found', async () => {
    const { sut, userRepository } = makeSut();
    vi.mocked(userRepository.findByEmail).mockResolvedValue(null);

    await expect(sut.execute(input)).rejects.toThrow(new AppError('Invalid credentials', 401));
  });

  it('should throw if password is wrong', async () => {
    const { sut, userRepository, passwordService } = makeSut();
    vi.mocked(userRepository.findByEmail).mockResolvedValue(makeUser());
    vi.mocked(passwordService.compare).mockResolvedValue(false);

    await expect(sut.execute(input)).rejects.toThrow(new AppError('Invalid credentials', 401));
  });

  it('should throw if account is inactive', async () => {
    const { sut, userRepository, passwordService } = makeSut();
    vi.mocked(userRepository.findByEmail).mockResolvedValue(makeUser({ isActive: false }));
    vi.mocked(passwordService.compare).mockResolvedValue(true);

    await expect(sut.execute(input)).rejects.toThrow(
      new AppError('Account is inactive', 403, 'ACCOUNT_INACTIVE'),
    );
  });

  it('should return accessToken and refreshToken on success', async () => {
    const { sut, userRepository, passwordService } = makeSut();
    vi.mocked(userRepository.findByEmail).mockResolvedValue(makeUser());
    vi.mocked(passwordService.compare).mockResolvedValue(true);

    const result = await sut.execute(input);

    expect(result).toEqual({ accessToken: 'access-token', refreshToken: 'refresh-token' });
  });
});
