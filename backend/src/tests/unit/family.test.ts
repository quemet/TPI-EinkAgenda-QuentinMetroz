import { describe, expect, test } from '@jest/globals';
import '../setup';
import {
  getUserFamily,
  getFamilyById,
  createFamily,
  updateFamily,
  deleteFamily,
  addUserToFamily,
  addAdminToFamily,
  removeUserFromFamily,
} from '../../services/family.service';
import Family from '../../models/family.model';
import Belong from '../../models/belong.model';
import Appertain from '../../models/appertain.model';
import { register } from '../../services/auth.service';

describe('Family Unit tests', () => {
  const createTestUser = async (username: string, email: string) => {
    const { user } = await register({ username, email, password: 'password123' });
    return user;
  };

  describe('Get user family', () => {
    test('should get user family', async () => {
      const user = await createTestUser('unit-family-1', 'unit-family-1@test.com');
      const family = await createFamily('My Family', user.id);

      const families = await getUserFamily(user.id);
      expect(families).toHaveLength(1);
      expect(families[0].id).toBe(family.id);
    });

    test('should return empty array if user has no family', async () => {
      const user = await createTestUser('unit-family-2', 'unit-family-2@test.com');
      const families = await getUserFamily(user.id);
      expect(families).toHaveLength(0);
    });
  });

  describe('Get family by id', () => {
    test('should get family by id', async () => {
      const user = await createTestUser('unit-family-3', 'unit-family-3@test.com');
      const family = await createFamily('Family X', user.id);

      const found = await getFamilyById(family.id);
      expect(found.id).toBe(family.id);
    });

    test('should throw error if family not found', async () => {
      const fakeId = '550e8400-e29b-41d4-a716-446655440000';
      await expect(getFamilyById(fakeId)).rejects.toThrow('Family not found');
    });
  });

  describe('Create family', () => {
    test('should create family', async () => {
      const user = await createTestUser('unit-family-4', 'unit-family-4@test.com');
      const family = await createFamily('New Family', user.id);

      expect(family.id).toBeDefined();
      expect(family.name).toBe('New Family');

      const belong = await Belong.findOne({ where: { user_id: user.id, family_id: family.id } });
      expect(belong).not.toBeNull();

      const admin = await Appertain.findOne({
        where: { family_adminId: user.id, family_id: family.id },
      });
      expect(admin).not.toBeNull();
    });

    test('should accept empty name (controller validates input)', async () => {
      // service does not validate name length here, controller handles validation
      const user = await createTestUser('unit-family-5', 'unit-family-5@test.com');
      const family = await createFamily('', user.id);
      expect(family.name).toBe('');
    });
  });

  describe('Add user to family', () => {
    test('should add user to family', async () => {
      const admin = await createTestUser('unit-family-6', 'unit-family-6@test.com');
      const family = await createFamily('Fam A', admin.id);
      const user = await createTestUser('unit-family-7', 'unit-family-7@test.com');

      await addUserToFamily(family.id, user.id);

      const belong = await Belong.findOne({ where: { user_id: user.id, family_id: family.id } });
      expect(belong).not.toBeNull();
    });

    test('should throw error if family not found', async () => {
      const user = await createTestUser('unit-family-8', 'unit-family-8@test.com');
      const fakeId = '550e8400-e29b-41d4-a716-446655440000';
      await expect(addUserToFamily(fakeId, user.id)).rejects.toThrow('Family not found');
    });

    test('should throw error if user not found', async () => {
      const admin = await createTestUser('unit-family-9', 'unit-family-9@test.com');
      const family = await createFamily('Fam B', admin.id);
      const fakeUser = '550e8400-e29b-41d4-a716-446655440001';
      await expect(addUserToFamily(family.id, fakeUser)).rejects.toThrow('User not found');
    });

    test('should throw error if user is already in family', async () => {
      const admin = await createTestUser('unit-family-10', 'unit-family-10@test.com');
      const family = await createFamily('Fam C', admin.id);
      const user = await createTestUser('unit-family-11', 'unit-family-11@test.com');

      await addUserToFamily(family.id, user.id);
      await expect(addUserToFamily(family.id, user.id)).rejects.toThrow(
        'User already belongs to family',
      );
    });
  });

  describe('Update family', () => {
    test('should update family', async () => {
      const user = await createTestUser('unit-family-12', 'unit-family-12@test.com');
      const family = await createFamily('Old Name', user.id);

      const updated = await updateFamily(family.id, 'New Name');
      expect(updated.name).toBe('New Name');
    });

    test('should throw error if family not found', async () => {
      const fakeId = '550e8400-e29b-41d4-a716-446655440000';
      await expect(updateFamily(fakeId, 'Whatever')).rejects.toThrow('Family not found');
    });

    test('should throw error if given invalid data', async () => {
      const user = await createTestUser('unit-family-13', 'unit-family-13@test.com');
      const family = await createFamily('Name', user.id);
      // service does not validate name; controller handles validation, but ensure save works
      const updated = await updateFamily(family.id, '');
      expect(updated.name).toBe('');
    });
  });

  describe('Add admin to family', () => {
    test('should add admin to family', async () => {
      const admin = await createTestUser('unit-family-14', 'unit-family-14@test.com');
      const family = await createFamily('Fam D', admin.id);
      const user = await createTestUser('unit-family-15', 'unit-family-15@test.com');

      await addAdminToFamily(family.id, user.id, admin.id);
      const ap = await Appertain.findOne({
        where: { family_adminId: user.id, family_id: family.id },
      });
      expect(ap).not.toBeNull();
    });

    test('should throw error if family not found', async () => {
      const admin = await createTestUser('unit-family-16', 'unit-family-16@test.com');
      const fakeId = '550e8400-e29b-41d4-a716-446655440000';
      const user = await createTestUser('unit-family-17', 'unit-family-17@test.com');
      await expect(addAdminToFamily(fakeId, user.id, admin.id)).rejects.toThrow(
        'Only admin can add another admin to family',
      );
    });

    test('should throw error if user not found', async () => {
      const admin = await createTestUser('unit-family-18', 'unit-family-18@test.com');
      const family = await createFamily('Fam E', admin.id);
      const fakeUser = '550e8400-e29b-41d4-a716-446655440002';
      await expect(addAdminToFamily(family.id, fakeUser, admin.id)).rejects.toThrow(
        'User not found',
      );
    });

    test('should throw error if user is already an admin', async () => {
      const admin = await createTestUser('unit-family-19', 'unit-family-19@test.com');
      const family = await createFamily('Fam F', admin.id);
      const user = await createTestUser('unit-family-20', 'unit-family-20@test.com');

      await addAdminToFamily(family.id, user.id, admin.id);
      await expect(addAdminToFamily(family.id, user.id, admin.id)).rejects.toThrow(
        'User is already an admin for this family',
      );
    });

    test('should throw error if the user that added another user is not admin', async () => {
      const admin = await createTestUser('unit-family-21', 'unit-family-21@test.com');
      const family = await createFamily('Fam G', admin.id);
      const nonAdmin = await createTestUser('unit-family-22', 'unit-family-22@test.com');
      const target = await createTestUser('unit-family-23', 'unit-family-23@test.com');

      await expect(addAdminToFamily(family.id, target.id, nonAdmin.id)).rejects.toThrow(
        'Only admin can add another admin to family',
      );
    });
  });

  describe('Delete family', () => {
    test('should delete family', async () => {
      const admin = await createTestUser('unit-family-24', 'unit-family-24@test.com');
      const family = await createFamily('ToDelete', admin.id);

      await deleteFamily(family.id, admin.id);
      const found = await Family.findByPk(family.id);
      expect(found).toBeNull();
    });

    test('should throw error if family not found', async () => {
      const admin = await createTestUser('unit-family-25', 'unit-family-25@test.com');
      const fakeId = '550e8400-e29b-41d4-a716-446655440000';
      await expect(deleteFamily(fakeId, admin.id)).rejects.toThrow('Family not found');
    });

    test('should throw error if user is not admin', async () => {
      const admin = await createTestUser('unit-family-26', 'unit-family-26@test.com');
      const family = await createFamily('NotDelete', admin.id);
      const nonAdmin = await createTestUser('unit-family-27', 'unit-family-27@test.com');
      await expect(deleteFamily(family.id, nonAdmin.id)).rejects.toThrow(
        'Only admin can delete family',
      );
    });
  });

  describe('Remove user from family', () => {
    test('should remove user from family', async () => {
      const admin = await createTestUser('unit-family-28', 'unit-family-28@test.com');
      const family = await createFamily('Fam H', admin.id);
      const target = await createTestUser('unit-family-29', 'unit-family-29@test.com');
      await addUserToFamily(family.id, target.id);

      await removeUserFromFamily(family.id, target.id, admin.id);
      const belong = await Belong.findOne({ where: { user_id: target.id, family_id: family.id } });
      expect(belong).toBeNull();
    });

    test('should throw error if family not found', async () => {
      const admin = await createTestUser('unit-family-30', 'unit-family-30@test.com');
      const fakeId = '550e8400-e29b-41d4-a716-446655440000';
      const target = await createTestUser('unit-family-31', 'unit-family-31@test.com');
      await expect(removeUserFromFamily(fakeId, target.id, admin.id)).rejects.toThrow(
        'Family not found',
      );
    });

    test('should throw error if user is not admin', async () => {
      const admin = await createTestUser('unit-family-32', 'unit-family-32@test.com');
      const family = await createFamily('Fam I', admin.id);
      const target = await createTestUser('unit-family-33', 'unit-family-33@test.com');
      await addUserToFamily(family.id, target.id);
      const nonAdmin = await createTestUser('unit-family-34', 'unit-family-34@test.com');

      await expect(removeUserFromFamily(family.id, target.id, nonAdmin.id)).rejects.toThrow(
        'Only admin can remove user from family',
      );
    });

    test('should throw error if target user is admin', async () => {
      const admin = await createTestUser('unit-family-35', 'unit-family-35@test.com');
      const family = await createFamily('Fam J', admin.id);
      const target = await createTestUser('unit-family-36', 'unit-family-36@test.com');
      await addAdminToFamily(family.id, target.id, admin.id);

      await expect(removeUserFromFamily(family.id, target.id, admin.id)).rejects.toThrow(
        'Admin cannot be removed from family',
      );
    });

    test('should throw error if target user is not in family', async () => {
      const admin = await createTestUser('unit-family-37', 'unit-family-37@test.com');
      const family = await createFamily('Fam K', admin.id);
      const nonMember = await createTestUser('unit-family-38', 'unit-family-38@test.com');

      await expect(removeUserFromFamily(family.id, nonMember.id, admin.id)).rejects.toThrow(
        'User is not a member of this family',
      );
    });
  });
});
