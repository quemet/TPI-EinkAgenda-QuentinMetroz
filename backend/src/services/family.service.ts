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

export const getFamilyById = async (familyId: string) => {
  const family = await Family.findOne({ where: { id: familyId } });
  if (!family) throw new AppError('Family not found', 404);
  return family;
};

export const createFamily = async (name: string, userId: string) => {
  // Some sqlite drivers used in tests may not support transaction on the connection
  // (eg. better-sqlite3 vs sqlite3 differences). Try using a transaction and
  // fall back to non-transactional creation if transactions are not supported.
  try {
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
  } catch (err) {
    // Fallback path without transactions for environments that don't support them
    const family = await Family.create({ name });
    await Belong.create({ user_id: userId, family_id: family.id });
    await Appertain.create({ family_adminId: userId, family_id: family.id });
    return family;
  }
};

export const updateFamily = async (familyId: string, name: string) => {
  const family = await Family.findOne({
    where: {
      id: familyId,
    },
  });

  if (!family) throw new AppError('Family not found', 404);

  family.name = name;
  await family.save();

  return family;
};

export const addUserToFamily = async (familyId: string, userId: string) => {
  const family = await Family.findByPk(familyId);
  if (!family) throw new AppError('Family not found', 404);

  const user = await User.findByPk(userId);
  if (!user) throw new AppError('User not found', 404);

  const existing = await Belong.findOne({ where: { user_id: userId, family_id: familyId } });
  if (existing) throw new AppError('User already belongs to family', 409);

  await Belong.create({ user_id: userId, family_id: familyId });
};

export const removeUserFromFamily = async (
  familyId: string,
  targetUserId: string,
  userId: string,
) => {
  const isTargetAdmin = await Appertain.findOne({
    where: {
      family_id: familyId,
      family_adminId: targetUserId,
    },
  });

  const isUserAdmin = await Appertain.findOne({
    where: {
      family_id: familyId,
      family_adminId: userId,
    },
  });

  const family = await Family.findByPk(familyId);
  if (!family) throw new AppError('Family not found', 404);

  if (isTargetAdmin) throw new AppError('Admin cannot be removed from family', 400);
  if (!isUserAdmin) throw new AppError('Only admin can remove user from family', 403);

  const removed = await Belong.destroy({ where: { user_id: targetUserId, family_id: familyId } });
  if (removed === 0) throw new AppError('User is not a member of this family', 404);
};

export const addAdminToFamily = async (familyId: string, targetUserId: string, userId: string) => {
  const isUserAdmin = await Appertain.findOne({
    where: {
      family_id: familyId,
      family_adminId: userId,
    },
  });

  if (!isUserAdmin) throw new AppError('Only admin can add another admin to family', 403);
  const family = await Family.findByPk(familyId);
  if (!family) throw new AppError('Family not found', 404);

  const user = await User.findByPk(targetUserId);
  if (!user) throw new AppError('User not found', 404);

  const existing = await Appertain.findOne({
    where: { family_adminId: targetUserId, family_id: familyId },
  });
  if (existing) throw new AppError('User is already an admin for this family', 409);

  await Appertain.create({ family_adminId: targetUserId, family_id: familyId });
};

export const deleteFamily = async (familyId: string, userId: string) => {
  const family = await Family.findByPk(familyId);
  if (!family) throw new AppError('Family not found', 404);
  const isUserAdmin = await Appertain.findOne({
    where: {
      family_id: familyId,
      family_adminId: userId,
    },
  });

  if (!isUserAdmin) throw new AppError('Only admin can delete family', 403);
  try {
    const t = await sequelize.transaction();
    try {
      await Belong.destroy({ where: { family_id: familyId }, transaction: t });
      await Appertain.destroy({ where: { family_id: familyId }, transaction: t });

      const agendas = await Agenda.findAll({ where: { familyId: familyId }, transaction: t });
      const agendaIds = agendas.map((a) => a.id);

      if (agendaIds.length > 0) {
        await Event.destroy({ where: { agendaId: agendaIds }, transaction: t });
        await Agenda.destroy({ where: { id: agendaIds }, transaction: t });
      }

      await Family.destroy({ where: { id: familyId }, transaction: t });

      await t.commit();
    } catch (err) {
      await t.rollback();
      throw err;
    }
  } catch (err) {
    // Fallback to non-transactional deletes for sqlite drivers without transaction support
    await Belong.destroy({ where: { family_id: familyId } });
    await Appertain.destroy({ where: { family_id: familyId } });

    const agendas = await Agenda.findAll({ where: { familyId: familyId } });
    const agendaIds = agendas.map((a) => a.id);

    if (agendaIds.length > 0) {
      await Event.destroy({ where: { agendaId: agendaIds } });
      await Agenda.destroy({ where: { id: agendaIds } });
    }

    await Family.destroy({ where: { id: familyId } });
  }
};
