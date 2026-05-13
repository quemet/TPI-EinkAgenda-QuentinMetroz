import z from 'zod';

const agendaBaseIdSchema = z.object({
  agendaId: z.string().uuid(),
});

const eventBaseIdSchema = z.object({
  eventId: z.string().uuid(),
});

const eventBaseSchemaBody = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string(),
  type: z.string().min(1, 'Type is required'),
  startDatetime: z.coerce.date(),
  endDatetime: z.coerce.date(),
});

export const getAllEventSchemaParams = agendaBaseIdSchema;

export const getEventByIdSchemaParams = eventBaseIdSchema;

export const createEventSchemaParams = agendaBaseIdSchema;

export const createEventSchemaBody = eventBaseSchemaBody;

export const updateEventSchemaParams = eventBaseIdSchema;

export const updateEventSchemaBody = eventBaseSchemaBody.partial();

export const deleteEventSchemaParams = eventBaseIdSchema;
