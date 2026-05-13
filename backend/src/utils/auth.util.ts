import { AppError } from '../middlewares/error.middleware';
import ExtendedRequest from '../types/express.type';
import JwtPayload from '../types/jwt.type';
import { extractToken, verifyToken } from './jwt.util';
import { sign, SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import bcrypt from 'bcrypt';

export const getAuthPayload = (req: ExtendedRequest): JwtPayload => {
  const token = extractToken(req);

  if (!token) throw new AppError('Authorization token is missing', 401);

  return verifyToken(token);
};

export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

export const generateToken = (payload: JwtPayload) => {
  const secret = env.JWT.SECRET;
  const expiresIn = env.JWT.EXPIRES_IN as SignOptions['expiresIn'];

  if (!secret) throw new AppError('JWT secret not configured', 500);
  if (!expiresIn) throw new AppError('JWT expiration not configured', 500);

  const token = sign(payload, secret, { expiresIn });

  return token;
};

export const comparePassword = async (password: string, hashedPassword: string) => {
  return await bcrypt.compare(password, hashedPassword);
};
