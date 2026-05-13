import { AppError } from '../middlewares/error.middleware';
import Agenda from '../models/agenda.model';
import { isUserCanAccess } from '../utils/agenda.util';

export const getAllAgendas = async (familyId: string, userId: string) => {
  const agendas = await Agenda.findAll({ where: { familyId } });
  if (agendas.length === 0) throw new AppError('No agendas found', 404);
  const accessibleAgendas = agendas.filter((agenda) => isUserCanAccess(agenda, userId));
  return accessibleAgendas;
};

export const getAgendaById = async (id: string, familyId: string, userId: string) => {
  const agenda = await Agenda.findOne({ where: { id, familyId } });
  if (!agenda) throw new AppError('Agenda not found', 404);
  const isAccessible = await isUserCanAccess(agenda, userId);
  if (!isAccessible) throw new AppError('Access denied', 403);
  return agenda;
};

export const createAgenda = async (name: string, familyId: string) => {
  const agenda = await Agenda.create({ name, familyId });
  return agenda;
};

export const updateAgenda = async (id: string, name: string, userId: string) => {
  const agenda = await Agenda.findByPk(id);
  if (!agenda) throw new AppError('Agenda not found', 404);
  const isAccessible = await isUserCanAccess(agenda, userId);
  if (!isAccessible) throw new AppError('Access denied', 403);
  agenda.name = name;
  await agenda.save();
  return agenda;
};

export const deleteAgenda = async (id: string, userId: string) => {
  const agenda = await Agenda.findByPk(id);
  if (!agenda) throw new AppError('Agenda not found', 404);
  const isAccessible = await isUserCanAccess(agenda, userId);
  if (!isAccessible) throw new AppError('Access denied', 403);
  await agenda.destroy();
  return;
};
