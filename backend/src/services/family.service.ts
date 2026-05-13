import Belong from '../models/belong.model';
import Family from '../models/family.model';
import Appertain from '../models/appertain.model';
import User from '../models/user.model';
import Agenda from '../models/agenda.model';
import Event from '../models/event.model';
import { sequelize } from '../config/db';
import { AppError } from '../middlewares/error.middleware';

export const getUserFamily = async (userId: string) => {
  const belongs = await Belong.findAll({ where: { user_id: userId } });
  const familyIds = belongs.map((b) => b.family_id);

  if (familyIds.length === 0) return [];

  const families = await Family.findAll({ where: { id: familyIds } });
  return families;
};

export const getFamilyById = async (FamilyId: string) => {
  const family = await Family.findOne({ where: { id: FamilyId } });
  if (!family) throw new AppError('Family not found', 404);
  return family;
};

export const createFamily = async (name: string, userId: string) => {
  const t = await sequelize.transaction();
  try {
    const family = await Family.create({ name }, { transaction: t });

    await Belong.create(
      {
        user_id: userId,
        family_id: family.id,
      },
      { transaction: t },
    );

    await Appertain.create(
      {
        family_adminId: userId,
        family_id: family.id,
      },
      { transaction: t },
    );

    await t.commit();
    return family;
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

export const updateFamily = async (FamilyId: string, name: string) => {
  const family = await Family.findOne({
    where: {
      id: FamilyId,
    },
  });

  if (!family) throw new AppError('Family not found', 404);

  family.name = name;
  await family.save();

  return family;
};

export const addUserToFamily = async (FamilyId: string, userId: string) => {
  const family = await Family.findByPk(FamilyId);
  if (!family) throw new AppError('Family not found', 404);

  const user = await User.findByPk(userId);
  if (!user) throw new AppError('User not found', 404);

  const existing = await Belong.findOne({ where: { user_id: userId, family_id: FamilyId } });
  if (existing) throw new AppError('User already belongs to family', 409);

  await Belong.create({ user_id: userId, family_id: FamilyId });
};

export const removeUserFromFamily = async (
  FamilyId: string,
  targetUserId: string,
  userId: string,
) => {
  const isTargetAdmin = await Appertain.findOne({
    where: {
      family_id: FamilyId,
      family_adminId: targetUserId,
    },
  });

  const isUserAdmin = await Appertain.findOne({
    where: {
      family_id: FamilyId,
      family_adminId: userId,
    },
  });

  if (isTargetAdmin) throw new AppError('Admin cannot be removed from family', 400);
  if (!isUserAdmin) throw new AppError('Only admin can remove user from family', 403);

  const removed = await Belong.destroy({ where: { user_id: targetUserId, family_id: FamilyId } });
  if (removed === 0) throw new AppError('User is not a member of this family', 404);
};

export const addAdminToFamily = async (FamilyId: string, targetUserId: string, userId: string) => {
  const isUserAdmin = await Appertain.findOne({
    where: {
      family_id: FamilyId,
      family_adminId: userId,
    },
  });

  if (!isUserAdmin) throw new AppError('Only admin can add another admin to family', 403);
  const family = await Family.findByPk(FamilyId);
  if (!family) throw new AppError('Family not found', 404);

  const user = await User.findByPk(targetUserId);
  if (!user) throw new AppError('User not found', 404);

  const existing = await Appertain.findOne({
    where: { family_adminId: targetUserId, family_id: FamilyId },
  });
  if (existing) throw new AppError('User is already an admin for this family', 409);

  await Appertain.create({ family_adminId: targetUserId, family_id: FamilyId });
};

export const deleteFamily = async (FamilyId: string, userId: string) => {
  const isUserAdmin = await Appertain.findOne({
    where: {
      family_id: FamilyId,
      family_adminId: userId,
    },
  });

  if (!isUserAdmin) throw new AppError('Only admin can delete family', 403);
  const t = await sequelize.transaction();
  try {
    await Belong.destroy({ where: { family_id: FamilyId }, transaction: t });
    await Appertain.destroy({ where: { family_id: FamilyId }, transaction: t });

    const agendas = await Agenda.findAll({ where: { familyId: FamilyId }, transaction: t });
    const agendaIds = agendas.map((a) => a.id);

    if (agendaIds.length > 0) {
      await Event.destroy({ where: { agendaId: agendaIds }, transaction: t });
      await Agenda.destroy({ where: { id: agendaIds }, transaction: t });
    }

    await Family.destroy({ where: { id: FamilyId }, transaction: t });

    await t.commit();
  } catch (err) {
    await t.rollback();
    throw err;
  }
};
