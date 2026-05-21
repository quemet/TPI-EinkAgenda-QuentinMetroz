<script setup lang="ts">
import SidebarComponent from '@/components/sidebar/SidebarComponent.vue'
import HeaderComponent from '@/components/header/HeaderComponent.vue'
import { ref, onMounted } from 'vue'
import axios from 'axios'

const getFamilies = async (token: string) => {
  try {
    const res = await axios.get('http://localhost:3000/api/families', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return res.data
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching families:', error.message)
    } else {
      console.error('Unknown error fetching families:', error)
    }
  }
}

const getAllAgendas = async (token: string, families: { id: number }[]) => {
  await Promise.all(
    families.map(async (fam) => {
      try {
        const agendaRes = await axios.get(`http://localhost:3000/api/agendas/${fam.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const agenda = agendaRes.data
        agenda.forEach((ag: { id: number; name: string }) => {
          agendas.value.push({ id: ag.id, name: ag.name })
        })
      } catch {
        console.info(`No agenda found for family`)
      }
    }),
  )
}

const getUserInfo = async (token: string) => {
  try {
    const res = await axios.get('http://localhost:3000/api/user', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return res.data
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching user info:', error.message)
    } else {
      console.error('Unknown error fetching user info:', error)
    }
  }
}

onMounted(async () => {
  try {
    const token = localStorage.getItem('token')

    if (!token) {
      console.warn('No token found, skipping data fetch')
      return
    }

    user.value = await getUserInfo(token)

    families.value = await getFamilies(token)

    await getAllAgendas(token, families.value)

    console.log('Agendas:', agendas.value)
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error during login:', error.message)
    } else {
      console.error('Unknown error during login:', error)
    }
  }
})

const user = ref<{ id: string; username: string; email: string } | null>(null) // TODO: Get the user data from the store or API
const families = ref<{ id: number; name: string }[]>([]) // TODO: Fetch families from the API
const agendas = ref<{ id: number; name: string }[]>([]) // TODO: Fetch agenda items from the API
const date = ref(
  new Date().toLocaleDateString('fr-CH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }),
)
</script>

<template>
  <div class="flex flex-col h-screen">
    <HeaderComponent />
    <div class="flex-1 flex">
      <SidebarComponent />
      <div class="bg-[#F0EEE9] p-6 w-full h-full flex flex-col">
        <div class="flex items-center justify-between mb-2">
          <p class="text-sm text-gray-500">{{ date }}</p>
          <button
            class="bg-[#009CAA] text-white py-1.5 px-4 rounded-full text-sm hover:bg-[#007a88]"
          >
            + Créer une famille
          </button>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 mb-6">Bonjour Mr. {{ user?.username }}</h1>
        <div v-if="agendas.length > 0" class="grid grid-cols-3 gap-6">
          <div
            v-for="agenda in agendas"
            :key="agenda.id"
            class="bg-white rounded border border-gray-200 aspect-square flex items-end p-3 text-sm text-gray-600 cursor-pointer hover:shadow"
          >
            {{ agenda.name }}
          </div>
        </div>
        <div v-else class="text-gray-400 text-sm mt-4">Aucune agenda trouvée.</div>
      </div>
    </div>
  </div>
</template>
