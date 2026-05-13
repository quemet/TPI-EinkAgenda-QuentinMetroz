import { NextFunction, Response } from 'express';
import ExtendedRequest from '../types/express.type';
import * as agendaService from '../services/agenda.service';

export const getAllAgendas = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  const { familyId } = req.params as { familyId: string };
  const userId = req.user!.id;
  try {
    const agendas = await agendaService.getAllAgendas(familyId, userId);
    res.status(200).json(agendas);
  } catch (error) {
    next(error);
  }
};

export const getAgendaById = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  const { id, familyId } = req.params as { id: string; familyId: string };
  const userId = req.user!.id;

  try {
    const agenda = await agendaService.getAgendaById(id, familyId, userId);
    res.status(200).json(agenda);
  } catch (error) {
    next(error);
  }
};

export const createAgenda = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  const { familyId } = req.params as { familyId: string };
  const { name } = req.body;

  try {
    const agenda = await agendaService.createAgenda(name, familyId);
    res.status(201).json(agenda);
  } catch (error) {
    next(error);
  }
};

export const updateAgenda = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params as { id: string };
  const { name } = req.body;
  const userId = req.user!.id;

  try {
    const agenda = await agendaService.updateAgenda(id, name, userId);
    res.status(200).json(agenda);
  } catch (error) {
    next(error);
  }
};

export const deleteAgenda = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params as { id: string };
  const userId = req.user!.id;

  try {
    await agendaService.deleteAgenda(id, userId);
    res.status(200).json({ message: 'Agenda deleted successfully' });
  } catch (error) {
    next(error);
  }
};
