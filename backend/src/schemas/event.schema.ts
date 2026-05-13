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
  startDatetime: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid start datetime',
  }),
  endDatetime: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid end datetime',
  }),
});

export const getAllEventSchemaParams = agendaBaseIdSchema;

export const getEventByIdSchemaParams = eventBaseIdSchema;

export const createEventSchemaParams = agendaBaseIdSchema;

export const createEventSchemaBody = eventBaseSchemaBody;

export const updateEventSchemaParams = eventBaseIdSchema;

export const updateEventSchemaBody = eventBaseSchemaBody.partial();

export const deleteEventSchemaParams = eventBaseIdSchema;
