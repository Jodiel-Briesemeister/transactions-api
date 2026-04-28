import { ZodType, z } from 'zod';
import { Request, Response, NextFunction } from 'express';

export function validate(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        message: 'Invalid input',
        errors: z.treeifyError(result.error),
      });
      return;
    }

    req.body = result.data;
    next();
  };
}
