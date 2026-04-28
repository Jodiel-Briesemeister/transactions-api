import winston from 'winston';
import { ILogger } from '@domain/interfaces/ILogger';
import { env } from 'shared/env';

export class WinstonLogger implements ILogger {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: env.logLevel,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
      transports: [new winston.transports.Console()],
    });
  }

  info(message: string, meta?: unknown): void {
    this.logger.info(message, meta);
  }

  error(message: string, meta?: unknown): void {
    this.logger.error(message, meta);
  }

  warn(message: string, meta?: unknown): void {
    this.logger.warn(message, meta);
  }
}
