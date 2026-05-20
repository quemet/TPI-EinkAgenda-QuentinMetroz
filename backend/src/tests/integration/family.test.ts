import request from 'supertest';
import app from '../../server';
import { describe, test, expect } from '@jest/globals';
import '../setup';
import { register } from '../../services/auth.service';
import { createFamily } from '../../services/family.service';
import Belong from '../../models/belong.model';

describe('Family Integration tests', () => {
  const createUser = async (username: string, email: string) => {
    const response = await register({ username, email, password: 'password123' });
    return { token: `Bearer ${response.token}`, userId: response.user.id };
  };

  describe('GET /api/families', () => {
    test('should get all families of the user', async () => {
      const { token, userId } = await createUser('int-family-1', 'int-family-1@test.com');
      await createFamily('F1', userId);

      const response = await request(app).get('/api/families').set({ Authorization: token });
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
    });

    test('should return empty array if user has no family', async () => {
      const { token } = await createUser('int-family-2', 'int-family-2@test.com');
      const response = await request(app).get('/api/families').set({ Authorization: token });
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(0);
    });
  });

  describe('GET /api/families/:familyId', () => {
    test('should get family by ID', async () => {
      const { token, userId } = await createUser('int-family-3', 'int-family-3@test.com');
      const family = await createFamily('MyFam', userId);

      const response = await request(app)
        .get(`/api/families/${family.id}`)
        .set({ Authorization: token });
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(family.id);
    });

    test('should return 404 if family not found', async () => {
      const { token } = await createUser('int-family-4', 'int-family-4@test.com');
      const fakeId = '550e8400-e29b-41d4-a716-446655440000';

      const response = await request(app)
        .get(`/api/families/${fakeId}`)
        .set({ Authorization: token });
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Family not found');
    });

    test('should return 403 if access denied', async () => {
      const { userId } = await createUser('int-family-5', 'int-family-5@test.com');
      const { token: token2 } = await createUser('int-family-6', 'int-family-6@test.com');
      const family = await createFamily('Secret', userId);

      const response = await request(app)
        .get(`/api/families/${family.id}`)
        .set({ Authorization: token2 });
      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Access denied');
    });

    test('should return 422 if invalid family ID', async () => {
      const { token } = await createUser('int-family-7', 'int-family-7@test.com');
      const invalidId = 'invalid-uuid';

      const response = await request(app)
        .get(`/api/families/${invalidId}`)
        .set({ Authorization: token });
      expect(response.status).toBe(422);
    });
  });

  describe('POST /api/families', () => {
    test('should create a new family', async () => {
      const { token } = await createUser('int-family-8', 'int-family-8@test.com');

      const response = await request(app)
        .post('/api/families')
        .set({ Authorization: token })
        .send({ name: 'NewF' });
      expect(response.status).toBe(201);
      expect(response.body.name).toBe('NewF');
    });

    test('should return 422 if missing name', async () => {
      const { token } = await createUser('int-family-9', 'int-family-9@test.com');
      const response = await request(app)
        .post('/api/families')
        .set({ Authorization: token })
        .send({});
      expect(response.status).toBe(422);
    });
  });

  describe('POST /api/families/:familyId/users', () => {
    test('should add user to family', async () => {
      const { token, userId } = await createUser('int-family-10', 'int-family-10@test.com');
      const { userId: targetId } = await createUser('int-family-11', 'int-family-11@test.com');
      const family = await createFamily('FAdd', userId);

      const response = await request(app)
        .post(`/api/families/${family.id}/users`)
        .set({ Authorization: token })
        .send({ userId: targetId });

      expect(response.status).toBe(201);
      const belong = await Belong.findOne({ where: { user_id: targetId, family_id: family.id } });
      expect(belong).not.toBeNull();
    });

    test('should return 404 if family not found', async () => {
      const { token } = await createUser('int-family-12', 'int-family-12@test.com');
      const fakeId = '550e8400-e29b-41d4-a716-446655440000';
      const { userId: targetId } = await createUser('int-family-13', 'int-family-13@test.com');

      const response = await request(app)
        .post(`/api/families/${fakeId}/users`)
        .set({ Authorization: token })
        .send({ userId: targetId });
      expect(response.status).toBe(404);
    });

    test('should return 403 if access denied', async () => {
      const { userId } = await createUser('int-family-14', 'int-family-14@test.com');
      const { token: token2 } = await createUser('int-family-15', 'int-family-15@test.com');
      const { userId: targetId } = await createUser('int-family-16', 'int-family-16@test.com');
      const family = await createFamily('FNo', userId);

      const response = await request(app)
        .post(`/api/families/${family.id}/users`)
        .set({ Authorization: token2 })
        .send({ userId: targetId });
      expect(response.status).toBe(403);
    });

    test('should return 422 if missing email', async () => {
      const { token, userId } = await createUser('int-family-17', 'int-family-17@test.com');
      const family = await createFamily('FM', userId);
      const response = await request(app)
        .post(`/api/families/${family.id}/users`)
        .set({ Authorization: token })
        .send({});
      expect(response.status).toBe(422);
    });

    test('should return 404 if user not found', async () => {
      const { token, userId } = await createUser('int-family-18', 'int-family-18@test.com');
      const family = await createFamily('FX', userId);
      const fakeUser = '550e8400-e29b-41d4-a716-446655440005';
      const response = await request(app)
        .post(`/api/families/${family.id}/users`)
        .set({ Authorization: token })
        .send({ userId: fakeUser });
      expect(response.status).toBe(404);
    });

    test('should return 422 if user already in family', async () => {
      const { token, userId } = await createUser('int-family-19', 'int-family-19@test.com');
      const { userId: targetId } = await createUser('int-family-20', 'int-family-20@test.com');
      const family = await createFamily('FZ', userId);
      await request(app)
        .post(`/api/families/${family.id}/users`)
        .set({ Authorization: token })
        .send({ userId: targetId });

      const response = await request(app)
        .post(`/api/families/${family.id}/users`)
        .set({ Authorization: token })
        .send({ userId: targetId });
      expect(response.status).toBe(409);
    });

    test('should return 422 if trying to add self', async () => {
      const { token, userId } = await createUser('int-family-21', 'int-family-21@test.com');
      const family = await createFamily('FSelf', userId);

      const response = await request(app)
        .post(`/api/families/${family.id}/users`)
        .set({ Authorization: token })
        .send({ userId });
      expect(response.status).toBe(422);
    });

    test('should return 422 if trying to add family admin', async () => {
      const { token, userId } = await createUser('int-family-22', 'int-family-22@test.com');
      const family = await createFamily('FAdmin', userId);

      const response = await request(app)
        .post(`/api/families/${family.id}/users`)
        .set({ Authorization: token })
        .send({ userId });
      expect(response.status).toBe(422);
    });
  });

  describe('POST /api/families/:familyId/admins', () => {
    test('should promote user to admin', async () => {
      const { token, userId } = await createUser('int-family-23', 'int-family-23@test.com');
      const { userId: targetId } = await createUser('int-family-24', 'int-family-24@test.com');
      const family = await createFamily('FProm', userId);
      await request(app)
        .post(`/api/families/${family.id}/users`)
        .set({ Authorization: token })
        .send({ userId: targetId });

      const response = await request(app)
        .post(`/api/families/${family.id}/admins`)
        .set({ Authorization: token })
        .send({ userId: targetId });
      expect(response.status).toBe(201);
    });

    test('should return 404 if family not found', async () => {
      const { token } = await createUser('int-family-25', 'int-family-25@test.com');
      const fakeId = '550e8400-e29b-41d4-a716-446655440000';
      const { userId: targetId } = await createUser('int-family-26', 'int-family-26@test.com');

      const response = await request(app)
        .post(`/api/families/${fakeId}/admins`)
        .set({ Authorization: token })
        .send({ userId: targetId });
      expect(response.status).toBe(403);
    });

    test('should return 403 if access denied', async () => {
      const { userId } = await createUser('int-family-27', 'int-family-27@test.com');
      const { token: token2 } = await createUser('int-family-28', 'int-family-28@test.com');
      const { userId: targetId } = await createUser('int-family-29', 'int-family-29@test.com');
      const family = await createFamily('FNoAdmin', userId);

      const response = await request(app)
        .post(`/api/families/${family.id}/admins`)
        .set({ Authorization: token2 })
        .send({ userId: targetId });
      expect(response.status).toBe(403);
    });

    test('should return 422 if failed to validate data', async () => {
      const { token, userId } = await createUser('int-family-30', 'int-family-30@test.com');
      const family = await createFamily('FVal', userId);

      const response = await request(app)
        .post(`/api/families/${family.id}/admins`)
        .set({ Authorization: token })
        .send({});
      expect(response.status).toBe(422);
    });

    test('should return 403 if user is not admin', async () => {
      const { userId } = await createUser('int-family-31', 'int-family-31@test.com');
      const { token: token2 } = await createUser('int-family-32', 'int-family-32@test.com');
      const family = await createFamily('FNA', userId);
      const { userId: targetId } = await createUser('int-family-33', 'int-family-33@test.com');

      const response = await request(app)
        .post(`/api/families/${family.id}/admins`)
        .set({ Authorization: token2 })
        .send({ userId: targetId });
      expect(response.status).toBe(403);
    });
  });

  describe('PUT /api/families/:familyId', () => {
    test('should update family name', async () => {
      const { token, userId } = await createUser('int-family-34', 'int-family-34@test.com');
      const family = await createFamily('Old', userId);

      const response = await request(app)
        .put(`/api/families/${family.id}`)
        .set({ Authorization: token })
        .send({ name: 'New' });
      expect(response.status).toBe(200);
      expect(response.body.name).toBe('New');
    });

    test('should return 404 if family not found', async () => {
      const { token } = await createUser('int-family-35', 'int-family-35@test.com');
      const fakeId = '550e8400-e29b-41d4-a716-446655440000';

      const response = await request(app)
        .put(`/api/families/${fakeId}`)
        .set({ Authorization: token })
        .send({ name: 'X' });
      expect(response.status).toBe(404);
    });

    test('should return 403 if access denied', async () => {
      const { userId } = await createUser('int-family-36', 'int-family-36@test.com');
      const { token: token2 } = await createUser('int-family-37', 'int-family-37@test.com');
      const family = await createFamily('FA', userId);

      const response = await request(app)
        .put(`/api/families/${family.id}`)
        .set({ Authorization: token2 })
        .send({ name: 'Z' });
      expect(response.status).toBe(403);
    });

    test('should return 422 if missing name', async () => {
      const { token, userId } = await createUser('int-family-38', 'int-family-38@test.com');
      const family = await createFamily('FB', userId);

      const response = await request(app)
        .put(`/api/families/${family.id}`)
        .set({ Authorization: token })
        .send({});
      expect(response.status).toBe(422);
    });
  });

  describe('DELETE /api/families/:familyId', () => {
    test('should delete family', async () => {
      const { token, userId } = await createUser('int-family-39', 'int-family-39@test.com');
      const family = await createFamily('TD', userId);

      const response = await request(app)
        .delete(`/api/families/${family.id}`)
        .set({ Authorization: token });
      expect(response.status).toBe(204);
    });

    test('should return 404 if family not found', async () => {
      const { token } = await createUser('int-family-40', 'int-family-40@test.com');
      const fakeId = '550e8400-e29b-41d4-a716-446655440000';

      const response = await request(app)
        .delete(`/api/families/${fakeId}`)
        .set({ Authorization: token });
      expect(response.status).toBe(404);
    });

    test('should return 403 if access denied', async () => {
      const { userId } = await createUser('int-family-41', 'int-family-41@test.com');
      const { token: token2 } = await createUser('int-family-42', 'int-family-42@test.com');
      const family = await createFamily('ND', userId);

      const response = await request(app)
        .delete(`/api/families/${family.id}`)
        .set({ Authorization: token2 });
      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /api/families/:familyId/users', () => {
    test('should remove user from family', async () => {
      const { token, userId } = await createUser('int-family-43', 'int-family-43@test.com');
      const { userId: targetId } = await createUser('int-family-44', 'int-family-44@test.com');
      const family = await createFamily('RM', userId);
      await request(app)
        .post(`/api/families/${family.id}/users`)
        .set({ Authorization: token })
        .send({ userId: targetId });

      const response = await request(app)
        .delete(`/api/families/${family.id}/users`)
        .set({ Authorization: token })
        .send({ userId: targetId });
      expect(response.status).toBe(204);
    });

    test('should return 404 if family not found', async () => {
      const { token } = await createUser('int-family-45', 'int-family-45@test.com');
      const fakeId = '550e8400-e29b-41d4-a716-446655440000';
      const { userId: targetId } = await createUser('int-family-46', 'int-family-46@test.com');

      const response = await request(app)
        .delete(`/api/families/${fakeId}/users`)
        .set({ Authorization: token })
        .send({ userId: targetId });
      expect(response.status).toBe(404);
    });

    test('should return 403 if access denied', async () => {
      const { token, userId } = await createUser('int-family-47', 'int-family-47@test.com');
      const { token: token2 } = await createUser('int-family-48', 'int-family-48@test.com');
      const { userId: targetId } = await createUser('int-family-49', 'int-family-49@test.com');
      const family = await createFamily('X', userId);
      await request(app)
        .post(`/api/families/${family.id}/users`)
        .set({ Authorization: token })
        .send({ userId: targetId });

      const response = await request(app)
        .delete(`/api/families/${family.id}/users`)
        .set({ Authorization: token2 })
        .send({ userId: targetId });
      expect(response.status).toBe(403);
    });

    test('should return 422 if missing familyId', async () => {
      const { token } = await createUser('int-family-50', 'int-family-50@test.com');
      const response = await request(app)
        .delete('/api/families/invalid/users')
        .set({ Authorization: token })
        .send({});
      expect(response.status).toBe(422);
    });

    test('should return 422 if user not found', async () => {
      const { token, userId } = await createUser('int-family-51', 'int-family-51@test.com');
      const family = await createFamily('YY', userId);
      const fakeUser = '550e8400-e29b-41d4-a716-446655440005';

      const response = await request(app)
        .delete(`/api/families/${family.id}/users`)
        .set({ Authorization: token })
        .send({ userId: fakeUser });
      expect(response.status).toBe(404);
    });
  });
});
