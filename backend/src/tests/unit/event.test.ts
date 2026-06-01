import { describe, expect, test } from '@jest/globals';
import '../setup';
import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../../services/event.service';
import User from '../../models/user.model';
import Agenda from '../../models/agenda.model';
import Event from '../../models/event.model';
import Family from '../../models/family.model';
import Belong from '../../models/belong.model';

const createTestUser = async () => {
  const user = await User.create({
    username: 'testuser',
    email: 'test@gmail.com',
    password: 'password123',
    role: 'user',
    personType: 'young',
  });
  return user.id;
};

const createTestAgenda = async (userId: string) => {
  const family = await Family.create({ name: 'Test Family' });
  await Belong.create({ user_id: userId, family_id: family.id });
  const agenda = await Agenda.create({ name: 'Test Agenda', familyId: family.id, appertainTo: userId });
  return agenda.id;
};

const createTestAgendaWithoutUserAccess = async () => {
  const family = await Family.create({ name: 'Test Family 2' });
  const agenda = await Agenda.create({ name: 'Test Agenda 2', familyId: family.id, appertainTo: '00000000-0000-0000-0000-000000000000' });
  return agenda.id;
};

const createTestEvent = async (agendaId: string) => {
  const event = await Event.create({
    name: 'Test Event',
    description: 'This is a test event',
    type: 'test',
    startDatetime: new Date(),
    endDatetime: new Date(Date.now() + 3600000), // 1 hour later
    agendaId,
  });
  return event.id;
};

describe('Event Unit tests', () => {
  describe('Check Agenda Access', () => {
    test('Agenda should be accessible to its members', async () => {
      const userId = await createTestUser();
      const agendaId = await createTestAgenda(userId);
      await createTestEvent(agendaId); // Create an event to ensure the agenda is not empty

      await expect(getAllEvents(userId, agendaId)).resolves.not.toThrow();
    });

    test('Agenda should not be accessible to non-members', async () => {
      const userId = await createTestUser();
      const agendaId = await createTestAgendaWithoutUserAccess();

      await expect(getAllEvents(userId, agendaId)).rejects.toThrow('Access denied to this agenda');
    });

    test('Agenda should exist', async () => {
      await expect(getAllEvents('nonexistentUserId', 'nonexistentAgendaId')).rejects.toThrow(
        'Agenda not found',
      );
    });
  });

  describe('Get all events', () => {
    test('should get all events for an agenda', async () => {
      const userId = await createTestUser();
      const agendaId = await createTestAgenda(userId);
      const eventId = await createTestEvent(agendaId);
      const event2Id = await createTestEvent(agendaId);

      const events = await getAllEvents(userId, agendaId);

      expect(events).toHaveLength(2);
      expect(events[0].id).toBe(eventId);
      expect(events[1].id).toBe(event2Id);
    });

    test('should throw error if no events found', async () => {
      const userId = await createTestUser();
      const agendaId = await createTestAgenda(userId);

      await expect(getAllEvents(userId, agendaId)).rejects.toThrow('Events not found');
    });
  });

  describe('Get event by ID', () => {
    test('should get event by ID', async () => {
      const userId = await createTestUser();
      const agendaId = await createTestAgenda(userId);
      const eventId = await createTestEvent(agendaId);

      const event = await getEventById(userId, eventId);

      expect(event).toBeDefined();
      expect(event.id).toBe(eventId);
    });

    test('should throw error if event not found', async () => {
      const userId = await createTestUser();

      await expect(getEventById(userId, 'nonexistentEventId')).rejects.toThrow('Event not found');
    });
  });

  describe('Create event', () => {
    test('should create event', async () => {
      const userId = await createTestUser();
      const agendaId = await createTestAgenda(userId);

      const eventData = {
        name: 'New Event',
        description: 'This is a new event',
        type: 'test',
        startDatetime: new Date(),
        endDatetime: new Date(Date.now() + 3600000), // 1 hour later
        agendaId,
      };

      const event = await createEvent(userId, agendaId, eventData);

      expect(event).toBeDefined();
      expect(event.name).toBe(eventData.name);
      expect(event.description).toBe(eventData.description);
      expect(event.type).toBe(eventData.type);
      expect(event.agendaId).toBe(agendaId);
    });
  });

  describe('Update event', () => {
    test('should update event', async () => {
      const userId = await createTestUser();
      const agendaId = await createTestAgenda(userId);
      const eventId = await createTestEvent(agendaId);
      const updatedData = {
        name: 'Updated Event',
        description: 'This is an updated event',
        type: 'updated-test',
        startDatetime: new Date(),
        endDatetime: new Date(Date.now() + 7200000), // 2 hours later
      };
      const updatedEvent = await updateEvent(userId, eventId, updatedData);

      expect(updatedEvent).toBeDefined();
      expect(updatedEvent.name).toBe(updatedData.name);
      expect(updatedEvent.description).toBe(updatedData.description);
      expect(updatedEvent.type).toBe(updatedData.type);
    });

    test('should throw error if event not found', async () => {
      const userId = await createTestUser();
      const updatedData = {
        name: 'Updated Event',
        description: 'This is an updated event',
        type: 'updated-test',
        startDatetime: new Date(),
        endDatetime: new Date(Date.now() + 7200000), // 2 hours later
      };
      await expect(updateEvent(userId, 'nonexistentEventId', updatedData)).rejects.toThrow(
        'Event not found',
      );
    });
  });

  describe('Delete event', () => {
    test('should delete event', async () => {
      const userId = await createTestUser();
      const agendaId = await createTestAgenda(userId);
      const eventId = await createTestEvent(agendaId);
      await deleteEvent(userId, eventId);
      await expect(getEventById(userId, eventId)).rejects.toThrow('Event not found');
    });

    test('should throw error if event not found', async () => {
      const userId = await createTestUser();
      await expect(deleteEvent(userId, 'nonexistentEventId')).rejects.toThrow('Event not found');
    });
  });
});
