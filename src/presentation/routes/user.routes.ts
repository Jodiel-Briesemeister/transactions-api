import { Router } from 'express';
import { container } from '@shared/container';
import { UserController } from '@presentation/controllers/UserController';
import { authenticate } from '@presentation/middlewares/authenticate';
import { asyncHandler } from '@presentation/middlewares/asyncHandler';
import { validate } from '@presentation/middlewares/validate';
import { updateProfileSchema } from '@application/schemas/user';
import { globalRateLimiter } from '@presentation/middlewares/rateLimiter';

const router = Router();
router.use(authenticate);
router.use(globalRateLimiter);

const userController = container.resolve<UserController>('userController');

router.get(
  '/profile',
  asyncHandler((req, res) => userController.getProfile(req, res)),
);
router.patch(
  '/profile',
  validate(updateProfileSchema),
  asyncHandler((req, res) => userController.updateProfile(req, res)),
);
router.delete(
  '/account',
  asyncHandler((req, res) => userController.deactivateAccount(req, res)),
);

export default router;
