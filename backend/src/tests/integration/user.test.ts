import request from 'supertest';
import app from '../../server';
import { describe, test, expect, beforeEach, afterAll } from '@jest/globals';
import { sequelize } from '../../config/db';
import User from '../../models/user.model';
import { register } from '../../services/auth.service';
import { RegisterData } from '../../types/auth.type';

// Helper to create test user and get token
const createUser = async (username: string, email: string) => {
  const data: RegisterData = {
    username,
    email,
    password: 'password123',
  };
  const { user, token } = await register(data);
  return {
    token: `Bearer ${token}`,
    userId: user.id,
    user,
  };
};

describe('User Integration tests', () => {
  beforeEach(async () => {
    // Clear User table before each test
    await User.destroy({ where: {} });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('GET /api/users/me', () => {
    test('should return user data without password', async () => {
      const { token, userId } = await createUser('testuser1', 'test1@gmail.com');

      const res = await request(app).get('/api/users/me').set('Authorization', token);

      expect(res.status).toBe(200);
      expect(res.body).toBeDefined();
      expect(res.body.id).toBe(userId);
      expect(res.body.username).toBe('testuser1');
      expect(res.body.email).toBe('test1@gmail.com');
      expect(res.body.personType).toBeDefined();
      expect(res.body.role).toBeDefined();
    });

    test('should return 401 if not authenticated', async () => {
      const res = await request(app).get('/api/users/me');

      expect(res.status).toBe(401);
      expect(res.body.error).toBeDefined();
    });
  });

  describe('PUT /api/users/me', () => {
    test('should update user personType to young', async () => {
      const { token } = await createUser('testuser2', 'test2@gmail.com');

      const res = await request(app)
        .put('/api/users/me')
        .set('Authorization', token)
        .send({ type: 'young' });

      expect(res.status).toBe(200);
      expect(res.body).toBeDefined();
      expect(res.body.personType).toBe('young');
    });

    test('should update user personType to elder', async () => {
      const { token } = await createUser('testuser3', 'test3@gmail.com');

      const res = await request(app)
        .put('/api/users/me')
        .set('Authorization', token)
        .send({ type: 'elder' });

      expect(res.status).toBe(200);
      expect(res.body).toBeDefined();
      expect(res.body.personType).toBe('elder');
    });

    test('should persist update in database', async () => {
      const { token } = await createUser('testuser4', 'test4@gmail.com');

      await request(app).put('/api/users/me').set('Authorization', token).send({ type: 'young' });

      const res = await request(app).get('/api/users/me').set('Authorization', token);

      expect(res.status).toBe(200);
      expect(res.body.personType).toBe('young');
    });

    test('should return 401 if not authenticated', async () => {
      const res = await request(app).put('/api/users/me').send({ type: 'young' });

      expect(res.status).toBe(401);
      expect(res.body.error).toBeDefined();
    });

    test('should return 422 if missing type', async () => {
      const { token } = await createUser('testuser5', 'test5@gmail.com');

      const res = await request(app).put('/api/users/me').set('Authorization', token).send({});

      expect(res.status).toBe(422);
      expect(res.body.error).toBeDefined();
    });

    test('should return 422 if invalid type', async () => {
      const { token } = await createUser('testuser6', 'test6@gmail.com');

      const res = await request(app)
        .put('/api/users/me')
        .set('Authorization', token)
        .send({ type: 'invalid' });

      expect(res.status).toBe(422);
      expect(res.body.error).toBeDefined();
    });
  });

  describe('DELETE /api/users/me', () => {
    test('should delete user', async () => {
      const { token } = await createUser('testuser7', 'test7@gmail.com');

      const deleteRes = await request(app).delete('/api/users/me').set('Authorization', token);

      expect(deleteRes.status).toBe(204);

      // Verify user is deleted by trying to get it
      const getRes = await request(app).get('/api/users/me').set('Authorization', token);

      // After deletion, the JWT should still be valid, but the user should be gone
      expect(getRes.status).toBe(404);
      expect(getRes.body.error).toBe('User not found');
    });

    test('should return 401 if not authenticated', async () => {
      const res = await request(app).delete('/api/users/me');

      expect(res.status).toBe(401);
      expect(res.body.error).toBeDefined();
    });
  });
});
