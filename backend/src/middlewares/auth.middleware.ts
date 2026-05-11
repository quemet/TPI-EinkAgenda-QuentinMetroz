import { Response, NextFunction } from 'express';
import ExtendedRequest from '../types/express.type';
import JwtPayload from '../types/jwt.type';
import { getAuthPayload } from '../utils/auth.util';

const authMiddleware = (req: ExtendedRequest, _res: Response, next: NextFunction) => {
  try {
    const playload: JwtPayload = getAuthPayload(req);
    req.user = playload;
    next();
  } catch (error) {
    next(error);
  }
};

export default authMiddleware;
