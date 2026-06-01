import z from 'zod';

const validTokenSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string().email(),
  role: z.enum(['user', 'family-admin', 'app-admin']),
  personType: z.enum(['young', 'elder']),
});

export default validTokenSchema;
