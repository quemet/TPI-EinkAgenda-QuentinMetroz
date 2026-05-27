import type { EventData } from '@/types/event.type'

export const increaseMonth = (month: number, year: number) => {
  if (month < 11) {
    month++
  } else {
    month = 0
    year++
  }

  return { month, year }
}

export const decreaseMonth = (month: number, year: number) => {
  if (month > 0) {
    month--
  } else {
    month = 11
    year--
  }

  return { month, year }
}

export const getAllDayInMonth = (month: number, year: number) => {
  let firstMonday: Date | null = null
  let lastSunday: Date | null = null

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)

  const isFirstDayOfWeekMonday = firstDayOfMonth.getDay() === 1
  const isLastDayOfWeekSunday = lastDayOfMonth.getDay() === 0

  if (!isFirstDayOfWeekMonday) {
    const dayNum = firstDayOfMonth.getDay()
    firstMonday = new Date(
      new Date(firstDayOfMonth).setDate(firstDayOfMonth.getDate() - (dayNum === 0 ? 6 : dayNum - 1)),
    )
  } else {
    firstMonday = firstDayOfMonth
  }

  if (!isLastDayOfWeekSunday) {
    const dayNum = lastDayOfMonth.getDay()
    lastSunday = new Date(new Date(lastDayOfMonth).setDate(lastDayOfMonth.getDate() + (7 - dayNum)))
  } else {
    lastSunday = lastDayOfMonth
  }

  const allDays: Date[] = []

  for (
    let date = new Date(firstMonday!);
    date <= new Date(lastSunday!);
    date.setDate(date.getDate() + 1)
  ) {
    allDays.push(new Date(date))
  }

  return allDays
}

export const getEventsForDay = (events: EventData[], day: Date) => {
  return events.filter((event) => {
    const eventDate = new Date(event.startDatetime)
    return (
      eventDate.getDate() === day.getDate() &&
      eventDate.getMonth() === day.getMonth() &&
      eventDate.getFullYear() === day.getFullYear()
    )
  })
}

export const getCurrentMonthName = (months: string[], month: number) => {
  return months[month]
}
