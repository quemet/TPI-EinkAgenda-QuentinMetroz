<script setup lang="ts">
import SidebarComponent from '@/components/sidebar/SidebarComponent.vue'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import type { EventData } from '@/types/event.type'

const props = defineProps({
  agendaId: String,
})
const router = useRouter()

const events = ref<EventData[] | []>([])
const month = ref(new Date().getMonth())
const year = ref(new Date().getFullYear())
const daysShort = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const months = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
]

onMounted(async () => {
  try {
    events.value = await getEvents(localStorage.getItem('token') || '')
    console.info('Fetched events:', events.value)
  } catch (error) {
    console.error('Error in onMounted:', error)
    router.push('/home')
  } finally {
    console.info('Finished fetching events')
  }
})

const getCurrentMonthName = (month: number) => {
  return months[month]
}

const increaseMonth = () => {
  if (month.value < 11) {
    month.value++
  } else {
    month.value = 0
    year.value++
  }
}

const decreaseMonth = () => {
  if (month.value > 0) {
    month.value--
  } else {
    month.value = 11
    year.value--
  }
}

const getAllDayInMonth = (month: number, year: number) => {
  let firstMonday: Date | null = null
  let lastSunday: Date | null = null

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)

  const isFirstDayOfWeekMonday = firstDayOfMonth.getDay() === 1
  const isLastDayOfWeekSunday = lastDayOfMonth.getDay() === 0

  if (!isFirstDayOfWeekMonday) {
    const dayNum = firstDayOfMonth.getDay()
    firstMonday = new Date(
      new Date().setDate(firstDayOfMonth.getDate() - (dayNum === 0 ? 6 : dayNum - 1)),
    )
  } else {
    firstMonday = firstDayOfMonth
  }

  if (!isLastDayOfWeekSunday) {
    const dayNum = lastDayOfMonth.getDay()
    lastSunday = new Date(new Date().setDate(lastDayOfMonth.getDate() + (7 - dayNum)))
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
  allDays.push(new Date(lastSunday!))

  return allDays
}

const getEventsForDay = (day: Date) => {
  return events.value.filter((event) => {
    const eventDate = new Date(event.startDatetime)
    return (
      eventDate.getDate() === day.getDate() &&
      eventDate.getMonth() === day.getMonth() &&
      eventDate.getFullYear() === day.getFullYear()
    )
  })
}

const getEvents = async (token: string) => {
  try {
    const res = await axios.get(
      `http://localhost:3000/api/events/agenda/${props.agendaId}/events`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )
    return res.data
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching events:', error.message)
    } else {
      console.error('Unknown error fetching events:', error)
    }
  }
}

const allDays = getAllDayInMonth(month.value, year.value)
</script>

<template>
  <div class="flex flex-col h-screen">
    <div
      class="bg-[#F0EEE9] p-4 w-full h-1/7 flex flex-row items-center justify-between border-b-2 border-black"
    >
      <div class="text-xl font-bold">EinkAgenda</div>
      <button class="bg-white border border-black rounded w-32 h-10">Aujord'hui</button>
      <span class="font-semibold text-lg flex items-center gap-4">
        <span @click="decreaseMonth" class="cursor-pointer font-bold text-xl">&lt;</span>
        <span @click="increaseMonth" class="cursor-pointer font-bold text-xl">&gt;</span>
        {{ getCurrentMonthName(month) }} {{ year }}
      </span>
      <button class="bg-[#009CAA] text-white px-4 py-2 rounded hover:bg-[#007a88]">
        Ajouter un événement
      </button>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="64"
        height="64"
        fill="none"
        stroke="gray"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 14a4 4 0 0 0-4 4v2h8v-2a4 4 0 0 0-4-4Z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    </div>
    <div class="flex flex-row">
      <SidebarComponent />
      <div class="bg-[#F0EEE9] p-6 w-full h-full flex flex-col">
        <div v-for="i in allDays.length / 7" :key="i">
          <div>
            <div class="flex flex-row">
              <div
                v-for="j in 7"
                :key="j"
                class="w-1/7 h-32 border border-gray-300 flex flex-col items-start p-2 gap-1 bg-white"
              >
                <span class="text-sm font-semibold">{{ daysShort[(i - 1) * 7 + j - 1] }}</span>
                <span class="text-xs text-gray-500">{{
                  allDays[(i - 1) * 7 + j - 1].getDate()
                }}</span>
                <span
                  v-for="event in getEventsForDay(allDays[(i - 1) * 7 + j - 1])"
                  :key="event.id"
                  class="text-xs text-gray-700 bg-gray-200 rounded px-1"
                >
                  {{ event.name }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
