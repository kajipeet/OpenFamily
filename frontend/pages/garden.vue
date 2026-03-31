<template>
  <!-- Login page for the family messenger -->
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
    <div class="w-full max-w-sm">
      <div class="text-center mb-8">
        <span class="text-5xl">🌿</span>
        <h1 class="text-xl font-semibold text-green-900 mt-3">OpenFamily</h1>
        <p class="text-sm text-gray-500 mt-1">Private family messenger sign in</p>
      </div>

      <form @submit.prevent="login" class="bg-white rounded-2xl shadow-md p-6 space-y-4">
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Username</label>
          <input
            v-model="username"
            type="text"
            autocomplete="username"
            required
            class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-300"
            placeholder="Username"
          />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Password</label>
          <input
            v-model="password"
            type="password"
            autocomplete="current-password"
            required
            class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-300"
            placeholder="••••••••"
          />
        </div>

        <p v-if="error" class="text-red-500 text-xs text-center">{{ error }}</p>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-green-700 hover:bg-green-800 text-white font-medium rounded-xl py-2.5 text-sm transition disabled:opacity-60"
        >
          {{ loading ? 'Signing in…' : 'Sign In' }}
        </button>
      </form>

      <p class="text-center text-xs text-gray-400 mt-6">
        <NuxtLink to="/" class="hover:underline">← Back to Home</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

useSeoMeta({
  title: 'Sign In - OpenFamily',
  robots: 'noindex, nofollow',
})

const { loginUser } = useAuth()
const router = useRouter()

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function login() {
  error.value = ''
  loading.value = true
  try {
    await loginUser(username.value, password.value)
    await router.push('/app')
  } catch (e: any) {
    error.value = e.message || 'Invalid credentials'
  } finally {
    loading.value = false
  }
}
</script>
