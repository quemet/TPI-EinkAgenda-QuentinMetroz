import ExtendedRequest from '../types/express.type';
import { Response, NextFunction } from 'express';
import * as familyService from '../services/family.service';

export const getUserFamily = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  const userId = req.user!.id;

  try {
    const family = await familyService.getUserFamily(userId);
    res.json(family);
  } catch (error) {
    next(error);
  }
};

export const getFamilyById = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  const { familyId } = req.params as { familyId: string };

  try {
    const family = await familyService.getFamilyById(familyId);
    res.json(family);
  } catch (error) {
    next(error);
  }
};

export const createFamily = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  const { name } = req.body;
  const userId = req.user!.id;

  try {
    const family = await familyService.createFamily(name, userId);
    res.status(201).json(family);
  } catch (error) {
    next(error);
  }
};

export const addUserToFamily = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  const { familyId } = req.params as { familyId: string };
  const { userId } = req.body as { userId: string };

  try {
    await familyService.addUserToFamily(familyId, userId);
    res.status(201).send();
  } catch (error) {
    next(error);
  }
};

export const addAdminToFamily = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  const { familyId } = req.params as { familyId: string };
  const targetUserId = req.body.userId;
  const userId = req.user!.id;

  try {
    await familyService.addAdminToFamily(familyId, targetUserId, userId);
    res.status(201).send();
  } catch (error) {
    next(error);
  }
};

export const updateFamily = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  const { familyId } = req.params as { familyId: string };
  const { name } = req.body;

  try {
    const family = await familyService.updateFamily(familyId, name);
    res.json(family);
  } catch (error) {
    next(error);
  }
};

export const deleteFamily = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  const { familyId } = req.params as { familyId: string };
  const userId = req.user!.id;

  try {
    await familyService.deleteFamily(familyId, userId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const removeUserFromFamily = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction,
) => {
  const { familyId } = req.params as { familyId: string };
  const targetUserId = req.body.userId;
  const userId = req.user!.id;

  try {
    await familyService.removeUserFromFamily(familyId, targetUserId, userId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
