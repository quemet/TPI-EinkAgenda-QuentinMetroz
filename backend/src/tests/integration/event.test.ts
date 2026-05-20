import request from 'supertest';
import app from '../../server';
import { describe, test, expect } from '@jest/globals';
import '../setup';
import Agenda from '../../models/agenda.model';
import Belong from '../../models/belong.model';
import Family from '../../models/family.model';
import EventData from '../../types/event.type';
import { register } from '../../services/auth.service';

const buildHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
});

const createUser = async (username: string, email: string) => {
  const response = await register({
    username,
    email,
    password: 'password123',
  });

  return {
    token: response.token,
    userId: response.user.id,
  };
};

const createFamily = async (userId: string, name: string) => {
  const family = await Family.create({ name });
  await Belong.create({ user_id: userId, family_id: family.id });

  return family as { id: string };
};

const createAgenda = async (familyId: string, name: string) => {
  const agenda = await Agenda.create({ name, familyId });

  return agenda as { id: string };
};

const createEvent = async (token: string, agendaId: string, eventData: EventData) => {
  const response = await request(app)
    .post(`/api/events/agenda/${agendaId}/events`)
    .set(buildHeaders(token))
    .send(eventData)
    .expect(201);

  return response.body as { id: string };
};

const validEventData: EventData = {
  name: 'Team meeting',
  description: 'Weekly coordination meeting',
  type: 'meeting',
  startDatetime: new Date('2026-05-18T10:00:00.000Z'),
  endDatetime: new Date('2026-05-18T11:00:00.000Z'),
};

const missingUuid = '550e8400-e29b-41d4-a716-446655440000';

