import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validate } from '../middlewares/validate.middleware';
import { loginSchemaBody, registerSchemaBody } from '../schemas/auth.schema';

const router = Router();

router.post('/register', validate(registerSchemaBody, 'body'), authController.register);
router.post('/login', validate(loginSchemaBody, 'body'), authController.login);

export default router;
