<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-green-50 to-amber-50 p-4">
    <div class="w-full max-w-sm">
      <div class="text-center mb-8">
        <span class="text-5xl">🌸</span>
        <h1 class="text-xl font-serif font-semibold text-stone-900 mt-3">FloraBase</h1>
        <p class="text-sm text-stone-400 mt-1">Member access</p>
      </div>

      <form @submit.prevent="login" class="bg-white rounded-2xl shadow-md p-6 space-y-4">
        <div>
          <label class="block text-xs font-medium text-stone-500 mb-1">Username</label>
          <input
            v-model="username"
            type="text"
            autocomplete="username"
            required
            class="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-200"
            placeholder="Username"
          />
        </div>
        <div>
          <label class="block text-xs font-medium text-stone-500 mb-1">Password</label>
          <input
            v-model="password"
            type="password"
            autocomplete="current-password"
            required
            class="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-200"
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

      <p class="text-center text-xs text-stone-400 mt-6">
        <NuxtLink to="/" class="hover:underline">← FloraBase</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

useSeoMeta({
  title: 'Member Access — FloraBase',
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
