import { Request, Response, NextFunction } from 'express';
import { AppError } from '@domain/errors/AppError';
import { ILogger } from '@domain/interfaces/ILogger';

export function createErrorHandler(logger: ILogger) {
  return (err: Error, req: Request, res: Response, _next: NextFunction): void => {
    if (err instanceof SyntaxError && 'body' in err) {
      res.status(400).json({ message: 'Invalid JSON' });
      return;
    }

    if (err instanceof AppError) {
      res
        .status(err.statusCode)
        .json({ message: err.message, ...(err.code && { code: err.code }) });
      return;
    }

    logger.error('Unexpected error', {
      message: err.message,
      stack: err.stack,
      method: req.method,
      url: req.url,
    });
    res.status(500).json({ message: 'Internal server error' });
  };
}
