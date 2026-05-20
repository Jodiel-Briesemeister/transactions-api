import { Router } from 'express';
import { container } from '@shared/container';
import { TransactionController } from '@presentation/controllers/TransactionController';
import { validate } from '@presentation/middlewares/validate';
import { authenticate } from '@presentation/middlewares/authenticate';
import { asyncHandler } from '@presentation/middlewares/asyncHandler';
import { depositSchema, withdrawSchema, transferSchema } from '@application/schemas/transaction';
import { globalRateLimiter } from '@presentation/middlewares/rateLimiter';

const router = Router();
router.use(authenticate);
router.use(globalRateLimiter);

const transactionController = container.resolve<TransactionController>('transactionController');

router.get('/', asyncHandler((req, res) => transactionController.listTransactions(req, res)));
router.get('/balance', asyncHandler((req, res) => transactionController.getBalance(req, res)));
router.post('/deposit', validate(depositSchema), asyncHandler((req, res) => transactionController.deposit(req, res)));
router.post('/withdraw', validate(withdrawSchema), asyncHandler((req, res) => transactionController.withdraw(req, res)));
router.post('/transfer', validate(transferSchema), asyncHandler((req, res) => transactionController.transfer(req, res)));

export default router;
