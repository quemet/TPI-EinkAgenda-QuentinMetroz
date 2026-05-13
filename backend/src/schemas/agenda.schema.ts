import z from 'zod';

export const getAllAgendasSchemaParams = z.object({
  familyId: z.string().uuid(),
});

export const getAgendaByIdSchemaParams = z.object({
  id: z.string().uuid(),
  familyId: z.string().uuid(),
});

export const createAgendaSchemaParams = getAllAgendasSchemaParams;

export const createAgendaSchemaBody = z.object({
  name: z.string().min(1).max(255),
});

export const updateAgendaSchemaParams = z.object({
  id: z.string().uuid(),
});

export const updateAgendaSchemaBody = createAgendaSchemaBody;

export const deleteAgendaSchemaParams = updateAgendaSchemaParams;
