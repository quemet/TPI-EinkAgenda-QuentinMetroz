<script lang="ts" setup>
import HeaderComponent from '@/components/header/HeaderComponent.vue'
import SidebarComponent from '@/components/sidebar/SidebarComponent.vue'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

import {
  createAgenda,
  deleteAgenda,
  getAllFamilyAgenda,
  getAllFamilyUsers,
  modifyAgendaName,
  removeUserFromFamily,
  changeUserRole,
  getMe,
} from '@/services/dashboard.service'

import {
  askConfirmationForTheChangmentOfRole,
  askForAgendaName,
  askUserConfirmation,
  copyLink,
  createAddMemberLink,
} from '@/utils/dashboard.util'

const router = useRouter()
const authStore = useAuthStore()

const props = defineProps({
  familyId: {
    type: String,
    required: true,
  },
})

const token = authStore.getToken()
const agendas = ref<{ id: string; name: string }[]>([])
const familyUsers = ref<
  { id: string; username: string; email: string; role: string; personType: 'young' | 'elder' }[]
>([])
const me = ref<{
  id: string
  username: string
  email: string
  role: string
  personType: 'young' | 'elder'
} | null>(null)

const dialogRef = ref<HTMLDialogElement | null>(null)
const addMemberDialogRef = ref<HTMLDialogElement | null>(null)
const agendaName = ref('')
const agendaProprietary = ref('')
const linkCopied = ref(false)

onMounted(async () => {
  if (!authStore.isUserAuthenticated()) {
    router.push('/login')
    return
  }
  agendas.value = await getAllFamilyAgenda(token, props.familyId)
  familyUsers.value = await getAllFamilyUsers(token, props.familyId)
  me.value = await getMe(token)
})
</script>

