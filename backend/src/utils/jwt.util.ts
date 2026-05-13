import ExtendedRequest from '../types/express.type';
import JwtPayload from '../types/jwt.type';
import { env } from '../config/env';
import z from 'zod';
import { verify, sign, TokenExpiredError, JsonWebTokenError, type SignOptions } from 'jsonwebtoken';
import validTokenSchema from '../schemas/jwt.schema';
import { AppError } from '../middlewares/error.middleware';

const decodedAndValidate = <T extends z.ZodTypeAny>(
  token: string,
  secret: string,
  schema: T,
  messages: {
    invalidPayload: string;
    expired: string;
    invalid: string;
    invalidStructure: string;
  },
): z.infer<T> => {
  try {
    const decoded = verify(token, secret);

    if (typeof decoded !== 'object' || decoded === null) {
      throw new AppError(messages.invalidPayload, 400);
    }

    return schema.parse(decoded) as z.infer<T>;
  } catch (error) {
    if (error instanceof TokenExpiredError) throw new AppError(messages.expired, 401);
    if (error instanceof JsonWebTokenError) throw new AppError(messages.invalid, 401);
    if (error instanceof z.ZodError) throw new AppError(messages.invalidStructure, 401);
    if (error instanceof Error) throw error;
    throw error;
  }
};

export const verifyToken = (token: string): JwtPayload => {
  const secret = env.JWT.SECRET;

  if (!secret) throw new AppError('JWT secret is not defined', 500);

  const valdated = decodedAndValidate(token, secret, validTokenSchema, {
    invalidPayload: 'Invalid token payload',
    expired: 'Token has expired',
    invalid: 'Invalid token',
    invalidStructure: 'Invalid token payload structure',
  });

  return valdated;
};

export const extractToken = (req: ExtendedRequest): string | null => {
  const authHeader = req.headers.authorization;

  if (!authHeader) return null;

  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer') return null;

  return token;
};

export const generateToken = (payload: JwtPayload): string => {
  const secret = env.JWT.SECRET;

  if (!secret) throw new AppError('JWT secret is not defined', 500);

  const accessToken = sign(payload, secret, {
    expiresIn: (env.JWT.EXPIRES_IN || '7d') as SignOptions['expiresIn'],
  });

  return accessToken;
};
