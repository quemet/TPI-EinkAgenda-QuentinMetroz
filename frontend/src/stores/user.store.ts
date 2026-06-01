import { ref } from 'vue'
import { defineStore } from 'pinia'

type User = {
  id: string
  username: string
  email: string
  role: string
  personType: string
}

export const useUserStore = defineStore('user', () => {
  const user = ref<User>({
    id: '',
    username: '',
    email: '',
    role: '',
    personType: '',
  })

  function setUser(newUser: User) {
    user.value = newUser
  }

  function getUser() {
    return user.value
  }

  return { getUser, setUser }
})
