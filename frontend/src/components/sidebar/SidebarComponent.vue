<script setup lang="ts">
import { useFamilyStore } from '@/stores/family.store'
import { useRouter } from 'vue-router'

const familyStore = useFamilyStore()

const pageLinks = [
  { name: 'Home', path: '/' },
  { name: 'Dashboard', path: `/dashboard/${familyStore.getFamilyId()}` },
]
const router = useRouter()
</script>

<template>
  <div class="bg-[#F0EEE9] p-4 w-64 h-screen border-r-2 border-black-300">
    <nav>
      <div
        v-for="link in pageLinks"
        :key="link.name"
        class="bg-gray-200 p-2 rounded mb-2 cursor-pointer hover:bg-gray-300"
        @click="router.push(link.path)"
      >
        <router-link :to="link.path">{{ link.name }}</router-link>
      </div>
    </nav>
  </div>
</template>
