import { describe, expect, test } from '@jest/globals';
import '../setup';
import { getMe, updateMe, deleteMe } from '../../services/user.service';
import { register } from '../../services/auth.service';
import { RegisterData } from '../../types/auth.type';

// Helper to create test user
const createTestUser = async (username: string, email: string) => {
  const data: RegisterData = {
    username,
    email,
    password: 'password123',
  };
  const { user } = await register(data);
  return user;
};

describe('User Unit tests', () => {
  describe('getMe', () => {
    test('should return user data without password', async () => {
      const user = await createTestUser('testuser1', 'test1@gmail.com');
      const retrieved = await getMe(user.id);

      expect(retrieved).toBeDefined();
      expect(retrieved.id).toBe(user.id);
      expect(retrieved.username).toBe('testuser1');
      expect(retrieved.email).toBe('test1@gmail.com');
      expect(retrieved.personType).toBeDefined();
      expect(retrieved.role).toBeDefined();
    });

    test('should throw error if user not found', async () => {
      const fakeUserId = '00000000-0000-0000-0000-000000000000';

      await expect(getMe(fakeUserId)).rejects.toThrow('User not found');
    });
  });

  describe('updateMe', () => {
    test('should update user personType to young', async () => {
      const user = await createTestUser('testuser2', 'test2@gmail.com');
      const updated = await updateMe(user.id, 'young');

      expect(updated).toBeDefined();
      expect(updated.id).toBe(user.id);
      expect(updated.personType).toBe('young');
    });

    test('should update user personType to elder', async () => {
      const user = await createTestUser('testuser3', 'test3@gmail.com');
      const updated = await updateMe(user.id, 'elder');

      expect(updated).toBeDefined();
      expect(updated.id).toBe(user.id);
      expect(updated.personType).toBe('elder');
    });

    test('should persist update in database', async () => {
      const user = await createTestUser('testuser4', 'test4@gmail.com');
      await updateMe(user.id, 'young');

      const retrieved = await getMe(user.id);
      expect(retrieved.personType).toBe('young');
    });

    test('should throw error if user not found', async () => {
      const fakeUserId = '00000000-0000-0000-0000-000000000000';

      await expect(updateMe(fakeUserId, 'young')).rejects.toThrow('User not found');
    });
  });

  describe('deleteMe', () => {
    test('should delete user', async () => {
      const user = await createTestUser('testuser5', 'test5@gmail.com');
      await deleteMe(user.id);

      // Verify user is deleted
      await expect(getMe(user.id)).rejects.toThrow('User not found');
    });

    test('should throw error if user not found', async () => {
      const fakeUserId = '00000000-0000-0000-0000-000000000000';

      await expect(deleteMe(fakeUserId)).rejects.toThrow('User not found');
    });
  });
});
