import type { EventData } from '@/types/event.type'
import httpClient from '@/services/httpclient'

export const getAllFamilies = async () => {
  try {
    const res = await httpClient.get('/api/families', {})
    const data = res.data
    return data
  } catch (error) {
    console.error('Error fetching families:', error)
    return []
  }
}

export const getEvents = async (agendaId: string) => {
  try {
    const res = await httpClient.get(`/api/events/agenda/${agendaId}/events`)
    return res.data
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching events:', error.message)
    } else {
      console.error('Unknown error fetching events:', error)
    }
    return [] as EventData[]
  }
}

export const createEvent = async (dataEvent: Omit<EventData, 'id'>, agendaId: string) => {
  try {
    const res = await httpClient.post(`/api/events/agenda/${agendaId}/events`, {
      name: dataEvent.name,
      description: dataEvent.description,
      type: dataEvent.type,
      startDatetime: dataEvent.startDatetime,
      endDatetime: dataEvent.endDatetime,
    })
    const data = res.data
    return data
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error creating event:', error.message)
    } else {
      console.error('Unknown error creating event:', error)
    }
  }
}

export const updateEvent = async (eventId: string, dataEvent: Partial<EventData>) => {
  const token = localStorage.getItem('token')
  if (!token) return
  try {
    const res = await httpClient.put(`/api/events/${eventId}`, {
      name: dataEvent.name,
      description: dataEvent.description,
      type: dataEvent.type,
      startDatetime: dataEvent.startDatetime,
      endDatetime: dataEvent.endDatetime,
    })
    const data = res.data
    return data
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error updating event:', error.message)
    } else {
      console.error('Unknown error updating event:', error)
    }
  }
}
