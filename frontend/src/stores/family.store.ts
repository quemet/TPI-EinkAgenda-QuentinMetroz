import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', () => {
  const familyId = ref<string | null>(null)

  function setFamilyId(id: string | null) {
    familyId.value = id
  }

  function getFamilyId() {
    return familyId.value
  }

  return { getFamilyId, setFamilyId }
})
