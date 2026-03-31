<template>
  <div class="p-6 max-w-2xl mx-auto w-full">
    <h1 class="text-xl font-semibold text-gray-100 mb-6">👤 Admin Panel</h1>

    <!-- Create user -->
    <section class="bg-tg-sidebar rounded-2xl p-5 mb-6">
      <h2 class="text-sm font-semibold text-white mb-4">Create New Member</h2>
      <form @submit.prevent="createUser" class="space-y-3">
        <input v-model="form.display_name" placeholder="Display name" required
          class="w-full bg-tg-sidebar-darker text-white rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-tg-blue placeholder-gray-500" />
        <input v-model="form.username" placeholder="Username (login)" required
          class="w-full bg-tg-sidebar-darker text-white rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-tg-blue placeholder-gray-500" />
        <input v-model="form.password" type="password" placeholder="Password (min 8 chars)" required minlength="8"
          class="w-full bg-tg-sidebar-darker text-white rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-tg-blue placeholder-gray-500" />
        <select v-model="form.role"
          class="w-full bg-tg-sidebar-darker text-white rounded-xl px-3 py-2.5 text-sm outline-none">
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <p v-if="createError" class="text-red-400 text-xs">{{ createError }}</p>
        <button type="submit" :disabled="creating"
          class="w-full bg-tg-blue hover:bg-tg-blue-dark text-white rounded-xl py-2.5 text-sm font-medium transition disabled:opacity-60">
          {{ creating ? 'Creating…' : 'Create Member' }}
        </button>
      </form>
    </section>

    <!-- User list -->
    <section class="bg-tg-sidebar rounded-2xl p-5">
      <h2 class="text-sm font-semibold text-white mb-4">All Members</h2>
      <div v-if="loadingUsers" class="text-tg-gray text-sm text-center py-4">Loading…</div>
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
          >Remove</button>
        </li>
      </ul>
    </section>

    <!-- Sticker packs -->
    <section class="bg-tg-sidebar rounded-2xl p-5 mt-6">
      <h2 class="text-sm font-semibold text-white mb-4">Sticker Packs</h2>
      <form @submit.prevent="createPack" class="flex gap-2 mb-4">
        <input v-model="packName" placeholder="Pack name" required
          class="flex-1 bg-tg-sidebar-darker text-white rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-tg-blue placeholder-gray-500" />
        <button type="submit"
          class="bg-tg-blue text-white rounded-xl px-4 text-sm hover:bg-tg-blue-dark transition">
          Add
        </button>
      </form>
      <p class="text-tg-gray text-xs">
        After creating a pack, upload sticker images via the file upload endpoint and manage them using the API.
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default', middleware: ['auth', 'admin'] })

const auth = useAuthStore()
const headers = useAuthHeaders()

const users = ref<any[]>([])
const loadingUsers = ref(true)
const form = reactive({ display_name: '', username: '', password: '', role: 'user' })
const creating = ref(false)
const createError = ref('')
const packName = ref('')

async function loadUsers() {
  loadingUsers.value = true
  users.value = await $fetch('/api/admin/users', { headers }) as any[]
  loadingUsers.value = false
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
    createError.value = e.data?.error ?? 'Error creating user'
  } finally {
    creating.value = false
  }
}

async function deleteUser(id: string) {
  if (!confirm('Remove this member?')) return
  await $fetch(`/api/admin/users/${id}`, { method: 'DELETE', headers })
  users.value = users.value.filter((u: any) => u.id !== id)
}

async function createPack() {
  const form = new FormData()
  form.append('name', packName.value)
  await $fetch('/api/admin/sticker-packs', { method: 'POST', headers, body: form })
  packName.value = ''
}

onMounted(loadUsers)
</script>
