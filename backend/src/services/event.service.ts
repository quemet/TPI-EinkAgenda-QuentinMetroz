import Event from '../models/event.model';
import { AppError } from '../middlewares/error.middleware';
import EventData from '../types/event.type';
import { checkAgendaAccess } from '../utils/event.util';

export const getAllEvents = async (userId: string, agendaId: string) => {
  await checkAgendaAccess(userId, agendaId);
  const events = await Event.findAll({ where: { agendaId } });

  if (events.length === 0) throw new AppError('Events not found', 404);

  return events;
};

export const getEventById = async (userId: string, eventId: string) => {
  const event = await Event.findByPk(eventId);

  if (!event) throw new AppError('Event not found', 404);

  await checkAgendaAccess(userId, event.agendaId);

  return event;
};

export const createEvent = async (userId: string, agendaId: string, eventData: EventData) => {
  await checkAgendaAccess(userId, agendaId);
  const event = await Event.create({ ...eventData, agendaId });
  return event;
};

export const updateEvent = async (userId: string, eventId: string, eventData: EventData) => {
  const event = await Event.findByPk(eventId);

  if (!event) throw new AppError('Event not found', 404);

  await checkAgendaAccess(userId, event.agendaId);

  await event.update(eventData);

  return event;
};

export const deleteEvent = async (userId: string, eventId: string) => {
  const event = await Event.findByPk(eventId);

  if (!event) throw new AppError('Event not found', 404);

  await checkAgendaAccess(userId, event.agendaId);

  await event.destroy();
};
