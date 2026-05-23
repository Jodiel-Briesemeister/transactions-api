import { Request, Response } from 'express';
import { GetProfileUseCase } from '@application/usecases/user/GetProfileUseCase';
import { UpdateProfileUseCase } from '@application/usecases/user/UpdateProfileUseCase';
import { DeactivateAccountUseCase } from '@application/usecases/user/DeactivateAccountUseCase';

export class UserController {
  constructor(
    private getProfileUseCase: GetProfileUseCase,
    private updateProfileUseCase: UpdateProfileUseCase,
    private deactivateAccountUseCase: DeactivateAccountUseCase,
  ) {}

  async getProfile(req: Request, res: Response) {
    const result = await this.getProfileUseCase.execute({ userId: req.userId });
    res.status(200).json(result);
  }

  async updateProfile(req: Request, res: Response) {
    const result = await this.updateProfileUseCase.execute({
      userId: req.userId,
      ...req.body,
    });

    res.status(200).json(result);
  }

  async deactivateAccount(req: Request, res: Response) {
    await this.deactivateAccountUseCase.execute({ userId: req.userId });
    res.status(204).send();
  }
}
