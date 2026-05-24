import { describe, it, expect, vi } from 'vitest';
import { DeactivateAccountUseCase } from '@application/usecases/user/DeactivateAccountUseCase';
import { AppError } from '@domain/errors/AppError';
import {
  makeUserRepository,
  makeRefreshTokenRepository,
  makeLogger,
  makeUser,
} from '../../helpers/mocks';

const makeSut = () => {
  const userRepository = makeUserRepository();
  const refreshTokenRepository = makeRefreshTokenRepository();
  const logger = makeLogger();

  const sut = new DeactivateAccountUseCase(userRepository, refreshTokenRepository, logger);

  return { sut, userRepository, refreshTokenRepository, logger };
};

describe('DeactivateAccountUseCase', () => {
  const userId = 'user-id';

  it('should throw if user is not found', async () => {
    const { sut, userRepository } = makeSut();
    vi.mocked(userRepository.findById).mockResolvedValue(null);

    await expect(sut.execute({ userId })).rejects.toThrow(new AppError('User not found', 404));
  });

  it('should delete all refresh tokens for the user', async () => {
    const { sut, userRepository, refreshTokenRepository } = makeSut();
    vi.mocked(userRepository.findById).mockResolvedValue(makeUser());

    await sut.execute({ userId });

    expect(refreshTokenRepository.deleteAllByUser).toHaveBeenCalledWith(userId);
  });

  it('should deactivate the user', async () => {
    const { sut, userRepository } = makeSut();
    vi.mocked(userRepository.findById).mockResolvedValue(makeUser());

    await sut.execute({ userId });

    expect(userRepository.deactivate).toHaveBeenCalledWith(userId);
  });
});
