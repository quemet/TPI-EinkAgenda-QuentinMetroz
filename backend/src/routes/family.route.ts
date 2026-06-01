import { Router } from 'express';
import * as familyController from '../controllers/family.controller';
import { validate } from '../middlewares/validate.middleware';
import authMiddleware from '../middlewares/auth.middleware';
import {
  getFamilyByIdSchemaParams,
  createFamilySchemaBody,
  addUserToFamilySchemaParams,
  addUserToFamilySchemaBody,
  addAdminToFamilySchemaParams,
  addAdminToFamilySchemaBody,
  updateFamilySchemaParams,
  updateFamilySchemaBody,
  deleteFamilySchemaParams,
  removeUserFromFamilySchemaParams,
  removeUserFromFamilySchemaBody,
} from '../schemas/family.schema';

const router = Router();

router.get('/', authMiddleware, familyController.getUserFamily);

router.get(
  '/:familyId',
  authMiddleware,
  validate(getFamilyByIdSchemaParams, 'params'),
  familyController.getFamilyById,
);

router.post(
  '/',
  authMiddleware,
  validate(createFamilySchemaBody, 'body'),
  familyController.createFamily,
);

router.post(
  '/:familyId/users',
  authMiddleware,
  validate(addUserToFamilySchemaParams, 'params'),
  validate(addUserToFamilySchemaBody, 'body'),
  familyController.addUserToFamily,
);

router.post(
  '/:familyId/admins',
  authMiddleware,
  validate(addAdminToFamilySchemaParams, 'params'),
  validate(addAdminToFamilySchemaBody, 'body'),
  familyController.addAdminToFamily,
);

router.put(
  '/:familyId',
  authMiddleware,
  validate(updateFamilySchemaParams, 'params'),
  validate(updateFamilySchemaBody, 'body'),
  familyController.updateFamily,
);

router.delete(
  '/:familyId',
  authMiddleware,
  validate(deleteFamilySchemaParams, 'params'),
  familyController.deleteFamily,
);

router.delete(
  '/:familyId/users',
  authMiddleware,
  validate(removeUserFromFamilySchemaParams, 'params'),
  validate(removeUserFromFamilySchemaBody, 'body'),
  familyController.removeUserFromFamily,
);

export default router;
