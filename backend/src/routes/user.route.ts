import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import authMiddleware from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { getFamilyUsersSchemaParams, updateMeSchemaBody } from '../schemas/user.schema';

const router = Router();

router.get('/me', authMiddleware, userController.getMe);
router.get(
  '/family/:familyId/users',
  authMiddleware,
  validate(getFamilyUsersSchemaParams, 'params'),
  userController.getFamilyUsers,
);
router.put('/me', authMiddleware, validate(updateMeSchemaBody, 'body'), userController.updateMe);
router.delete('/me', authMiddleware, userController.deleteMe);

export default router;
