import { AppError } from '../middlewares/error.middleware';
import User from '../models/user.model';
import JwtPayload from '../types/jwt.type';
import { LoginData, RegisterData } from '../types/auth.type';
import { hashPassword, generateToken, comparePassword } from '../utils/auth.util';

export const register = async (data: RegisterData) => {
  const { username, email, password } = data;

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) throw new AppError('Email already in use', 400);

  const user = await User.create({
    username,
    email,
    password: hashPassword(password),
    role: 'user', // Default role
    personType: 'young', // Default person type
  });

  const payload: JwtPayload = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    personType: user.personType,
  };

  const token = generateToken(payload);

  return { user, token };
};

export const login = async (data: LoginData) => {
  const { email, password } = data;

  const user = await User.findOne({ where: { email } });

  if (!user) throw new AppError('Invalid email or password', 401);

  const isMatch = comparePassword(password, user.password);

  if (!isMatch) throw new AppError('Invalid email or password', 401);

  const payload: JwtPayload = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    personType: user.personType,
  };

  const token = generateToken(payload);

  return { user, token };
};