<template>
  <div class="h-screen flex flex-col bg-[#F0EEE9]">
    <HeaderComponent />
    <div class="flex flex-row flex-1 overflow-hidden">
      <SidebarComponent />
      <div class="flex flex-row flex-1 overflow-hidden">
        <!-- Left: Agenda de la famille -->
        <div class="flex flex-col w-1/2 border-r border-gray-300">
          <h2 class="text-center text-lg p-4 border-b border-gray-300">Agenda de la famille</h2>
          <div class="flex-1 overflow-y-auto p-6">
            <div class="grid grid-cols-2 gap-4">
              <div
                v-for="agenda in agendas"
                :key="agenda.id"
                class="bg-white rounded-xl p-4 flex flex-col items-center justify-between aspect-square shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                clickable
                @click="router.push(`/agenda/${agenda.id}`)"
              >
                <div class="flex-1 flex items-center justify-center text-center text-sm">
                  {{ agenda.name }}
                </div>
                <div class="flex flex-row gap-3">
                  <div
                    @click="
                      (e) => {
                        const newName = askForAgendaName(agenda)
                        modifyAgendaName(token, agenda.id, newName).then((data) => {
                          if (data) {
                            const index = agendas.findIndex((a) => a.id === agenda.id)
                            if (index !== -1) {
                              agendas[index]!.name = newName
                            }
                          }
                        })
                        e.stopPropagation()
                      }
                    "
                    class="hover:text-gray-700"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      fill="none"
                      stroke="gray"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" />
                    </svg>
                  </div>

                  <div
                    @click="
                      (event) => {
                        deleteAgenda(token, agenda.id).then(() => {
                          const index = agendas.findIndex((a) => a.id === agenda.id)
                          if (index !== -1) {
                            agendas.splice(index, 1)
                          }
                        })
                        event.stopPropagation()
                      }
                    "
                    class="hover:text-red-500"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      fill="none"
                      stroke="gray"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6" />
                      <path d="M14 11v6" />
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="p-4 flex justify-center">
            <button
              class="bg-[#009CAA] text-white px-8 py-2 rounded-full"
              @click="dialogRef?.showModal()"
            >
              + Ajouter un agenda
            </button>
          </div>
        </div>

        <!-- Right: Utilisateur de la famille -->
        <div class="flex flex-col w-1/2">
          <h2 class="text-center text-lg p-4 border-b border-gray-300">
            Utilisateur de la famille
          </h2>
          <div class="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
            <!-- Search input -->
            <div class="flex items-center border border-gray-300 rounded-full px-4 py-2 bg-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="gray"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="mr-2 shrink-0"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 14a4 4 0 0 0-4 4v2h8v-2a4 4 0 0 0-4-4Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <input
                type="text"
                placeholder="Entrer un nom d'utilisateur..."
                class="outline-none flex-1 text-sm bg-transparent"
              />
            </div>

            <!-- Users list -->
            <div class="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-3">
              <div
                v-for="user in familyUsers"
                :key="user.id"
                class="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="gray"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="shrink-0"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 14a4 4 0 0 0-4 4v2h8v-2a4 4 0 0 0-4-4Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span class="flex-1 text-sm">{{ user.username }}</span>
                <div
                  @click="
                    (e) => {
                      const isChangedToAdmin = askConfirmationForTheChangmentOfRole(user.role)
                      if (isChangedToAdmin) {
                        changeUserRole(token, user.id, props.familyId).then(() => {
                          const index = familyUsers.findIndex((u) => u.id === user.id)
                          if (index !== -1) {
                            familyUsers[index]!.role = 'admin'
                          }
                        })
                      }
                      e.stopPropagation()
                    }
                  "
                  class="cursor-pointer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    fill="none"
                    stroke="gray"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" />
                  </svg>
                </div>

                <div
                  @click="
                    (e) => {
                      const isConfirmed = askUserConfirmation()
                      if (isConfirmed) {
                        removeUserFromFamily(token, user.id, props.familyId)
                      }
                      e.stopPropagation()
                    }
                  "
                  class="cursor-pointer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    fill="none"
                    stroke="gray"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6" />
                    <path d="M14 11v6" />
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <div class="p-4 flex justify-center">
            <button
              class="bg-[#009CAA] text-white px-8 py-2 rounded-full"
              @click="addMemberDialogRef?.showModal()"
            >
              + Ajouter un membre
            </button>
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
        <h2 class="text-lg font-bold mb-4">Ajouter un agenda</h2>
        <div class="border-b border-gray-300"></div>
      </div>

      <div>
        <form>
          <div>
            <label for="agendaName" class="block text-sm font-medium text-gray-700 mb-1"
              >Nom de l'agenda</label
            >
            <input
              type="text"
              id="agendaName"
              name="agendaName"
              class="border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              v-model="agendaName"
            />
          </div>

          <div>
            <label for="agendaProprietary" class="block text-sm font-medium text-gray-700 mb-1"
              >Propriétaire de l'agenda</label
            >
            <select
              id="agendaProprietary"
              name="agendaProprietary"
              class="border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              v-model="agendaProprietary"
            >
              <option value="">Sélectionnez un propriétaire</option>
              <option v-for="user in familyUsers" :key="user.id" :value="user.id">
                {{ user.username }}
              </option>
            </select>
          </div>

          <div class="flex justify-end gap-2 mt-4">
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
                createAgenda(token, props.familyId, agendaName, agendaProprietary).then((data) => {
                  if (data) {
                    agendas.push({ id: data.id, name: data.name })
                    dialogRef?.close()
                  }
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
    ref="addMemberDialogRef"
    class="rounded-lg border border-gray-300 p-0 ml-auto mr-auto mt-auto mb-auto"
  >
    <div class="flex flex-col p-6 w-[400px] gap-4">
      <h2 class="text-lg font-bold">Ajouter un membre</h2>
      <div class="border-b border-gray-300" />
      <p class="text-sm text-gray-500">
        Partagez ce lien pour inviter un membre à rejoindre la famille.
      </p>
      <div class="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 bg-gray-50">
        <span class="text-sm text-gray-700 flex-1 truncate">{{
          me ? createAddMemberLink(props.familyId, me.id) : ''
        }}</span>
      </div>
      <div class="flex justify-end gap-2">
        <button
          type="button"
          class="bg-gray-200 text-gray-700 py-1.5 px-4 rounded hover:bg-gray-300"
          @click="addMemberDialogRef?.close()"
        >
          Fermer
        </button>
        <button
          type="button"
          class="bg-[#009CAA] text-white py-1.5 px-4 rounded hover:bg-[#007a88]"
          @click="me && copyLink({ value: linkCopied }, props.familyId, me.id)"
        >
          {{ linkCopied ? 'Copié !' : 'Copier le lien' }}
        </button>
      </div>
    </div>
  </dialog>
</template>
