import Belong from '../models/belong.model';
import Family from '../models/family.model';
import Appertain from '../models/appertain.model';
import { AppError } from '../middlewares/error.middleware';

export const getUserFamilly = async (userId: string) => {
  const families_id = await Belong.findAll({
    where: {
      user_id: userId,
    },
  }).then((belong) => belong.map((b) => b.family_id));

  if (!families_id) return [];

  const families = await Promise.all(
    families_id.map(async (family_id) => {
      const familyData = await Family.findOne({
        where: {
          id: family_id,
        },
      });
      return familyData;
    }),
  );
  return families;
};

export const getFamillyById = async (famillyId: string) => {
  const family = await Family.findOne({
    where: {
      id: famillyId,
    },
  });
  if (!family) throw new Error('Family not found');
  return family;
};

export const createFamilly = async (name: string, userId: string) => {
  const family = await Family.create({
    name: name,
  });

  await Belong.create({
    user_id: userId,
    family_id: family.id,
  });

  await Appertain.create({
    family_adminId: userId,
    family_id: family.id,
  });

  return family;
};

export const updateFamilly = async (famillyId: string, name: string) => {
  const family = await Family.findOne({
    where: {
      id: famillyId,
    },
  });

  if (!family) throw new AppError('Family not found', 404);

  family.name = name;
  await family.save();

  return family;
};

export const addUserToFamilly = async (famillyId: string, userId: string) => {
  await Belong.create({
    user_id: userId,
    family_id: famillyId,
  });
};

export const removeUserFromFamilly = async (famillyId: string, userId: string) => {
  await Belong.destroy({
    where: {
      user_id: userId,
      family_id: famillyId,
    },
  });
};

export const addAdminToFamilly = async (famillyId: string, userId: string) => {
  await Appertain.create({
    family_adminId: userId,
    family_id: famillyId,
  });
};

export const deleteFamilly = async (famillyId: string) => {
  await Family.destroy({
    where: {
      id: famillyId,
    },
  });
};
