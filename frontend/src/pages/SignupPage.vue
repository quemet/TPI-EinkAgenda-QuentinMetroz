<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { useUserStore } from '@/stores/user.store'
import { useRouter } from 'vue-router'
import httpClient from '@/services/httpclient'

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

const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')

const errorMessage = ref('')

const loginPath = computed(() => {
  if (props.familyId && props.requesterId) {
    return `/login/${props.familyId}/${props.requesterId}`
  }
  return '/login'
})

const handleSignup = async () => {
  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Les mots de passe ne correspondent pas.'
    return
  }

  if (!username.value || !email.value || !password.value) {
    errorMessage.value = 'Veuillez remplir tous les champs.'
    return
  }

  const res = await httpClient.post('/api/auth/register', {
    username: username.value,
    email: email.value,
    password: password.value,
  })
  const data = res.data
  const { user, token } = data

  authStore.setToken(token)
  userStore.setUser(user)

  if (!props.familyId || !props.requesterId) {
    router.push('/')
    return
  }

  await httpClient.post(`/api/family/${props.familyId}/users`, {
    requesterUserId: props.requesterId,
  })

  router.push('/dashboard')
}
</script>

<template>
  <div class="bg-[#F0EEE9] h-screen flex items-center justify-center">
    <div class="bg-white px-10 py-10 rounded-2xl w-full max-w-md flex flex-col">
      <h1 class="text-2xl font-bold mb-8 text-center">Bienvenue</h1>

      <form class="flex flex-col gap-6">
        <div class="flex flex-col gap-1">
          <label for="username" class="text-sm">Nom d'utilisateur :</label>
          <input
            type="text"
            id="username"
            name="username"
            v-model="username"
            placeholder="Entrer votre nom d'utilisateur..."
            class="border border-gray-300 rounded py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#009CAA]"
          />
        </div>

        <div class="flex flex-col gap-1">
          <label for="email" class="text-sm">Email :</label>
          <input
            type="email"
            id="email"
            name="email"
            v-model="email"
            placeholder="Entrer votre email..."
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

        <div class="flex flex-col gap-1">
          <label for="confirmPassword" class="text-sm">Confirmer le mot de passe :</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            v-model="confirmPassword"
            placeholder="Confirmer votre mot de passe..."
            class="border border-gray-300 rounded py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#009CAA]"
          />
        </div>

        <p class="text-red-500 text-sm">{{ errorMessage }}</p>

        <button
          type="button"
          class="bg-[#009CAA] text-white py-2 px-4 rounded hover:bg-[#007B8A] w-full mt-2"
          @click="handleSignup"
        >
          S'inscrire
        </button>

        <p class="text-center text-sm text-gray-400">
          Vous avez déjà un compte ?
          <router-link :to="loginPath" class="text-[#009CAA] hover:underline"
            >Se connecter</router-link
          >
        </p>
      </form>
    </div>
  </div>
</template>
