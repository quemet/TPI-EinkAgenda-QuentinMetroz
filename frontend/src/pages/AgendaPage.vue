<script setup lang="ts">
import SidebarComponent from '@/components/sidebar/SidebarComponent.vue'
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { EventData } from '@/types/event.type'
import { useFamilyStore } from '@/stores/family.store'
import {
  increaseMonth,
  decreaseMonth,
  getCurrentMonthName,
  getAllDayInMonth,
  getEventsForDay,
} from '@/utils/agenda.util'

import { getEvents, createEvent, updateEvent, getAllFamilies } from '@/services/agenda.service'

const props = defineProps({
  agendaId: String,
})

const token = localStorage.getItem('token') as string

const events = ref<EventData[]>([])
const month = ref(new Date().getMonth())
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
const year = ref(new Date().getFullYear())
const daysShort = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

const router = useRouter()
const familyStore = useFamilyStore()
const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const dialogRef = ref<HTMLDialogElement | null>(null)
const dialogUpdateRef = ref<HTMLDialogElement | null>(null)
const updatedEventId = ref('')

const eventName = ref('')
const eventDescription = ref('')
const eventType = ref('')
const eventStartDatetime = ref('')
const eventEndDatetime = ref('')

const updatedEventName = ref('')
const updatedEventDescription = ref('')
const updatedEventType = ref('')
const updatedEventStartDatetime = ref('')
const updatedEventEndDatetime = ref('')

const families = ref<{ id: string; name: string }[]>([])
const allDays = computed(() => getAllDayInMonth(month.value, year.value))

const selectFamily = (id: string) => {
  familyStore.setFamilyId(id)
  isOpen.value = false
  router.push(`/dashboard/${id}`)
}

const fillUpdatedVariable = (event: EventData) => {
  updatedEventName.value = event.name
  updatedEventDescription.value = event.description
  updatedEventType.value = event.type
  updatedEventStartDatetime.value = event.startDatetime.substring(0, event.startDatetime.length - 5)
  updatedEventEndDatetime.value = event.endDatetime.substring(0, event.endDatetime.length - 5)
}

const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

const logout = () => {
  localStorage.removeItem('token')
  familyStore.setFamilyId(null)
  isOpen.value = false
  router.push('/')
}

