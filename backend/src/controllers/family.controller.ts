import ExtendedRequest from '../types/express.type';
import { Response, NextFunction } from 'express';
import * as familyService from '../services/family.service';
import { isUserCanAccessFamily } from '../utils/agenda.util';
import Appertain from '../models/appertain.model';
import { AppError } from '../middlewares/error.middleware';

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
  const userId = req.user!.id;

  try {
    const family = await familyService.getFamilyById(familyId);
    await isUserCanAccessFamily(familyId, userId);
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
  const requesterId = req.user!.id;

  try {
    // ensure family exists first (returns 404 if not)
    await familyService.getFamilyById(familyId);
    // only admins of the family can add users
    await isUserCanAccessFamily(familyId, requesterId);
    const isAdmin = await Appertain.findOne({
      where: { family_id: familyId, family_adminId: requesterId },
    });
    if (!isAdmin) throw new AppError('Only admin can add user to family', 403);

    if (userId === requesterId) throw new AppError('Cannot add yourself to family', 422);
    const targetIsAdmin = await Appertain.findOne({
      where: { family_id: familyId, family_adminId: userId },
    });
    if (targetIsAdmin) throw new AppError('User is already admin', 422);
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
  const userId = req.user!.id;

  try {
    await familyService.getFamilyById(familyId);
    await isUserCanAccessFamily(familyId, userId);
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
  const { familyId, targetUserId } = req.params as { familyId: string; targetUserId: string };
  const userId = req.user!.id;

  try {
    await familyService.removeUserFromFamily(familyId, targetUserId, userId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
