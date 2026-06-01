import request from 'supertest';
import app from '../../server';
import { describe, test, expect } from '@jest/globals';
import '../setup';
import { register } from '../../services/auth.service';
import { createAgenda } from '../../services/agenda.service';
import Family from '../../models/family.model';
import Belong from '../../models/belong.model';
import Agenda from '../../models/agenda.model';

describe('Agenda Integration tests', () => {
  const createUser = async (username: string, email: string) => {
    const response = await register({ username, email, password: 'password123' });
    return { token: `Bearer ${response.token}`, userId: response.user.id };
  };

  const createFamily = async (userId: string, name: string) => {
    const family = await Family.create({ name });
    await Belong.create({ user_id: userId, family_id: family.id });
    return family;
  };

  const createTestAgenda = async (familyId: string, userId: string, name: string) => {
    const agenda = await createAgenda(name, familyId, userId, userId);
    return agenda;
  };

  describe('GET /api/agendas/:familyId', () => {
    test('should get all agendas for a family', async () => {
      const { token, userId } = await createUser('int-user-1', 'int-user-1@test.com');
      const family = await createFamily(userId, 'Test Family');
      await createTestAgenda(family.id, userId, 'Agenda 1');
      await createTestAgenda(family.id, userId, 'Agenda 2');

      const response = await request(app)
        .get(`/api/agendas/${family.id}`)
        .set({ Authorization: token });

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].name).toBe('Agenda 1');
      expect(response.body[1].name).toBe('Agenda 2');
    });

    test('should return 404 if no agendas found', async () => {
      const { token, userId } = await createUser('int-user-2', 'int-user-2@test.com');
      const family = await createFamily(userId, 'Test Family 2');

      const response = await request(app)
        .get(`/api/agendas/${family.id}`)
        .set({ Authorization: token });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('No agendas found');
    });

    test('should return 403 if access denied', async () => {
      const { userId } = await createUser('int-user-3', 'int-user-3@test.com');
      const { token: token2 } = await createUser('int-user-4', 'int-user-4@test.com');
      const family = await createFamily(userId, 'Test Family 3');
      await createTestAgenda(family.id, userId, 'Test Agenda');

      const response = await request(app)
        .get(`/api/agendas/${family.id}`)
        .set({ Authorization: token2 });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Access denied');
    });

    test('should return 422 if invalid family ID', async () => {
      const { token } = await createUser('int-user-5', 'int-user-5@test.com');
      const invalidId = 'invalid-uuid';

      const response = await request(app)
        .get(`/api/agendas/${invalidId}`)
        .set({ Authorization: token });

      expect(response.status).toBe(422);
    });
  });

  describe('GET /api/agendas/:familyId/:id', () => {
    test('should get agenda by ID', async () => {
      const { token, userId } = await createUser('int-user-6', 'int-user-6@test.com');
      const family = await createFamily(userId, 'Test Family 4');
      const agenda = await createTestAgenda(family.id, userId, 'Test Agenda');

      const response = await request(app)
        .get(`/api/agendas/${family.id}/${agenda.id}`)
        .set({ Authorization: token });

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(agenda.id);
      expect(response.body.name).toBe('Test Agenda');
    });

    test('should return 404 if agenda not found', async () => {
      const { token, userId } = await createUser('int-user-7', 'int-user-7@test.com');
      const family = await createFamily(userId, 'Test Family 5');
      const fakeId = '550e8400-e29b-41d4-a716-446655440000';

      const response = await request(app)
        .get(`/api/agendas/${family.id}/${fakeId}`)
        .set({ Authorization: token });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Agenda not found');
    });

    test('should return 403 if access denied', async () => {
      const { userId } = await createUser('int-user-8', 'int-user-8@test.com');
      const { token: token2 } = await createUser('int-user-9', 'int-user-9@test.com');
      const family = await createFamily(userId, 'Test Family 6');
      const agenda = await createTestAgenda(family.id, userId, 'Test Agenda');

      const response = await request(app)
        .get(`/api/agendas/${family.id}/${agenda.id}`)
        .set({ Authorization: token2 });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Access denied');
    });

    test('should return 422 if invalid agenda or family ID', async () => {
      const { token } = await createUser('int-user-10', 'int-user-10@test.com');
      const invalidId = 'invalid-uuid';

      const response = await request(app)
        .get(`/api/agendas/${invalidId}/${invalidId}`)
        .set({ Authorization: token });

      expect(response.status).toBe(422);
    });
  });

  describe('POST /api/agendas/:familyId', () => {
    test('should create a new agenda', async () => {
      const { token, userId } = await createUser('int-user-11', 'int-user-11@test.com');
      const family = await createFamily(userId, 'Test Family 7');

      const response = await request(app)
        .post(`/api/agendas/${family.id}`)
        .set({ Authorization: token })
        .send({ name: 'New Agenda', appertainTo: userId });

      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body.name).toBe('New Agenda');
      expect(response.body.familyId).toBe(family.id);
      expect(response.body.appertainTo).toBe(userId);
    });

    test('should return 404 if family not found', async () => {
      const { token, userId } = await createUser('int-user-12', 'int-user-12@test.com');
      const fakeId = '550e8400-e29b-41d4-a716-446655440000';

      const response = await request(app)
        .post(`/api/agendas/${fakeId}`)
        .set({ Authorization: token })
        .send({ name: 'New Agenda', appertainTo: userId });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Access denied');
    });

    test('should return 403 if access denied', async () => {
      const { userId } = await createUser('int-user-13', 'int-user-13@test.com');
      const { token: token2, userId: userId2 } = await createUser('int-user-14', 'int-user-14@test.com');
      const family = await createFamily(userId, 'Test Family 8');

      const response = await request(app)
        .post(`/api/agendas/${family.id}`)
        .set({ Authorization: token2 })
        .send({ name: 'New Agenda', appertainTo: userId2 });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Access denied');
    });

    test('should return 422 if invalid family ID', async () => {
      const { token } = await createUser('int-user-15', 'int-user-15@test.com');
      const invalidId = 'invalid-uuid';

      const response = await request(app)
        .post(`/api/agendas/${invalidId}`)
        .set({ Authorization: token })
        .send({ name: 'New Agenda' });

      expect(response.status).toBe(422);
    });

    test('should return 422 if missing name', async () => {
      const { token, userId } = await createUser('int-user-16', 'int-user-16@test.com');
      const family = await createFamily(userId, 'Test Family 9');

      const response = await request(app)
        .post(`/api/agendas/${family.id}`)
        .set({ Authorization: token })
        .send({ appertainTo: userId });

      expect(response.status).toBe(422);
    });

    test('should return 422 if missing appertainTo', async () => {
      const { token, userId } = await createUser('int-user-28', 'int-user-28@test.com');
      const family = await createFamily(userId, 'Test Family 15');

      const response = await request(app)
        .post(`/api/agendas/${family.id}`)
        .set({ Authorization: token })
        .send({ name: 'New Agenda' });

      expect(response.status).toBe(422);
    });
  });

  describe('PUT /api/agendas/:id', () => {
    test('should update an existing agenda', async () => {
      const { token, userId } = await createUser('int-user-17', 'int-user-17@test.com');
      const family = await createFamily(userId, 'Test Family 10');
      const agenda = await createTestAgenda(family.id, userId, 'Old Name');

      const response = await request(app)
        .put(`/api/agendas/${agenda.id}`)
        .set({ Authorization: token })
        .send({ name: 'New Name' });

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(agenda.id);
      expect(response.body.name).toBe('New Name');
    });

    test('should return 404 if agenda not found', async () => {
      const { token } = await createUser('int-user-18', 'int-user-18@test.com');
      const fakeId = '550e8400-e29b-41d4-a716-446655440000';

      const response = await request(app)
        .put(`/api/agendas/${fakeId}`)
        .set({ Authorization: token })
        .send({ name: 'New Name' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Agenda not found');
    });

    test('should return 403 if access denied', async () => {
      const { userId } = await createUser('int-user-19', 'int-user-19@test.com');
      const { token: token2 } = await createUser('int-user-20', 'int-user-20@test.com');
      const family = await createFamily(userId, 'Test Family 11');
      const agenda = await createTestAgenda(family.id, userId, 'Test Agenda');

      const response = await request(app)
        .put(`/api/agendas/${agenda.id}`)
        .set({ Authorization: token2 })
        .send({ name: 'New Name' });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Access denied');
    });

    test('should return 422 if invalid agenda ID', async () => {
      const { token } = await createUser('int-user-21', 'int-user-21@test.com');
      const invalidId = 'invalid-uuid';

      const response = await request(app)
        .put(`/api/agendas/${invalidId}`)
        .set({ Authorization: token })
        .send({ name: 'New Name' });

      expect(response.status).toBe(422);
    });

    test('should return 422 if missing name', async () => {
      const { token, userId } = await createUser('int-user-22', 'int-user-22@test.com');
      const family = await createFamily(userId, 'Test Family 12');
      const agenda = await createTestAgenda(family.id, userId, 'Test Agenda');

      const response = await request(app)
        .put(`/api/agendas/${agenda.id}`)
        .set({ Authorization: token })
        .send({});

      expect(response.status).toBe(422);
    });
  });

  describe('DELETE /api/agendas/:id', () => {
    test('should delete an existing agenda', async () => {
      const { token, userId } = await createUser('int-user-23', 'int-user-23@test.com');
      const family = await createFamily(userId, 'Test Family 13');
      const agenda = await createTestAgenda(family.id, userId, 'Test Agenda');

      const response = await request(app)
        .delete(`/api/agendas/${agenda.id}`)
        .set({ Authorization: token });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Agenda deleted successfully');

      const deleted = await Agenda.findByPk(agenda.id);
      expect(deleted).toBeNull();
    });

    test('should return 404 if agenda not found', async () => {
      const { token } = await createUser('int-user-24', 'int-user-24@test.com');
      const fakeId = '550e8400-e29b-41d4-a716-446655440000';

      const response = await request(app)
        .delete(`/api/agendas/${fakeId}`)
        .set({ Authorization: token });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Agenda not found');
    });

    test('should return 403 if access denied', async () => {
      const { userId } = await createUser('int-user-25', 'int-user-25@test.com');
      const { token: token2 } = await createUser('int-user-26', 'int-user-26@test.com');
      const family = await createFamily(userId, 'Test Family 14');
      const agenda = await createTestAgenda(family.id, userId, 'Test Agenda');

      const response = await request(app)
        .delete(`/api/agendas/${agenda.id}`)
        .set({ Authorization: token2 });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Access denied');
    });

    test('should return 422 if invalid agenda ID', async () => {
      const { token } = await createUser('int-user-27', 'int-user-27@test.com');
      const invalidId = 'invalid-uuid';

      const response = await request(app)
        .delete(`/api/agendas/${invalidId}`)
        .set({ Authorization: token });

      expect(response.status).toBe(422);
    });
  });
});
