<script setup lang="ts">
const pageLinks = [
  { name: 'Home', path: '/' },
  { name: 'Agenda', path: '/agenda' },
  { name: 'Dashboard', path: '/dashboard' },
]
</script>

<template>
  <div class="bg-[#F0EEE9] p-4 w-64 h-screen border-r-2 border-black-300">
    <div>EinkAgenda</div>
    <nav>
      <div v-for="link in pageLinks" :key="link.name" class="bg-gray-200 p-2 rounded mb-2">
        <router-link :to="link.path">{{ link.name }}</router-link>
      </div>
    </nav>
  </div>
</template>
