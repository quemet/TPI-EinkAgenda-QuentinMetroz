import { describe, expect, test } from '@jest/globals';
import '../setup';
import {
  getAllAgendas,
  getAgendaById,
  createAgenda,
  updateAgenda,
  deleteAgenda,
} from '../../services/agenda.service';
import Agenda from '../../models/agenda.model';
import Belong from '../../models/belong.model';
import Family from '../../models/family.model';
import { register } from '../../services/auth.service';

describe('Agenda Unit tests', () => {
  const createTestUser = async (username: string, email: string) => {
    const { user } = await register({ username, email, password: 'password123' });
    return user;
  };

  const createTestFamily = async (userId: string, name: string) => {
    const family = await Family.create({ name });
    await Belong.create({ user_id: userId, family_id: family.id });
    return family;
  };

  describe('Check Agenda Access', () => {
    describe('The user has access to the agenda', () => {
      test('should allow access to the agenda', async () => {
        const user = await createTestUser('unit-user-1', 'unit-user-1@test.com');
        const family = await createTestFamily(user.id, 'Test Family');
        const agenda = await createAgenda('Test Agenda', family.id, user.id);

        const result = await getAllAgendas(family.id, user.id);

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe(agenda.id);
        expect(result[0].name).toBe('Test Agenda');
      });
    });

    describe('The user is part of any familly', () => {
      test('should deny access to the agenda', async () => {
        const user1 = await createTestUser('unit-user-2', 'unit-user-2@test.com');
        const user2 = await createTestUser('unit-user-3', 'unit-user-3@test.com');
        const family = await createTestFamily(user1.id, 'Test Family 2');
        await createAgenda('Test Agenda 2', family.id, user1.id);

        await expect(getAllAgendas(family.id, user2.id)).rejects.toThrow('Access denied');
      });
    });

    describe('The family of the user has access to the agenda', () => {
      test('should allow access to the agenda', async () => {
        const user = await createTestUser('unit-user-4', 'unit-user-4@test.com');
        const family = await createTestFamily(user.id, 'Test Family 3');
        const agenda = await createAgenda('Test Agenda 3', family.id, user.id);

        const retrieved = await getAgendaById(agenda.id, family.id, user.id);

        expect(retrieved.id).toBe(agenda.id);
        expect(retrieved.name).toBe('Test Agenda 3');
      });
    });
  });

  describe('Get all agendas', () => {
    test('should get all agendas for a family', async () => {
      const user = await createTestUser('unit-user-5', 'unit-user-5@test.com');
      const family = await createTestFamily(user.id, 'Test Family 4');
      await createAgenda('Agenda 1', family.id, user.id);
      await createAgenda('Agenda 2', family.id, user.id);

      const result = await getAllAgendas(family.id, user.id);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Agenda 1');
      expect(result[1].name).toBe('Agenda 2');
    });

    test('should return 404 if no agendas found', async () => {
      const user = await createTestUser('unit-user-6', 'unit-user-6@test.com');
      const family = await createTestFamily(user.id, 'Test Family 5');

      await expect(getAllAgendas(family.id, user.id)).rejects.toThrow('No agendas found');
    });
  });

  describe('Get agenda by ID', () => {
    test('should get agenda by ID', async () => {
      const user = await createTestUser('unit-user-7', 'unit-user-7@test.com');
      const family = await createTestFamily(user.id, 'Test Family 6');
      const agenda = await createAgenda('Test Agenda 4', family.id, user.id);

      const result = await getAgendaById(agenda.id, family.id, user.id);

      expect(result.id).toBe(agenda.id);
      expect(result.name).toBe('Test Agenda 4');
    });

    test('should return 404 if agenda not found', async () => {
      const user = await createTestUser('unit-user-8', 'unit-user-8@test.com');
      const family = await createTestFamily(user.id, 'Test Family 7');
      const fakeId = '550e8400-e29b-41d4-a716-446655440000';

      await expect(getAgendaById(fakeId, family.id, user.id)).rejects.toThrow('Agenda not found');
    });

    test('should return 403 if access denied', async () => {
      const user1 = await createTestUser('unit-user-9', 'unit-user-9@test.com');
      const user2 = await createTestUser('unit-user-10', 'unit-user-10@test.com');
      const family = await createTestFamily(user1.id, 'Test Family 8');
      const agenda = await createAgenda('Test Agenda 5', family.id, user1.id);

      await expect(getAgendaById(agenda.id, family.id, user2.id)).rejects.toThrow('Access denied');
    });
  });

  describe('Create agenda', () => {
    test('should create a new agenda', async () => {
      const user = await createTestUser('unit-user-11', 'unit-user-11@test.com');
      const family = await createTestFamily(user.id, 'Test Family 9');

      const agenda = await createAgenda('New Agenda', family.id, user.id);

      expect(agenda.id).toBeDefined();
      expect(agenda.name).toBe('New Agenda');
      expect(agenda.familyId).toBe(family.id);
    });
  });

  describe('Update agenda', () => {
    test('should update an existing agenda', async () => {
      const user = await createTestUser('unit-user-12', 'unit-user-12@test.com');
      const family = await createTestFamily(user.id, 'Test Family 10');
      const agenda = await createAgenda('Old Name', family.id, user.id);

      const updated = await updateAgenda(agenda.id, 'New Name', user.id);

      expect(updated.id).toBe(agenda.id);
      expect(updated.name).toBe('New Name');
    });

    test('should return 404 if agenda not found', async () => {
      const user = await createTestUser('unit-user-13', 'unit-user-13@test.com');
      const fakeId = '550e8400-e29b-41d4-a716-446655440000';

      await expect(updateAgenda(fakeId, 'New Name', user.id)).rejects.toThrow('Agenda not found');
    });

    test('should return 403 if access denied', async () => {
      const user1 = await createTestUser('unit-user-14', 'unit-user-14@test.com');
      const user2 = await createTestUser('unit-user-15', 'unit-user-15@test.com');
      const family = await createTestFamily(user1.id, 'Test Family 11');
      const agenda = await createAgenda('Test Agenda 6', family.id, user1.id);

      await expect(updateAgenda(agenda.id, 'New Name', user2.id)).rejects.toThrow('Access denied');
    });
  });

  describe('Delete agenda', () => {
    test('should delete an existing agenda', async () => {
      const user = await createTestUser('unit-user-16', 'unit-user-16@test.com');
      const family = await createTestFamily(user.id, 'Test Family 12');
      const agenda = await createAgenda('Test Agenda 7', family.id, user.id);

      await deleteAgenda(agenda.id, user.id);

      const deleted = await Agenda.findByPk(agenda.id);
      expect(deleted).toBeNull();
    });

    test('should return 404 if agenda not found', async () => {
      const user = await createTestUser('unit-user-17', 'unit-user-17@test.com');
      const fakeId = '550e8400-e29b-41d4-a716-446655440000';

      await expect(deleteAgenda(fakeId, user.id)).rejects.toThrow('Agenda not found');
    });

    test('should return 403 if access denied', async () => {
      const user1 = await createTestUser('unit-user-18', 'unit-user-18@test.com');
      const user2 = await createTestUser('unit-user-19', 'unit-user-19@test.com');
      const family = await createTestFamily(user1.id, 'Test Family 13');
      const agenda = await createAgenda('Test Agenda 8', family.id, user1.id);

      await expect(deleteAgenda(agenda.id, user2.id)).rejects.toThrow('Access denied');
    });
  });
});
