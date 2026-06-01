import Agenda from '../models/agenda.model';
import Belong from '../models/belong.model';
import { AppError } from '../middlewares/error.middleware';

/**
 * Check if user has access to an agenda (user must be member of the agenda's family)
 */
export const checkAgendaAccess = async (userId: string, agendaId: string): Promise<void> => {
  const agenda = await Agenda.findByPk(agendaId);
  if (!agenda) throw new AppError('Agenda not found', 404);

  const belong = await Belong.findOne({
    where: { family_id: agenda.familyId, user_id: userId },
  });
  if (!belong) throw new AppError('Access denied to this agenda', 403);
};
