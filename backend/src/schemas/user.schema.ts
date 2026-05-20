import z from 'zod';

const updateMeSchemaBody = z.object({
  type: z.enum(['young', 'elder']),
});

export default updateMeSchemaBody;
