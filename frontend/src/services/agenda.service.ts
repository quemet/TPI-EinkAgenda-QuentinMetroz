import axios from 'axios'
import type { EventData } from '@/types/event.type'

export const getAllFamilies = async () => {
  const token = localStorage.getItem('token')
  if (!token) return
  try {
    const res = await axios.get('http://localhost:3000/api/families', {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = res.data
    return data
  } catch (error) {
    console.error('Error fetching families:', error)
    return []
  }
}

export const getEvents = async (token: string, agendaId: string) => {
  try {
    const res = await axios.get(`http://localhost:3000/api/events/agenda/${agendaId}/events`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
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
  const token = localStorage.getItem('token')
  if (!token) return
  try {
    const res = await axios.post(
      `http://localhost:3000/api/events/agenda/${agendaId}/events`,
      {
        name: dataEvent.name,
        description: dataEvent.description,
        type: dataEvent.type,
        startDatetime: dataEvent.startDatetime,
        endDatetime: dataEvent.endDatetime,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )
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
    const res = await axios.put(
      `http://localhost:3000/api/events/${eventId}`,
      {
        name: dataEvent.name,
        description: dataEvent.description,
        type: dataEvent.type,
        startDatetime: dataEvent.startDatetime,
        endDatetime: dataEvent.endDatetime,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )
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
