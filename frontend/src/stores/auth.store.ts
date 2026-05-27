import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string>('')

  function isUserAuthenticated() {
    const storedValue = localStorage.getItem('token')
    return !!storedValue
  }

  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  function getToken() {
    if (token.value) {
      return token.value
    }
    const storedValue = localStorage.getItem('token')
    return storedValue as string
  }

  return { isUserAuthenticated, getToken, setToken }
})
