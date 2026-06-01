import User from '../models/user.model';
import Belong from '../models/belong.model';
import { AppError } from '../middlewares/error.middleware';

export const getMe = async (userId: string) => {
  const user = await User.findByPk(userId);
  if (!user) throw new AppError('User not found', 404);
  return user;
};

export const getFamilyUsers = async (familyId: string) => {
  const belongs = await Belong.findAll({ where: { family_id: familyId } });
  const userIds = belongs.map((belong) => belong.user_id);
  const users = await User.findAll({ where: { id: userIds } });
  return users;
};

export const updateMe = async (userId: string, personType: 'young' | 'elder') => {
  const user = await User.findByPk(userId);
  if (!user) throw new AppError('User not found', 404);
  user.personType = personType;
  await user.save();
  return user;
};

export const deleteMe = async (userId: string) => {
  const user = await User.findByPk(userId);
  if (!user) throw new AppError('User not found', 404);
  await user.destroy();
  return;
};
