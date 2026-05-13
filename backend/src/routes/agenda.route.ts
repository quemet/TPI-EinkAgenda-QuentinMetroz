import { Router } from 'express';
import * as agendaController from '../controllers/agenda.controller';
import { validate } from '../middlewares/validate.middleware';
import authMiddleware from '../middlewares/auth.middleware';
import {
  getAllAgendasSchemaParams,
  getAgendaByIdSchemaParams,
  createAgendaSchemaBody,
  createAgendaSchemaParams,
  updateAgendaSchemaBody,
  updateAgendaSchemaParams,
  deleteAgendaSchemaParams,
} from '../schemas/agenda.schema';

const router = Router();

router.get(
  '/:familyId',
  authMiddleware,
  validate(getAllAgendasSchemaParams, 'params'),
  agendaController.getAllAgendas,
);
router.get(
  '/:familyId/:id',
  authMiddleware,
  validate(getAgendaByIdSchemaParams, 'params'),
  agendaController.getAgendaById,
);
router.post(
  '/:familyId',
  authMiddleware,
  validate(createAgendaSchemaParams, 'params'),
  validate(createAgendaSchemaBody, 'body'),
  agendaController.createAgenda,
);
router.put(
  '/:id',
  authMiddleware,
  validate(updateAgendaSchemaParams, 'params'),
  validate(updateAgendaSchemaBody, 'body'),
  agendaController.updateAgenda,
);
router.delete(
  '/:id',
  authMiddleware,
  validate(deleteAgendaSchemaParams, 'params'),
  agendaController.deleteAgenda,
);

export default router;
