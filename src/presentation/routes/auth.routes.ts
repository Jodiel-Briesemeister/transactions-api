import { Router } from 'express';
import { container } from '@shared/container';
import { validate } from '@presentation/middlewares/validate';
import { loginSchema, logoutSchema, refreshTokenSchema, registerSchema } from '@application/schemas/auth';
import { asyncHandler } from '@presentation/middlewares/asyncHandler';

const router = Router();
const authController = container.resolve('authController');

router.post('/register', validate(registerSchema), asyncHandler((req, res) => authController.register(req, res)));
router.post('/login', validate(loginSchema), asyncHandler((req, res) => authController.login(req, res)));
router.post('/logout', validate(logoutSchema), asyncHandler((req, res) => authController.logout(req, res)));
router.post('/refresh', validate(refreshTokenSchema), asyncHandler((req, res) => authController.refreshToken(req, res)));

export default router;
