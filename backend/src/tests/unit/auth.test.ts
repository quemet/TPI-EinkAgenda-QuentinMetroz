import { describe, expect, test } from '@jest/globals';
import '../setup';
import { RegisterData, LoginData } from '../../types/auth.type';
import { register, login } from '../../services/auth.service';
import { verifyToken } from '../../utils/jwt.util';

describe('Auth tests', () => {
  describe('Register tests', () => {
    test('should register a new user', async () => {
      const data: RegisterData = {
        username: 'testuser',
        email: 'test@gmail.com',
        password: 'password123',
      };

      const { user, token } = await register(data);

      expect(user).toBeDefined();
      expect(token).toBeDefined();
      expect(user.username).toBe(data.username);
      expect(user.email).toBe(data.email);
      expect(user.password).toBe(''); // Password should be hidden
      expect(token.split('.')).toHaveLength(3); // JWT tokens have 3 parts
      expect(() => verifyToken(token)).not.toThrow(); // Token should be valid
    });

    test('should not register with existing email', async () => {
      // First register a user
      const firstData: RegisterData = {
        username: 'testuser',
        email: 'test@gmail.com',
        password: 'password123',
      };
      await register(firstData);

      // Try to register with the same email
      const duplicateData: RegisterData = {
        username: 'testuser2',
        email: 'test@gmail.com',
        password: 'password123',
      };

      await expect(register(duplicateData)).rejects.toThrow('Email already in use');
    });
  });

  describe('Login tests', () => {
    test('should login with correct credentials', async () => {
      const data: LoginData = {
        email: 'test@gmail.com',
        password: 'password123',
      };

      const reg_data: RegisterData = {
        username: 'testuser',
        email: 'test@gmail.com',
        password: 'password123',
      };

      // Ensure the user is registered before trying to log in
      await register(reg_data);

      const { user, token } = await login(data);

      expect(user).toBeDefined();
      expect(token).toBeDefined();
      expect(user.email).toBe(data.email);
      expect(user.password).toBe(''); // Password should be hidden
      expect(token.split('.')).toHaveLength(3); // JWT tokens have 3 parts
      expect(() => verifyToken(token)).not.toThrow(); // Token should be valid
    });

    test('should not login with incorrect password', async () => {
      const data: LoginData = {
        email: 'test@gmail.com',
        password: 'wrongpassword',
      };

      await expect(login(data)).rejects.toThrow('Invalid email or password');
    });

    test('should not login with non-existent email', async () => {
      const data: LoginData = {
        email: 'test+1@gmail.com', // Email that doesn't exist
        password: 'password123',
      };

      await expect(login(data)).rejects.toThrow('Invalid email or password');
    });
  });
});
