import Agenda from '../models/agenda.model';
import Belong from '../models/belong.model';
import Family from '../models/family.model';
import { AppError } from '../middlewares/error.middleware';

export const isUserCanAccess = async (agenda: Agenda, userId: string) => {
  const belongs = await Belong.findAll({ where: { user_id: userId } }).then((belong) =>
    belong.map((b) => b.family_id),
  );
  if (belongs.length === 0) throw new AppError('Access denied', 403);
  const families = await Family.findAll({ where: { id: belongs } });

  const haveAccess = families.some((family) => family.id === agenda.familyId);
  if (!haveAccess) throw new AppError('Access denied', 403);
  return true;
};
