import { describe, it, expect } from 'vitest'
import {
  increaseMonth,
  decreaseMonth,
  getAllDayInMonth,
  getEventsForDay,
  getCurrentMonthName,
} from '@/utils/agenda.util'
import type { EventData } from '@/types/event.type'

const events: EventData[] = [
  {
    id: '1',
    name: 'Event 1',
    description: 'Description for Event 1',
    type: 'work',
    startDatetime: '2026-05-22T08:00:00Z',
    endDatetime: '2026-05-22T10:00:00Z',
  },
  {
    id: '2',
    name: 'Event 2',
    description: 'Description for Event 2',
    type: 'personal',
    startDatetime: '2026-05-23T14:00:00Z',
    endDatetime: '2026-05-23T16:00:00Z',
  },
]

const months: string[] = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

describe('Agenda Utils Unit Tests', () => {
  describe('increaseMonth', () => {
    it('should increase the month by 1', () => {
      const date = new Date(2024, 0, 15)

      const { month, year } = increaseMonth(date.getMonth(), date.getFullYear())

      expect(month).toBe(1)
      expect(year).toBe(2024)
    })

    it('should wrap around to January when increasing from December', () => {
      const date = new Date(2024, 11, 15)

      const { month, year } = increaseMonth(date.getMonth(), date.getFullYear())

      expect(month).toBe(0)
      expect(year).toBe(2025)
    })
  })

  describe('decreaseMonth', () => {
    it('should decrease the month by 1', () => {
      const date = new Date(2024, 1, 15)

      const { month, year } = decreaseMonth(date.getMonth(), date.getFullYear())

      expect(month).toBe(0)
      expect(year).toBe(2024)
    })

    it('should wrap around to December when decreasing from January', () => {
      const date = new Date(2024, 0, 15)

      const { month, year } = decreaseMonth(date.getMonth(), date.getFullYear())

      expect(month).toBe(11)
      expect(year).toBe(2023)
    })
  })

  describe('getAllDayInMonth', () => {
    it('should return all days in February 2024 (leap year)', () => {
      const date = new Date(2024, 1, 1)
      const dates = getAllDayInMonth(date.getMonth(), date.getFullYear())

      expect(dates).toHaveLength(35)

      expect(dates?.[0]?.getDate()).toBe(29)
      expect(dates?.[0]?.getMonth()).toBe(0)
      expect(dates?.[0]?.getFullYear()).toBe(2024)

      expect(dates?.[dates.length - 1]?.getDate()).toBe(3)
      expect(dates?.[dates.length - 1]?.getMonth()).toBe(2)
      expect(dates?.[dates.length - 1]?.getFullYear()).toBe(2024)
    })

    it('should return all days in April 2024', () => {
      const date = new Date(2024, 3, 1)
      const dates = getAllDayInMonth(date.getMonth(), date.getFullYear())

      expect(dates).toHaveLength(35)

      expect(dates?.[0]?.getDate()).toBe(1)
      expect(dates?.[0]?.getMonth()).toBe(3)
      expect(dates?.[0]?.getFullYear()).toBe(2024)

      expect(dates?.[dates.length - 1]?.getDate()).toBe(5)
      expect(dates?.[dates.length - 1]?.getMonth()).toBe(4)
      expect(dates?.[dates.length - 1]?.getFullYear()).toBe(2024)
    })
  })

  describe('getEventsForDay', () => {
    it('should return events for a specific day', () => {
      const date = new Date('2026-05-22T00:00:00Z')
      const eventsForTheDay = getEventsForDay(events, date)

      expect(eventsForTheDay).toHaveLength(1)
      expect(eventsForTheDay[0]?.id).toBe('1')
    })

    it('should return an empty array if there are no events for the day', () => {
      const date = new Date('2026-05-24T00:00:00Z')
      const eventsForTheDay = getEventsForDay(events, date)

      expect(eventsForTheDay).toHaveLength(0)
    })
  })

  describe('getCurrentMonthName', () => {
    it('should return the correct month name for January', () => {
      const monthName = getCurrentMonthName(months, 0)
      expect(monthName).toBe('January')
    })

    it('should return the correct month name for December', () => {
      const monthName = getCurrentMonthName(months, 11)
      expect(monthName).toBe('December')
    })
  })
})
