import { Request, Response, NextFunction } from 'express';
import { AppError } from './error.middleware';

export const notFoundMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  next(new AppError(`Route ${req.method} ${req.originalUrl} not found`, 404));
};
