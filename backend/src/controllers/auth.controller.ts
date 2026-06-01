import { Response, NextFunction, Request } from 'express';
import * as authService from '../services/auth.service';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, username } = req.body;
    const user = await authService.register({ email, password, username });
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const user = await authService.login({ email, password });
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};
