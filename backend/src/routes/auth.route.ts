import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validate } from '../middlewares/validate.middleware';
import { loginSchemaBody, registerSchemaBody } from '../schemas/auth.schema';
import { authLimiter } from '../middlewares/rateLimit.middleware';

const router = Router();

router.post(
  '/register',
  authLimiter,
  validate(registerSchemaBody, 'body'),
  authController.register,
);

router.post('/login', authLimiter, validate(loginSchemaBody, 'body'), authController.login);

export default router;