onMounted(async () => {
  try {
    events.value = await getEvents(token, props.agendaId!)
    const fms = await getAllFamilies()
    families.value = fms
    const first = families.value[0]
    if (!familyStore.familyId && first) {
      familyStore.setFamilyId(first.id)
    }
    document.addEventListener('mousedown', handleClickOutside)
  } catch (error) {
    console.error('Error in onMounted:', error)
    router.push('/home')
  } finally {
    console.info('Finished fetching events')
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})
</script>

<template>
  <div class="flex flex-col h-screen">
    <div
      class="bg-[#F0EEE9] p-4 w-full h-1/7 flex flex-row items-center justify-between border-b-2 border-black"
    >
      <div class="text-xl font-bold">EinkAgenda</div>
      <button class="bg-white border border-black rounded w-32 h-10">Aujord'hui</button>
      <span class="font-semibold text-lg flex items-center gap-4">
        <span
          @click="
            () => {
              const result = decreaseMonth(month, year)
              month = result.month
              year = result.year
            }
          "
          class="cursor-pointer font-bold text-xl"
          >&lt;</span
        >
        <span
          @click="
            () => {
              const result = increaseMonth(month, year)
              month = result.month
              year = result.year
            }
          "
          class="cursor-pointer font-bold text-xl"
          >&gt;</span
        >
        {{ getCurrentMonthName(months, month) }} {{ year }}
      </span>
      <button
        class="bg-[#009CAA] text-white px-4 py-2 rounded hover:bg-[#007a88]"
        @click="dialogRef?.showModal()"
      >
        Ajouter un événement
      </button>
      <div ref="dropdownRef" class="relative">
        <div class="cursor-pointer" @click="isOpen = !isOpen">
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

        <div
          v-if="isOpen"
          class="absolute right-0 mt-1 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden"
        >
          <button
            class="w-full text-left px-4 py-3 text-sm hover:bg-gray-50"
            @click="isOpen = false"
          >
            Profil
          </button>

          <div class="border-t border-gray-100" />

          <div class="px-4 pt-2 pb-1 text-xs text-gray-400 font-medium uppercase tracking-wide">
            Familles
          </div>
          <button
            v-for="family in families"
            :key="family.id"
            class="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between"
            :class="familyStore.familyId === family.id ? 'text-[#009CAA] font-medium' : ''"
            @click="selectFamily(family.id)"
          >
            {{ family.name }}
            <span v-if="familyStore.familyId === family.id">✓</span>
          </button>

          <div class="border-t border-gray-100" />

          <button
            class="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 text-red-500"
            @click="logout"
          >
            Déconnexion
          </button>
        </div>
      </div>
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
                  v-for="event in getEventsForDay(events, allDays[(i - 1) * 7 + j - 1])"
                  :key="event.id"
                  class="text-xs text-gray-700 bg-gray-200 rounded px-1 cursor-pointer"
                  @click="
                    (e) => {
                      fillUpdatedVariable(event)
                      updatedEventId = event.id
                      dialogUpdateRef?.showModal()
                    }
                  "
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

  <dialog
    ref="dialogRef"
    class="rounded-lg border border-gray-300 p-0 ml-auto mr-auto mt-auto mb-auto"
  >
    <div class="flex flex-col p-6 w-[400px]">
      <div>
        <h2 class="text-lg font-bold mb-4">Ajouter un événement</h2>
        <div class="border-b border-gray-300"></div>
      </div>

      <div>
        <form>
          <div>
            <label for="event-name" class="block text-sm font-medium text-gray-700 mb-1">
              Nom de l'événement
            </label>
            <input
              v-model="eventName"
              type="text"
              id="event-name"
              name="event-name"
              class="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-[#009CAA]"
            />
          </div>

          <div>
            <label for="event-description" class="block text-sm font-medium text-gray-700 mb-1">
              Description de l'événement
            </label>
            <input
              v-model="eventDescription"
              type="text"
              id="event-description"
              name="event-description"
              class="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-[#009CAA]"
            />
          </div>

          <div>
            <label for="event-type" class="block text-sm font-medium text-gray-700 mb-1">
              Type d'événement
            </label>
            <input
              v-model="eventType"
              type="text"
              id="event-type"
              name="event-type"
              class="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-[#009CAA]"
            />
          </div>

          <div>
            <label for="event-start-datetime" class="block text-sm font-medium text-gray-700 mb-1">
              Date de début
            </label>
            <input
              v-model="eventStartDatetime"
              type="datetime-local"
              id="event-start-datetime"
              name="event-start-datetime"
              class="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-[#009CAA]"
            />
          </div>

          <div>
            <label for="event-end-datetime" class="block text-sm font-medium text-gray-700 mb-1">
              Date de fin
            </label>
            <input
              v-model="eventEndDatetime"
              type="datetime-local"
              id="event-end-datetime"
              name="event-end-datetime"
              class="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-[#009CAA]"
            />
          </div>

          <div class="flex justify-end">
            <button
              type="button"
              class="bg-gray-300 text-gray-700 py-1.5 px-4 rounded mr-2 hover:bg-gray-400"
              @click="dialogRef?.close()"
            >
              Annuler
            </button>

            <button
              type="button"
              class="bg-[#009CAA] text-white py-1.5 px-4 rounded hover:bg-[#007a8a]"
              @click="
                createEvent(
                  {
                    name: eventName,
                    description: eventDescription,
                    type: eventType,
                    startDatetime: eventStartDatetime,
                    endDatetime: eventEndDatetime,
                  },
                  agendaId as string,
                ).then((data: { id: string }) => {
                  if (data) {
                    events.push({
                      id: data.id,
                      name: eventName,
                      description: eventDescription,
                      type: eventType,
                      startDatetime: eventStartDatetime,
                      endDatetime: eventEndDatetime,
                    })
                  }
                  dialogRef?.close()
                })
              "
            >
              Créer
            </button>
          </div>
        </form>
      </div>
    </div>
  </dialog>

  <dialog
    ref="dialogUpdateRef"
    class="rounded-lg border border-gray-300 p-0 ml-auto mr-auto mt-auto mb-auto"
  >
    <div class="flex flex-col p-6 w-[400px]">
      <div>
        <h2 class="text-lg font-bold mb-4">Modifier un événement</h2>
        <div class="border-b border-gray-300"></div>
      </div>

      <div>
        <form>
          <div>
            <label for="event-name" class="block text-sm font-medium text-gray-700 mb-1">
              Nom de l'événement
            </label>
            <input
              v-model="updatedEventName"
              type="text"
              id="event-name"
              name="event-name"
              class="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-[#009CAA]"
            />
          </div>

          <div>
            <label for="event-description" class="block text-sm font-medium text-gray-700 mb-1">
              Description de l'événement
            </label>
            <input
              v-model="updatedEventDescription"
              type="text"
              id="event-description"
              name="event-description"
              class="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-[#009CAA]"
            />
          </div>

          <div>
            <label for="event-type" class="block text-sm font-medium text-gray-700 mb-1">
              Type d'événement
            </label>
            <input
              v-model="updatedEventType"
              type="text"
              id="event-type"
              name="event-type"
              class="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-[#009CAA]"
            />
          </div>

          <div>
            <label for="event-start-datetime" class="block text-sm font-medium text-gray-700 mb-1">
              Date de début
            </label>
            <input
              v-model="updatedEventStartDatetime"
              type="datetime-local"
              id="event-start-datetime"
              name="event-start-datetime"
              class="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-[#009CAA]"
            />
          </div>

          <div>
            <label for="event-end-datetime" class="block text-sm font-medium text-gray-700 mb-1">
              Date de fin
            </label>
            <input
              v-model="updatedEventEndDatetime"
              type="datetime-local"
              id="event-end-datetime"
              name="event-end-datetime"
              class="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-[#009CAA]"
            />
          </div>

          <div class="flex justify-end">
            <button
              type="button"
              class="bg-gray-300 text-gray-700 py-1.5 px-4 rounded mr-2 hover:bg-gray-400"
              @click="dialogUpdateRef?.close()"
            >
              Annuler
            </button>

            <button
              type="button"
              class="bg-[#009CAA] text-white py-1.5 px-4 rounded hover:bg-[#007a8a]"
              @click="
                (e) => {
                  updateEvent(updatedEventId, {
                    name: updatedEventName,
                    description: updatedEventDescription,
                    type: updatedEventType,
                    startDatetime: updatedEventStartDatetime,
                    endDatetime: updatedEventEndDatetime,
                  }).then((data: { id: string }) => {
                    const index = events.findIndex((e) => e.id === updatedEventId)
                    if (index !== -1) {
                      events[index] = {
                        id: updatedEventId,
                        name: updatedEventName,
                        description: updatedEventDescription,
                        type: updatedEventType,
                        startDatetime: updatedEventStartDatetime,
                        endDatetime: updatedEventEndDatetime,
                      }
                    }
                  })
                  dialogUpdateRef?.close()
                }
              "
            >
              Modifier
            </button>
          </div>
        </form>
      </div>
    </div>
  </dialog>
</template>