describe('Event API Integration Tests', () => {
  describe('GET /api/events/agenda/:agendaId/events', () => {
    test('should get all events for an agenda', async () => {
      const owner = await createUser('event-owner-1', 'event-owner-1@example.com');
      const family = await createFamily(owner.userId, 'Event Family 1');
      const agenda = await createAgenda(family.id, 'Event Agenda 1');
      await createEvent(owner.token, agenda.id, validEventData);

      const response = await request(app)
        .get(`/api/events/agenda/${agenda.id}/events`)
        .set(buildHeaders(owner.token))
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe(validEventData.name);
      expect(response.body[0].description).toBe(validEventData.description);
    });

    test('should return 404 when no events exist for the agenda', async () => {
      const owner = await createUser('event-owner-2', 'event-owner-2@example.com');
      const family = await createFamily(owner.userId, 'Event Family 2');
      const agenda = await createAgenda(family.id, 'Event Agenda 2');

      const response = await request(app)
        .get(`/api/events/agenda/${agenda.id}/events`)
        .set(buildHeaders(owner.token))
        .expect(404);

      expect(response.body.error).toBe('Events not found');
    });

    test('should return 404 for non-existing agenda', async () => {
      const owner = await createUser('event-owner-3', 'event-owner-3@example.com');

      const response = await request(app)
        .get(`/api/events/agenda/${missingUuid}/events`)
        .set(buildHeaders(owner.token))
        .expect(404);

      expect(response.body.error).toBe('Agenda not found');
    });

    test('should return 422 for invalid agenda ID', async () => {
      const owner = await createUser('event-owner-4', 'event-owner-4@example.com');

      const response = await request(app)
        .get('/api/events/agenda/not-a-uuid/events')
        .set(buildHeaders(owner.token))
        .expect(422);

      expect(response.body.error).toBe('Validation of the data failed');
    });

    test('should return 403 for unauthorized user', async () => {
      const owner = await createUser('event-owner-5', 'event-owner-5@example.com');
      const outsider = await createUser('event-outsider-1', 'event-outsider-1@example.com');
      const family = await createFamily(owner.userId, 'Event Family 5');
      const agenda = await createAgenda(family.id, 'Event Agenda 5');

      const response = await request(app)
        .get(`/api/events/agenda/${agenda.id}/events`)
        .set(buildHeaders(outsider.token))
        .expect(403);

      expect(response.body.error).toBe('Access denied to this agenda');
    });
  });

  describe('GET /api/events/:eventId', () => {
    test('should get event by ID', async () => {
      const owner = await createUser('event-owner-6', 'event-owner-6@example.com');
      const family = await createFamily(owner.userId, 'Event Family 6');
      const agenda = await createAgenda(family.id, 'Event Agenda 6');
      const event = await createEvent(owner.token, agenda.id, validEventData);

      const response = await request(app)
        .get(`/api/events/${event.id}`)
        .set(buildHeaders(owner.token))
        .expect(200);

      expect(response.body.id).toBe(event.id);
      expect(response.body.name).toBe(validEventData.name);
      expect(response.body.type).toBe(validEventData.type);
    });

    test('should return 404 for non-existing event', async () => {
      const owner = await createUser('event-owner-7', 'event-owner-7@example.com');

      const response = await request(app)
        .get(`/api/events/${missingUuid}`)
        .set(buildHeaders(owner.token))
        .expect(404);

      expect(response.body.error).toBe('Event not found');
    });

    test('should return 422 for invalid event ID', async () => {
      const owner = await createUser('event-owner-8', 'event-owner-8@example.com');

      const response = await request(app)
        .get('/api/events/not-a-uuid')
        .set(buildHeaders(owner.token))
        .expect(422);

      expect(response.body.error).toBe('Validation of the data failed');
    });

    test('should return 403 for unauthorized user', async () => {
      const owner = await createUser('event-owner-9', 'event-owner-9@example.com');
      const outsider = await createUser('event-outsider-2', 'event-outsider-2@example.com');
      const family = await createFamily(owner.userId, 'Event Family 9');
      const agenda = await createAgenda(family.id, 'Event Agenda 9');
      const event = await createEvent(owner.token, agenda.id, validEventData);

      const response = await request(app)
        .get(`/api/events/${event.id}`)
        .set(buildHeaders(outsider.token))
        .expect(403);

      expect(response.body.error).toBe('Access denied to this agenda');
    });
  });

  describe('POST /api/events/agenda/:agendaId/events', () => {
    test('should create a new event', async () => {
      const owner = await createUser('event-owner-10', 'event-owner-10@example.com');
      const family = await createFamily(owner.userId, 'Event Family 10');
      const agenda = await createAgenda(family.id, 'Event Agenda 10');

      const response = await request(app)
        .post(`/api/events/agenda/${agenda.id}/events`)
        .set(buildHeaders(owner.token))
        .send(validEventData)
        .expect(201);

      expect(response.body.id).toBeDefined();
      expect(response.body.name).toBe(validEventData.name);
      expect(response.body.description).toBe(validEventData.description);
      expect(response.body.type).toBe(validEventData.type);
    });

    test('should return 404 for non-existing agenda', async () => {
      const owner = await createUser('event-owner-11', 'event-owner-11@example.com');

      const response = await request(app)
        .post(`/api/events/agenda/${missingUuid}/events`)
        .set(buildHeaders(owner.token))
        .send(validEventData)
        .expect(404);

      expect(response.body.error).toBe('Agenda not found');
    });

    test('should return 422 for invalid event data', async () => {
      const owner = await createUser('event-owner-12', 'event-owner-12@example.com');
      const family = await createFamily(owner.userId, 'Event Family 12');
      const agenda = await createAgenda(family.id, 'Event Agenda 12');

      const response = await request(app)
        .post(`/api/events/agenda/${agenda.id}/events`)
        .set(buildHeaders(owner.token))
        .send({
          name: '',
          description: 'Missing type and dates',
        })
        .expect(422);

      expect(response.body.error).toBe('Validation of the data failed');
    });

    test('should return 422 for invalid agenda ID', async () => {
      const owner = await createUser('event-owner-13', 'event-owner-13@example.com');

      const response = await request(app)
        .post('/api/events/agenda/not-a-uuid/events')
        .set(buildHeaders(owner.token))
        .send(validEventData)
        .expect(422);

      expect(response.body.error).toBe('Validation of the data failed');
    });

    test('should return 403 for unauthorized user', async () => {
      const owner = await createUser('event-owner-14', 'event-owner-14@example.com');
      const outsider = await createUser('event-outsider-3', 'event-outsider-3@example.com');
      const family = await createFamily(owner.userId, 'Event Family 14');
      const agenda = await createAgenda(family.id, 'Event Agenda 14');

      const response = await request(app)
        .post(`/api/events/agenda/${agenda.id}/events`)
        .set(buildHeaders(outsider.token))
        .send(validEventData)
        .expect(403);

      expect(response.body.error).toBe('Access denied to this agenda');
    });
  });

  describe('PUT /api/events/:eventId', () => {
    test('should update an existing event', async () => {
      const owner = await createUser('event-owner-15', 'event-owner-15@example.com');
      const family = await createFamily(owner.userId, 'Event Family 15');
      const agenda = await createAgenda(family.id, 'Event Agenda 15');
      const event = await createEvent(owner.token, agenda.id, validEventData);

      const updatedEvent = {
        name: 'Updated meeting',
        description: 'Updated description',
        type: 'workshop',
        startDatetime: new Date('2026-05-18T12:00:00.000Z'),
        endDatetime: new Date('2026-05-18T13:00:00.000Z'),
      };

      const response = await request(app)
        .put(`/api/events/${event.id}`)
        .set(buildHeaders(owner.token))
        .send(updatedEvent)
        .expect(200);

      expect(response.body.id).toBe(event.id);
      expect(response.body.name).toBe(updatedEvent.name);
      expect(response.body.type).toBe(updatedEvent.type);
    });

    test('should return 404 for non-existing event', async () => {
      const owner = await createUser('event-owner-16', 'event-owner-16@example.com');

      const response = await request(app)
        .put(`/api/events/${missingUuid}`)
        .set(buildHeaders(owner.token))
        .send(validEventData)
        .expect(404);

      expect(response.body.error).toBe('Event not found');
    });

    test('should return 422 for invalid event data', async () => {
      const owner = await createUser('event-owner-17', 'event-owner-17@example.com');
      const family = await createFamily(owner.userId, 'Event Family 17');
      const agenda = await createAgenda(family.id, 'Event Agenda 17');
      const event = await createEvent(owner.token, agenda.id, validEventData);

      const response = await request(app)
        .put(`/api/events/${event.id}`)
        .set(buildHeaders(owner.token))
        .send({ name: '' })
        .expect(422);

      expect(response.body.error).toBe('Validation of the data failed');
    });

    test('should return 422 for invalid event ID', async () => {
      const owner = await createUser('event-owner-18', 'event-owner-18@example.com');

      const response = await request(app)
        .put('/api/events/not-a-uuid')
        .set(buildHeaders(owner.token))
        .send(validEventData)
        .expect(422);

      expect(response.body.error).toBe('Validation of the data failed');
    });

    test('should return 403 for unauthorized user', async () => {
      const owner = await createUser('event-owner-19', 'event-owner-19@example.com');
      const outsider = await createUser('event-outsider-4', 'event-outsider-4@example.com');
      const family = await createFamily(owner.userId, 'Event Family 19');
      const agenda = await createAgenda(family.id, 'Event Agenda 19');
      const event = await createEvent(owner.token, agenda.id, validEventData);

      const response = await request(app)
        .put(`/api/events/${event.id}`)
        .set(buildHeaders(outsider.token))
        .send(validEventData)
        .expect(403);

      expect(response.body.error).toBe('Access denied to this agenda');
    });
  });

  describe('DELETE /api/events/:eventId', () => {
    test('should delete an existing event', async () => {
      const owner = await createUser('event-owner-20', 'event-owner-20@example.com');
      const family = await createFamily(owner.userId, 'Event Family 20');
      const agenda = await createAgenda(family.id, 'Event Agenda 20');
      const event = await createEvent(owner.token, agenda.id, validEventData);

      const response = await request(app)
        .delete(`/api/events/${event.id}`)
        .set(buildHeaders(owner.token))
        .expect(200);

      expect(response.body.message).toBe('Event deleted successfully');

      await request(app)
        .get(`/api/events/${event.id}`)
        .set(buildHeaders(owner.token))
        .expect(404);
    });

    test('should return 404 for non-existing event', async () => {
      const owner = await createUser('event-owner-21', 'event-owner-21@example.com');

      const response = await request(app)
        .delete(`/api/events/${missingUuid}`)
        .set(buildHeaders(owner.token))
        .expect(404);

      expect(response.body.error).toBe('Event not found');
    });

    test('should return 422 for invalid event ID', async () => {
      const owner = await createUser('event-owner-22', 'event-owner-22@example.com');

      const response = await request(app)
        .delete('/api/events/not-a-uuid')
        .set(buildHeaders(owner.token))
        .expect(422);

      expect(response.body.error).toBe('Validation of the data failed');
    });

    test('should return 403 for unauthorized user', async () => {
      const owner = await createUser('event-owner-23', 'event-owner-23@example.com');
      const outsider = await createUser('event-outsider-5', 'event-outsider-5@example.com');
      const family = await createFamily(owner.userId, 'Event Family 23');
      const agenda = await createAgenda(family.id, 'Event Agenda 23');
      const event = await createEvent(owner.token, agenda.id, validEventData);

      const response = await request(app)
        .delete(`/api/events/${event.id}`)
        .set(buildHeaders(outsider.token))
        .expect(403);

      expect(response.body.error).toBe('Access denied to this agenda');
    });
  });
});
