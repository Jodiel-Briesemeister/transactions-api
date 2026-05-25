import { describe, it, expect, vi } from 'vitest';
import { ReactivateAccountUseCase } from '@application/usecases/auth/ReactivateAccountUseCase';
import { AppError } from '@domain/errors/AppError';
import {
  makeUserRepository,
  makePasswordService,
  makeAuthService,
  makeRefreshTokenService,
  makeLogger,
  makeUser,
  makeMessagePublisher,
} from '../../helpers/mocks';

const makeSut = () => {
  const userRepository = makeUserRepository();
  const passwordService = makePasswordService();
  const authService = makeAuthService();
  const refreshTokenService = makeRefreshTokenService();
  const logger = makeLogger();
  const messagePublisher = makeMessagePublisher();

  const sut = new ReactivateAccountUseCase(
    userRepository,
    passwordService,
    authService,
    refreshTokenService,
    logger,
    messagePublisher,
  );

  return { sut, userRepository, passwordService, authService, refreshTokenService, logger };
};

describe('ReactivateAccountUseCase', () => {
  const email = 'user@test.com';
  const password = 'plain-password';

  describe('authentication', () => {
    it('should throw if user is not found', async () => {
      const { sut, userRepository } = makeSut();
      vi.mocked(userRepository.findByEmail).mockResolvedValue(null);

      await expect(sut.execute({ email, password })).rejects.toThrow(
        new AppError('Invalid credentials', 401),
      );
    });

    it('should throw if password is wrong', async () => {
      const { sut, userRepository, passwordService } = makeSut();
      vi.mocked(userRepository.findByEmail).mockResolvedValue(makeUser({ isActive: false }));
      vi.mocked(passwordService.compare).mockResolvedValue(false);

      await expect(sut.execute({ email, password })).rejects.toThrow(
        new AppError('Invalid credentials', 401),
      );
    });
  });

  describe('business rules', () => {
    it('should throw if account is already active', async () => {
      const { sut, userRepository, passwordService } = makeSut();
      vi.mocked(userRepository.findByEmail).mockResolvedValue(makeUser({ isActive: true }));
      vi.mocked(passwordService.compare).mockResolvedValue(true);

      await expect(sut.execute({ email, password })).rejects.toThrow(
        new AppError('Account is already active', 409),
      );
    });
  });

  describe('success', () => {
    it('should reactivate the user', async () => {
      const { sut, userRepository, passwordService } = makeSut();
      const user = makeUser({ isActive: false });
      vi.mocked(userRepository.findByEmail).mockResolvedValue(user);
      vi.mocked(passwordService.compare).mockResolvedValue(true);

      await sut.execute({ email, password });

      expect(userRepository.reactivate).toHaveBeenCalledWith(user.id);
    });

    it('should return access and refresh tokens', async () => {
      const { sut, userRepository, passwordService } = makeSut();
      vi.mocked(userRepository.findByEmail).mockResolvedValue(makeUser({ isActive: false }));
      vi.mocked(passwordService.compare).mockResolvedValue(true);

      const result = await sut.execute({ email, password });

      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
    });
  });
});
