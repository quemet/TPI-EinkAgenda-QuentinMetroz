import z from 'zod';

export const getFamilyByIdSchemaParams = z.object({
  familyId: z.string().uuid(),
});

export const createFamilySchemaBody = z.object({
  name: z.string().min(1).max(255),
});

export const addUserToFamilySchemaParams = getFamilyByIdSchemaParams;

export const addUserToFamilySchemaBody = z.object({
  userId: z.string().uuid(),
});

export const addAdminToFamilySchemaParams = getFamilyByIdSchemaParams;

export const addAdminToFamilySchemaBody = addUserToFamilySchemaBody;

export const updateFamilySchemaParams = getFamilyByIdSchemaParams;

export const updateFamilySchemaBody = createFamilySchemaBody;

export const deleteFamilySchemaParams = getFamilyByIdSchemaParams;

export const removeUserFromFamilySchemaParams = getFamilyByIdSchemaParams;

export const removeUserFromFamilySchemaBody = addUserToFamilySchemaBody;
