import { AppError } from '../middlewares/error.middleware';
import ExtendedRequest from '../types/express.type';
import JwtPayload from '../types/jwt.type';
import { extractToken, verifyToken } from './jwt.util';

export const getAuthPayload = (req: ExtendedRequest): JwtPayload => {
  const token = extractToken(req);

  if (!token) throw new AppError('Authorization token is missing', 401);

  return verifyToken(token);
};
