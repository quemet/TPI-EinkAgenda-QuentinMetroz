import ExtendedRequest from '../types/express.type';
import JwtPayload from '../types/jwt.type';
import { env } from '../config/env';
import z from 'zod';
import { verify, sign, TokenExpiredError, JsonWebTokenError, type SignOptions } from 'jsonwebtoken';
import validTokenSchema from '../schemas/jwt.schema';

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
      throw new Error(messages.invalidPayload);
    }

    return schema.parse(decoded) as z.infer<T>;
  } catch (error) {
    if (error instanceof Error) throw error;
    if (error instanceof TokenExpiredError) throw new Error(messages.expired);
    if (error instanceof JsonWebTokenError) throw new Error(messages.invalid);
    if (error instanceof z.ZodError) throw new Error(messages.invalidStructure);
    throw error;
  }
};

export const verifyToken = (token: string): JwtPayload => {
  const secret = env.JWT.SECRET;

  if (!secret) throw new Error('JWT secret is not defined in environment variables');

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

  if (!secret) throw new Error('JWT secret is not defined in environment variables');

  const accessToken = sign(payload, secret, {
    expiresIn: (env.JWT.EXPIRES_IN || '7d') as SignOptions['expiresIn'],
  });

  return accessToken;
};
