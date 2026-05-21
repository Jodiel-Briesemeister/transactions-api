import express from 'express';
import { trace } from '@opentelemetry/api';
import authRoutes from '@presentation/routes/auth.routes';
import healthRoutes from '@presentation/routes/health.routes';
import transactionRoutes from '@presentation/routes/transaction.routes';
import { container } from '@shared/container';
import { createErrorHandler } from '@presentation/middlewares/errorHandler';
import userRoutes from '@presentation/routes/user.routes';

export const app = express();
const logger = container.resolve('logger');

app.use(express.json());

app.use((_req, res, next) => {
  const span = trace.getActiveSpan();
  if (span) {
    res.setHeader('X-Trace-ID', span.spanContext().traceId);
  }
  next();
});

app.use('/', healthRoutes);
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/transactions', transactionRoutes);

app.use(createErrorHandler(logger));