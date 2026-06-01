<script setup lang="ts">
import SidebarComponent from '@/components/sidebar/SidebarComponent.vue'
import HeaderComponent from '@/components/header/HeaderComponent.vue'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getUserInfo, getFamilies, getAllAgendas, createFamily } from '@/services/home.service'
import { useAuthStore } from '@/stores/auth.store'

const authStore = useAuthStore()

const token = authStore.getToken()
const familyName = ref('')
const router = useRouter()
const dialogRef = ref<HTMLDialogElement | null>(null)
const user = ref<{ id: string; username: string; email: string } | null>(null)
const families = ref<{ id: string; name: string }[]>([])
const agendas = ref<{ id: string; name: string }[]>([])
const date = ref(
  new Date().toLocaleDateString('fr-CH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }),
)

onMounted(async () => {
  try {
    if (!authStore.isUserAuthenticated()) {
      router.push('/login')
      return
    }

    if (!token) {
      console.warn('No token found, skipping data fetch')
      return
    }

    user.value = await getUserInfo(token)

    families.value = await getFamilies(token)

    const apiAgendas = await getAllAgendas(token, families.value)
    const allAgendas = apiAgendas[0]

    allAgendas.forEach((agenda: { id: string; name: string }) => {
      agendas.value.push({ id: agenda.id, name: agenda.name })
    })
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error during the data fetch:', error.message)
    } else {
      console.error('Unknown error during the data fetch:', error)
    }
  }
})
</script>

<template>
  <div class="flex flex-col h-screen">
    <HeaderComponent :families="families" />
    <div class="flex-1 flex">
      <SidebarComponent />
      <div class="bg-[#F0EEE9] p-6 flex flex-col w-full">
        <div class="flex items-center justify-between mb-2">
          <p class="text-sm text-gray-500">{{ date }}</p>
          <button
            class="bg-[#009CAA] text-white py-1.5 px-4 rounded-full text-sm hover:bg-[#007a88]"
            @click="dialogRef?.showModal()"
          >
            + Créer une famille
          </button>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 mb-6">Bonjour Mr. {{ user?.username }}</h1>
        <div v-if="agendas.length > 0" class="grid grid-cols-3 gap-6">
          <div
            v-for="agenda in agendas"
            :key="agenda.id"
            class="bg-white rounded border border-gray-200 aspect-square flex items-end p-3 text-sm text-gray-600 cursor-pointer hover:shadow w-[80%]"
            @click="() => router.push(`/agenda/${agenda.id}`)"
          >
            {{ agenda.name }}
          </div>
        </div>
        <div v-else class="text-gray-400 text-sm mt-4">Aucune agenda trouvée.</div>
      </div>
    </div>
  </div>

  <dialog
    ref="dialogRef"
    class="rounded-lg border border-gray-300 p-0 ml-auto mr-auto mt-auto mb-auto"
  >
    <div class="flex flex-col p-6 w-[400px]">
      <div>
        <h2 class="text-lg font-bold mb-4">Créer une famille</h2>
        <div class="border-b border-gray-300"></div>
      </div>

      <div>
        <form>
          <label for="familyName" class="block text-sm font-medium text-gray-700 mb-1"
            >Nom de la famille</label
          >
          <input
            type="text"
            id="familyName"
            name="familyName"
            class="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-[#009CAA]"
            v-model="familyName"
          />
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
              class="bg-[#009CAA] text-white py-1.5 px-4 rounded hover:bg-[#007a88]"
              @click="
                createFamily(familyName, token).then((data) => {
                  console.log('Family created:', data)
                  families.push({ id: data.id, name: data.name })
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
</template>
