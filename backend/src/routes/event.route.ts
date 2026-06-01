import { Router } from 'express';
import * as eventController from '../controllers/event.controller';
import authMiddleware from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  getAllEventSchemaParams,
  getEventByIdSchemaParams,
  createEventSchemaBody,
  createEventSchemaParams,
  updateEventSchemaBody,
  updateEventSchemaParams,
  deleteEventSchemaParams,
} from '../schemas/event.schema';

const router = Router();

router.get(
  '/agenda/:agendaId/events',
  authMiddleware,
  validate(getAllEventSchemaParams, 'params'),
  eventController.getAllEvents,
);

router.get(
  '/:eventId',
  authMiddleware,
  validate(getEventByIdSchemaParams, 'params'),
  eventController.getEventById,
);

router.post(
  '/agenda/:agendaId/events',
  authMiddleware,
  validate(createEventSchemaParams, 'params'),
  validate(createEventSchemaBody, 'body'),
  eventController.createEvent,
);

router.put(
  '/:eventId',
  authMiddleware,
  validate(updateEventSchemaParams, 'params'),
  validate(updateEventSchemaBody, 'body'),
  eventController.updateEvent,
);

router.delete(
  '/:eventId',
  authMiddleware,
  validate(deleteEventSchemaParams, 'params'),
  eventController.deleteEvent,
);

export default router;
