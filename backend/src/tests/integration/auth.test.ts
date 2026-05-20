import request from 'supertest';
import app from '../../server';
import { describe, test, expect } from '@jest/globals';
import { RegisterData, LoginData } from '../../types/auth.type';
import { verifyToken } from '../../utils/jwt.util';

describe('Auth API Integration Tests', () => {
  describe('POST /api/auth/register', () => {
    test('should register a new user', async () => {
      const data: RegisterData = {
        username: 'integrationtestuser',
        email: 'test@gmail.com',
        password: 'password123',
      };

      const response = await request(app).post('/api/auth/register').send(data).expect(201);

      expect(response.body).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.token).toBeDefined();
      expect(response.body.user.username).toBe(data.username);
      expect(response.body.user.email).toBe(data.email);
      expect(response.body.user.password).toBe('');
      expect(response.body.token.split('.')).toHaveLength(3);
      expect(() => verifyToken(response.body.token)).not.toThrow();
    });

    test('should not register with existing email', async () => {
      const data: RegisterData = {
        username: 'integrationtestuser2',
        email: 'test@gmail.com', // Same email as before
        password: 'password123',
      };

      const response = await request(app).post('/api/auth/register').send(data).expect(400);

      expect(response.body).toBeDefined();
      expect(response.body.error).toBe('Email already in use');
    });

    test('should not register with missing fields', async () => {
      const data = {
        username: 'integrationtestuser3',
        password: 'password123',
      };

      const response = await request(app).post('/api/auth/register').send(data).expect(422);

      expect(response.body).toBeDefined();
      expect(response.body.error).toBe('Validation of the data failed');
    });
  });

  describe('POST /api/auth/login', () => {
    test('should login with correct credentials', async () => {
      const data: LoginData = {
        email: 'test@gmail.com',
        password: 'password123',
      };

      const response = await request(app).post('/api/auth/login').send(data).expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.token).toBeDefined();
    });

    test('should not login with incorrect password', async () => {
      const data: LoginData = {
        email: 'test@gmail.com',
        password: 'wrongpassword',
      };

      const response = await request(app).post('/api/auth/login').send(data).expect(401);

      expect(response.body).toBeDefined();
      expect(response.body.error).toBe('Invalid email or password');
    });

    test('should not login with non-existent email', async () => {
      const data: LoginData = {
        email: 'nonexistent@gmail.com',
        password: 'password123',
      };

      const response = await request(app).post('/api/auth/login').send(data).expect(401);

      expect(response.body).toBeDefined();
      expect(response.body.error).toBe('Invalid email or password');
    });

    test('should not login with missing fields', async () => {
      const data = {
        email: 'test@gmail.com',
      };

      const response = await request(app).post('/api/auth/login').send(data).expect(422);

      expect(response.body).toBeDefined();
      expect(response.body.error).toBe('Validation of the data failed');
    });
  });
});
