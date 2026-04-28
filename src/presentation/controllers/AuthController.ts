import { Request, Response } from 'express';
import { RegisterUseCase } from '@application/usecases/auth/RegisterUseCase';
import { LoginUseCase } from '@application/usecases/auth/LoginUseCase';
import { LogoutUseCase } from '@application/usecases/auth/LogoutUseCase';
import { RefreshTokenUseCase } from '@application/usecases/auth/RefreshTokenUseCase';

export class AuthController {
  constructor(
    private registerUseCase: RegisterUseCase,
    private loginUseCase: LoginUseCase,
    private logoutUseCase: LogoutUseCase,
    private refreshTokenUseCase: RefreshTokenUseCase,
  ) {}

  async register(req: Request, res: Response) {
    const result = await this.registerUseCase.execute(req.body);
    return res.status(201).json(result);
  }

  async login(req: Request, res: Response) {
    const result = await this.loginUseCase.execute(req.body);
    return res.json(result);
  }

  async logout(req: Request, res: Response): Promise<Response> {
    await this.logoutUseCase.execute(req.body);
    return res.status(204).send();
  }

  async refreshToken(req: Request, res: Response) {
    const tokens = await this.refreshTokenUseCase.execute(req.body);
    return res.status(200).json(tokens);
  }
}
