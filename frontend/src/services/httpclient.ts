import axios from 'axios'
import { useAuthStore } from '@/stores/auth.store'

const clientHttp = axios.create()

clientHttp.interceptors.request.use((config) => {
  const authStore = useAuthStore()

  if (authStore.isUserAuthenticated()) {
    config.headers['Authorization'] = `Bearer ${authStore.getToken()}`
  }

  return config
})

export default clientHttp
