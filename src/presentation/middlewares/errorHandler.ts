import { Request, Response, NextFunction } from 'express';
import { AppError } from '@domain/errors/AppError';
import { ILogger } from '@domain/interfaces/ILogger';

export function createErrorHandler(logger: ILogger) {
  return (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ message: err.message });
      return;
    }

    logger.error('Unexpected error', { message: err.message, stack: err.stack });
    res.status(500).json({ message: 'Internal server error' });
  };
}
