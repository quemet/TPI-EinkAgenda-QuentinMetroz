import z from 'zod';
import { Request, Response, NextFunction } from 'express';

export const validate =
  (schema: z.ZodSchema, part: 'body' | 'params' | 'query') =>
  (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const data = req[part];
      const result = schema.parse(data);
      req[part] = result;
      next();
    } catch (err) {
      next(err);
    }
  };
