<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useFamilyStore } from '@/stores/family.store'
import fetchFamilies from './header.service'

const props = defineProps<{
  families?: { id: string; name: string }[]
}>()

const router = useRouter()
const familyStore = useFamilyStore()

const fams = ref<{ id: string; name: string }[]>(props.families ?? [])
const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const token = localStorage.getItem('token')

const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

const selectFamily = (id: string) => {
  familyStore.setFamilyId(id)
  isOpen.value = false
  router.push(`/dashboard/${id}`)
}

const logout = () => {
  localStorage.removeItem('token')
  familyStore.setFamilyId(null)
  isOpen.value = false
  router.push('/')
}

onMounted(async () => {
  const fams = await fetchFamilies(token as string)
  const first = fams[0]
  if (!familyStore.familyId && first) {
    familyStore.setFamilyId(first.id)
  }
  document.addEventListener('mousedown', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})
</script>

<template>
  <div
    class="bg-[#F0EEE9] p-4 w-full flex flex-row items-center justify-between border-b-2 border-black"
  >
    <div class="text-xl font-bold">EinkAgenda</div>

    <slot />

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
        <button class="w-full text-left px-4 py-3 text-sm hover:bg-gray-50" @click="isOpen = false">
          Profil
        </button>

        <div class="border-t border-gray-100" />

        <div class="px-4 pt-2 pb-1 text-xs text-gray-400 font-medium uppercase tracking-wide">
          Familles
        </div>
        <button
          v-for="family in fams"
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
</template>
