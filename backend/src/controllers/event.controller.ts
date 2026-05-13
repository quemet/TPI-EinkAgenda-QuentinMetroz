import * as eventService from '../services/event.service';
import ExtendedRequest from '../types/express.type';
import { Response, NextFunction } from 'express';

export const getAllEvents = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  const { agendaId } = req.params as { agendaId: string };

  try {
    const events = await eventService.getAllEvents(req.user!.id, agendaId);
    res.status(200).json(events);
  } catch (error) {
    next(error);
  }
};

export const getEventById = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  const { eventId } = req.params as { eventId: string };
  try {
    const event = await eventService.getEventById(req.user!.id, eventId);
    res.status(200).json(event);
  } catch (error) {
    next(error);
  }
};

export const createEvent = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  const { agendaId } = req.params as { agendaId: string };
  const eventData = req.body;

  try {
    const event = await eventService.createEvent(req.user!.id, agendaId, eventData);
    res.status(201).json(event);
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  const { eventId } = req.params as { eventId: string };
  const eventData = req.body;

  try {
    const event = await eventService.updateEvent(req.user!.id, eventId, eventData);
    res.status(200).json(event);
  } catch (error) {
    next(error);
  }
};

export const deleteEvent = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  const { eventId } = req.params as { eventId: string };

  try {
    await eventService.deleteEvent(req.user!.id, eventId);
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    next(error);
  }
};
