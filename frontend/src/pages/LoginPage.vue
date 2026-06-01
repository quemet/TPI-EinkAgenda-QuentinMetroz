<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { useUserStore } from '@/stores/user.store'
import { useRouter } from 'vue-router'
import httpClient from '@/services/httpclient'
import { getSignupPath, validateLoginForm } from '@/utils/auth.util'

const authStore = useAuthStore()
const userStore = useUserStore()
const router = useRouter()

const props = defineProps({
  familyId: {
    type: String,
    required: false,
  },
  requesterId: {
    type: String,
    required: false,
  },
})

const email = ref('')
const password = ref('')
const errorMessage = ref('')

const signupPath = computed(() => {
  return getSignupPath(props.familyId as string, props.requesterId as string)
})

const handleLogin = async () => {
  try {
    errorMessage.value = ''

    const isLoginFormValid = validateLoginForm(email.value, password.value)

    if (!isLoginFormValid) {
      errorMessage.value = 'Veuillez remplir tous les champs correctement.'
      return
    }

    const res = await httpClient.post('/api/auth/login', {
      email: email.value,
      password: password.value,
    })

    const { user, token } = res.data

    authStore.setToken(token)
    userStore.setUser(user)

    if (!props.familyId && !props.requesterId) {
      router.push('/')
      return
    }

    await httpClient.post(`/api/family/${props.familyId}/users`, {
      requesterUserId: props.requesterId,
    })

    router.push('/dashboard')
  } catch (error) {
    console.error('Error logging in:', error)
    errorMessage.value = 'Une erreur est survenue lors de la connexion. Veuillez réessayer.'
  }
}
</script>

<template>
  <div class="bg-[#F0EEE9] h-screen flex items-center justify-center">
    <div class="bg-white px-10 py-10 rounded-2xl w-full max-w-md flex flex-col">
      <h1 class="text-2xl font-bold mb-8 text-center">Content de te revoir</h1>

      <form class="flex flex-col gap-6">
        <div class="flex flex-col gap-1">
          <label for="email" class="text-sm">Adresse email :</label>
          <input
            type="email"
            id="email"
            name="email"
            v-model="email"
            placeholder="Entrer votre adresse email..."
            class="border border-gray-300 rounded py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#009CAA]"
          />
        </div>

        <div class="flex flex-col gap-1">
          <label for="password" class="text-sm">Mot de passe :</label>
          <input
            type="password"
            id="password"
            name="password"
            v-model="password"
            placeholder="Entrer votre mot de passe..."
            class="border border-gray-300 rounded py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#009CAA]"
          />
        </div>

        <p class="text-red-500 text-sm">{{ errorMessage }}</p>

        <button
          type="button"
          class="bg-[#009CAA] text-white py-2 px-4 rounded hover:bg-[#007B8A] w-full mt-2"
          @click="handleLogin"
        >
          Se connecter
        </button>

        <p class="text-center text-sm text-gray-400">
          Vous n'avez pas de compte ?
          <router-link :to="signupPath" class="text-[#009CAA] hover:underline"
            >S'inscrire</router-link
          >
        </p>
      </form>
    </div>
  </div>
</template>
