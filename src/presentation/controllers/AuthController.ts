import { Request, Response } from 'express';
import { RegisterUseCase } from '@application/usecases/auth/RegisterUseCase';
import { LoginUseCase } from '@application/usecases/auth/LoginUseCase';
import { LogoutUseCase } from '@application/usecases/auth/LogoutUseCase';
import { RefreshTokenUseCase } from '@application/usecases/auth/RefreshTokenUseCase';
import { ReactivateAccountUseCase } from '@application/usecases/auth/ReactivateAccountUseCase';

export class AuthController {
  constructor(
    private registerUseCase: RegisterUseCase,
    private loginUseCase: LoginUseCase,
    private logoutUseCase: LogoutUseCase,
    private refreshTokenUseCase: RefreshTokenUseCase,
    private reactivateAccountUseCase: ReactivateAccountUseCase,
  ) {}

  async register(req: Request, res: Response) {
    const result = await this.registerUseCase.execute(req.body);
    return res.status(201).json(result);
  }

  async login(req: Request, res: Response) {
    const result = await this.loginUseCase.execute(req.body);
    return res.json(result);
  }

  async logout(req: Request, res: Response) {
    const authHeader = req.headers.authorization;
    const accessToken = authHeader!.split(' ')[1]!;

    await this.logoutUseCase.execute({
      refreshToken: req.body.refreshToken,
      accessToken,
    });

    res.status(204).send();
  }

  async refreshToken(req: Request, res: Response) {
    const tokens = await this.refreshTokenUseCase.execute(req.body);
    return res.status(200).json(tokens);
  }

  async reactivateAccount(req: Request, res: Response) {
    const result = await this.reactivateAccountUseCase.execute(req.body);
    res.status(200).json(result);
  }
}
