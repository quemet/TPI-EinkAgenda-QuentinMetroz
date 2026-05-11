import { Request, Response, NextFunction } from 'express';
import z from 'zod';
import {
  ValidationError,
  UniqueConstraintError,
  ForeignKeyConstraintError,
  DatabaseError,
  ConnectionError,
} from 'sequelize';
import { env } from '../config/env';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message, status: err.statusCode });
    return;
  }

  if (err instanceof z.ZodError) {
    res.status(422).json({
      status: 422,
      message: 'Validation failed',
      errors: err.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    });
    return;
  }

  if (err instanceof ValidationError) {
    res.status(422).json({
      status: 422,
      message: 'Validation error',
      errors: err.errors.map((error) => ({
        field: error.path || 'unknown',
        message: error.message,
        type: error.type,
      })),
    });
    return;
  }

  if (err instanceof UniqueConstraintError) {
    const fields = Object.keys(err.fields || {});
    res.status(409).json({
      status: 409,
      message: `Duplicate entry for field(s): ${fields.join(', ')}`,
      fields,
    });
    return;
  }

  if (err instanceof ForeignKeyConstraintError) {
    res.status(409).json({
      status: 409,
      message: 'Foreign key constraint violated',
      detail: err.message,
      table: err.table,
      fields: err.fields,
    });
    return;
  }

  if (err instanceof DatabaseError) {
    res.status(500).json({
      status: 500,
      message: env.NODE_ENV === 'production' ? 'Database error occurred' : err.message,
      original: env.NODE_ENV === 'development' ? err.original?.message : undefined,
    });
    return;
  }

  if (err instanceof ConnectionError) {
    res.status(503).json({
      status: 503,
      message: 'Database connection failed',
      detail: env.NODE_ENV === 'development' ? err.message : 'Unable to connect to database',
    });
    return;
  }

  console.error(err);
  res.status(500).json({
    status: 500,
    message: env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
};
