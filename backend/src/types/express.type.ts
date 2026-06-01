import { Request } from 'express';
import JwtPayload from './jwt.type';

export default interface ExtendedRequest extends Request {
  user?: JwtPayload;
}
