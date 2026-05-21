import { Response, NextFunction } from 'express';
import ExtendedRequest from '../types/express.type';
import * as userService from '../services/user.service';

export const getMe = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  const userId = req.user!.id;

  try {
    const user = await userService.getMe(userId);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const getFamilyUsers = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  const familyId = req.params.familyId as string;

  try {
    const users = await userService.getFamilyUsers(familyId);
    res.json(users);
  } catch (error) {
    next(error);
  }
};

export const updateMe = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  const userId = req.user!.id;
  const { type } = req.body as { type: 'young' | 'elder' };

  try {
    const user = await userService.updateMe(userId, type);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const deleteMe = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  const userId = req.user!.id;

  try {
    await userService.deleteMe(userId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
