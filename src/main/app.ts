import express from 'express';
import authRoutes from '@presentation/routes/auth.routes';
import healthRoutes from '@presentation/routes/health.routes';
// import transactionRoutes from '@presentation/routes/transaction.routes'; // TODO
import { container } from '@shared/container';
import { createErrorHandler } from '@presentation/middlewares/errorHandler';

export const app = express();
const logger = container.resolve('logger');

app.use(express.json());

app.use('/auth', authRoutes);
app.use('/', healthRoutes);
// app.use('/transactions', transactionRoutes); // TODO

app.use(createErrorHandler(logger));