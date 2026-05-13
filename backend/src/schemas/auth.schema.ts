import z from 'zod';

export const loginSchemaBody = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchemaBody = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  username: z.string().min(3),
});
