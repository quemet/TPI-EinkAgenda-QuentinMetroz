import Event from '../models/event.model';
import { AppError } from '../middlewares/error.middleware';
import EventData from '../types/event.type';

export const getAllEvents = async (agendaId: string) => {
  const events = await Event.findAll({ where: { agendaId } });

  if (events.length === 0) throw new AppError('Events not found', 404);

  return events;
};

export const getEventById = async (eventId: string) => {
  const event = await Event.findByPk(eventId);

  if (!event) throw new AppError('Event not found', 404);

  return event;
};

export const createEvent = async (agendaId: string, eventData: EventData) => {
  const event = await Event.create({ ...eventData, agendaId });
  return event;
};

export const updateEvent = async (eventId: string, eventData: EventData) => {
  const event = await Event.findByPk(eventId);

  if (!event) throw new AppError('Event not found', 404);

  await event.update(eventData);

  return event;
};

export const deleteEvent = async (eventId: string) => {
  const event = await Event.findByPk(eventId);

  if (!event) throw new AppError('Event not found', 404);

  await event.destroy();
};
