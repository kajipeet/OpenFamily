<template>
  <div class="p-2 sm:p-4 max-w-4xl mx-auto w-full">
    <h1 class="text-xl font-semibold text-gray-100 mb-6">👤 Панель администратора</h1>
    <p v-if="panelError" class="mb-4 text-xs text-red-300 bg-red-900/30 border border-red-500/40 rounded-lg px-3 py-2">
      {{ panelError }}
    </p>

    <!-- Create user -->
    <section class="bg-tg-sidebar rounded-2xl p-5 mb-6">
      <h2 class="text-sm font-semibold text-white mb-4">Создать нового участника</h2>
      <form @submit.prevent="createUser" class="space-y-3">
        <input v-model="form.display_name" placeholder="Отображаемое имя" required
          class="w-full bg-tg-sidebar-darker text-white rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-tg-blue placeholder-gray-500" />
        <input v-model="form.username" placeholder="Логин (имя пользователя)" required
          class="w-full bg-tg-sidebar-darker text-white rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-tg-blue placeholder-gray-500" />
        <input v-model="form.password" type="password" placeholder="Пароль (мин. 8 символов)" required minlength="8"
          class="w-full bg-tg-sidebar-darker text-white rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-tg-blue placeholder-gray-500" />
        <select v-model="form.role"
          class="w-full bg-tg-sidebar-darker text-white rounded-xl px-3 py-2.5 text-sm outline-none">
          <option value="user">Пользователь</option>
          <option value="admin">Администратор</option>
        </select>
        <p v-if="createError" class="text-red-400 text-xs">{{ createError }}</p>
        <button type="submit" :disabled="creating"
          class="w-full bg-tg-blue hover:bg-tg-blue-dark text-white rounded-xl py-2.5 text-sm font-medium transition disabled:opacity-60">
          {{ creating ? 'Создание…' : 'Создать участника' }}
        </button>
      </form>
    </section>

    <!-- User list -->
    <section class="bg-tg-sidebar rounded-2xl p-5">
      <h2 class="text-sm font-semibold text-white mb-4">Все участники</h2>
      <div v-if="loadingUsers" class="text-tg-gray text-sm text-center py-4">Загрузка…</div>
      <ul v-else class="space-y-2">
        <li v-for="u in users" :key="u.id"
          class="flex items-center justify-between bg-tg-sidebar-darker rounded-xl px-4 py-3">
          <div class="flex items-center gap-3 min-w-0">
            <UserAvatar :user="u" size="sm" />
            <div class="min-w-0">
              <p class="text-white text-sm font-medium truncate">{{ u.display_name }}</p>
              <p class="text-tg-gray text-xs truncate">{{ u.tag }} · {{ u.role }}</p>
            </div>
          </div>
          <button
            v-if="u.id !== auth.user?.id"
            @click="deleteUser(u.id)"
            class="ml-4 text-red-400 hover:text-red-300 text-xs flex-shrink-0"
          >Удалить</button>
        </li>
      </ul>
    </section>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' as any, middleware: ['auth', 'admin'] })

const auth = useAuthStore()
const headers = useAuthHeaders()

const users = ref<any[]>([])
const loadingUsers = ref(true)
const form = reactive({ display_name: '', username: '', password: '', role: 'user' })
const creating = ref(false)
const createError = ref('')
const panelError = ref('')

async function loadUsers() {
  loadingUsers.value = true
  try {
    users.value = await $fetch('/api/admin/users', { headers }) as any[]
  } catch (e: any) {
    panelError.value = e?.data?.error ?? e?.message ?? 'Не удалось загрузить список пользователей'
    users.value = []
  } finally {
    loadingUsers.value = false
  }
}

async function createUser() {
  createError.value = ''
  creating.value = true
  try {
    const u = await $fetch('/api/admin/users', {
      method: 'POST', headers,
      body: { ...form },
    })
    users.value.unshift(u)
    Object.assign(form, { display_name: '', username: '', password: '', role: 'user' })
  } catch (e: any) {
    createError.value = e.data?.error ?? 'Ошибка создания пользователя'
  } finally {
    creating.value = false
  }
}

async function deleteUser(id: string) {
  if (!confirm('Удалить этого участника?')) return
  await $fetch(`/api/admin/users/${id}`, { method: 'DELETE', headers })
  users.value = users.value.filter((u: any) => u.id !== id)
}

onMounted(async () => {
  try {
    await loadUsers()
  } catch {
    // Keep admin page visible even when some API requests fail.
  }
})
</script>
