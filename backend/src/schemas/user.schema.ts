import z from 'zod';

export const getFamilyUsersSchemaParams = z.object({
  familyId: z.string().uuid(),
});

export const updateMeSchemaBody = z.object({
  type: z.enum(['young', 'elder']),
});
