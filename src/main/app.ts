import express from 'express';
import cors from 'cors';
import { trace } from '@opentelemetry/api';
import authRoutes from '@presentation/routes/auth.routes';
import healthRoutes from '@presentation/routes/health.routes';
import transactionRoutes from '@presentation/routes/transaction.routes';
import { container } from '@shared/container';
import { createErrorHandler } from '@presentation/middlewares/errorHandler';
import userRoutes from '@presentation/routes/user.routes';
import { env } from '@shared/env';

export const app = express();
const logger = container.resolve('logger');

app.disable('x-powered-by');
app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json());
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

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
