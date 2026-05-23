import { Router } from 'express';
import { container } from '@shared/container';
import { validate } from '@presentation/middlewares/validate';
import {
  loginSchema,
  logoutSchema,
  reactivateAccountSchema,
  refreshTokenSchema,
  registerSchema,
} from '@application/schemas/auth';
import { asyncHandler } from '@presentation/middlewares/asyncHandler';
import { authRateLimiter, loginRateLimiter } from '@presentation/middlewares/rateLimiter';
import { authenticate } from '@presentation/middlewares/authenticate';

const router = Router();
const authController = container.resolve('authController');

router.post(
  '/register',
  authRateLimiter,
  validate(registerSchema),
  asyncHandler((req, res) => authController.register(req, res)),
);
router.post(
  '/logout',
  authRateLimiter,
  authenticate,
  validate(logoutSchema),
  asyncHandler((req, res) => authController.logout(req, res)),
);
router.post(
  '/refresh',
  authRateLimiter,
  validate(refreshTokenSchema),
  asyncHandler((req, res) => authController.refreshToken(req, res)),
);

router.post(
  '/login',
  loginRateLimiter,
  validate(loginSchema),
  asyncHandler((req, res) => authController.login(req, res)),
);
router.post(
  '/reactivate',
  loginRateLimiter,
  validate(reactivateAccountSchema),
  asyncHandler((req, res) => authController.reactivateAccount(req, res)),
);

export default router;
