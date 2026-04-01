<template>
  <div class="p-2 sm:p-4 max-w-4xl mx-auto w-full">
    <h1 class="text-xl font-semibold text-gray-100 mb-6">👤 Admin Panel</h1>
    <p v-if="panelError" class="mb-4 text-xs text-red-300 bg-red-900/30 border border-red-500/40 rounded-lg px-3 py-2">
      {{ panelError }}
    </p>

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

      <div v-if="loadingPacks" class="text-tg-gray text-xs py-2">Loading packs…</div>
      <div v-else-if="packs.length === 0" class="text-tg-gray text-xs py-2">No sticker packs yet.</div>

      <div v-else class="space-y-4">
        <div class="flex flex-wrap gap-2">
          <button
            v-for="p in packs"
            :key="p.id"
            type="button"
            @click="selectedPackId = p.id"
            class="px-3 py-1.5 rounded-lg text-xs border transition"
            :class="selectedPackId === p.id ? 'bg-tg-blue text-white border-transparent' : 'bg-tg-sidebar-darker text-tg-gray border-white/10 hover:text-white'"
          >
            {{ p.name }}
          </button>
        </div>

        <div class="bg-tg-sidebar-darker rounded-xl p-3 space-y-3">
          <p class="text-white text-xs font-medium">Create Sticker</p>
          <input
            v-model="newSticker.name"
            placeholder="Sticker name"
            class="w-full bg-tg-sidebar text-white rounded-lg px-3 py-2 text-xs outline-none"
          />
          <input
            v-model="newSticker.fileUrl"
            placeholder="Or paste file URL"
            class="w-full bg-tg-sidebar text-white rounded-lg px-3 py-2 text-xs outline-none"
          />
          <input
            type="file"
            accept="image/*"
            class="w-full text-xs text-tg-gray"
            @change="onNewStickerFileChange"
          />
          <button
            type="button"
            :disabled="creatingSticker || !selectedPackId"
            @click="createSticker"
            class="w-full bg-tg-blue text-white rounded-lg py-2 text-xs disabled:opacity-60"
          >
            {{ creatingSticker ? 'Creating…' : 'Create Sticker' }}
          </button>
          <p v-if="stickerError" class="text-red-400 text-xs">{{ stickerError }}</p>
        </div>

        <div class="space-y-2">
          <div class="text-white text-xs font-medium">Stickers in selected pack</div>
          <div v-if="loadingStickers" class="text-tg-gray text-xs">Loading stickers…</div>
          <div v-else-if="stickers.length === 0" class="text-tg-gray text-xs">No stickers in this pack.</div>

          <div v-for="s in stickers" :key="s.id" class="bg-tg-sidebar-darker rounded-xl p-3">
            <template v-if="editingStickerId !== s.id">
              <div class="flex items-center justify-between gap-3">
                <div class="min-w-0">
                  <p class="text-white text-sm truncate">{{ s.name }}</p>
                  <p class="text-tg-gray text-xs truncate">{{ s.file_url }}</p>
                </div>
                <div class="flex items-center gap-3 flex-shrink-0">
                  <button
                    type="button"
                    class="text-xs text-tg-blue hover:text-white"
                    @click="startEditSticker(s)"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    class="text-xs text-red-400 hover:text-red-300"
                    :disabled="deletingStickerId === s.id"
                    @click="deleteSticker(s.id)"
                  >
                    {{ deletingStickerId === s.id ? 'Deleting…' : 'Delete' }}
                  </button>
                </div>
              </div>
            </template>

            <template v-else>
              <div class="space-y-2">
                <input
                  v-model="editSticker.name"
                  placeholder="Sticker name"
                  class="w-full bg-tg-sidebar text-white rounded-lg px-3 py-2 text-xs outline-none"
                />
                <input
                  v-model="editSticker.fileUrl"
                  placeholder="File URL"
                  class="w-full bg-tg-sidebar text-white rounded-lg px-3 py-2 text-xs outline-none"
                />
                <input
                  type="file"
                  accept="image/*"
                  class="w-full text-xs text-tg-gray"
                  @change="onEditStickerFileChange"
                />
                <div class="flex gap-2">
                  <button
                    type="button"
                    class="flex-1 bg-tg-blue text-white rounded-lg py-2 text-xs"
                    :disabled="savingEdit"
                    @click="saveStickerEdit"
                  >
                    {{ savingEdit ? 'Saving…' : 'Save' }}
                  </button>
                  <button
                    type="button"
                    class="flex-1 bg-white/10 text-white rounded-lg py-2 text-xs"
                    @click="cancelEditSticker"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
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
const packName = ref('')
const packs = ref<any[]>([])
const selectedPackId = ref('')
const stickers = ref<any[]>([])
const loadingPacks = ref(false)
const loadingStickers = ref(false)
const creatingSticker = ref(false)
const stickerError = ref('')
const panelError = ref('')
const newSticker = reactive({ name: '', fileUrl: '', file: null as File | null })
const editingStickerId = ref('')
const savingEdit = ref(false)
const deletingStickerId = ref('')
const editSticker = reactive({ name: '', fileUrl: '', file: null as File | null })

async function loadUsers() {
  loadingUsers.value = true
  try {
    users.value = await $fetch('/api/admin/users', { headers }) as any[]
  } catch (e: any) {
    panelError.value = e?.data?.error ?? e?.message ?? 'Failed to load admin users'
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
  await loadPacks()
}

async function loadPacks() {
  loadingPacks.value = true
  panelError.value = ''
  try {
    packs.value = await $fetch('/api/sticker-packs', { headers }) as any[]
    if (packs.value.length > 0) {
      if (!selectedPackId.value || !packs.value.some((p: any) => p.id === selectedPackId.value)) {
        selectedPackId.value = packs.value[0].id
      }
      await loadStickers(selectedPackId.value)
    } else {
      selectedPackId.value = ''
      stickers.value = []
    }
  } catch (e: any) {
    panelError.value = e?.data?.error ?? e?.message ?? 'Failed to load sticker packs'
    packs.value = []
    stickers.value = []
  } finally {
    loadingPacks.value = false
  }
}

async function loadStickers(packId: string) {
  if (!packId) {
    stickers.value = []
    return
  }
  loadingStickers.value = true
  try {
    stickers.value = await $fetch(`/api/sticker-packs/${packId}/stickers`, { headers }) as any[]
  } catch (e: any) {
    stickerError.value = e?.data?.error ?? e?.message ?? 'Failed to load stickers'
    stickers.value = []
  } finally {
    loadingStickers.value = false
  }
}

function onNewStickerFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  newSticker.file = input.files?.[0] ?? null
}

function onEditStickerFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  editSticker.file = input.files?.[0] ?? null
}

async function uploadStickerFile(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  const res: any = await $fetch('/api/upload', {
    method: 'POST',
    headers,
    body: formData,
  })
  return res?.url || ''
}

async function createSticker() {
  if (!selectedPackId.value) return
  stickerError.value = ''
  creatingSticker.value = true
  try {
    let fileUrl = newSticker.fileUrl.trim()
    if (!fileUrl && newSticker.file) {
      fileUrl = await uploadStickerFile(newSticker.file)
    }
    if (!newSticker.name.trim() || !fileUrl) {
      throw new Error('Sticker name and file are required')
    }

    await $fetch(`/api/admin/sticker-packs/${selectedPackId.value}/stickers`, {
      method: 'POST',
      headers,
      body: { name: newSticker.name.trim(), file_url: fileUrl },
    })

    Object.assign(newSticker, { name: '', fileUrl: '', file: null })
    await loadStickers(selectedPackId.value)
  } catch (e: any) {
    stickerError.value = e?.data?.error ?? e?.message ?? 'Failed to create sticker'
  } finally {
    creatingSticker.value = false
  }
}

function startEditSticker(sticker: any) {
  editingStickerId.value = sticker.id
  editSticker.name = sticker.name || ''
  editSticker.fileUrl = sticker.file_url || ''
  editSticker.file = null
}

function cancelEditSticker() {
  editingStickerId.value = ''
  editSticker.name = ''
  editSticker.fileUrl = ''
  editSticker.file = null
}

async function saveStickerEdit() {
  if (!editingStickerId.value) return
  savingEdit.value = true
  try {
    let fileUrl = editSticker.fileUrl.trim()
    if (editSticker.file) {
      fileUrl = await uploadStickerFile(editSticker.file)
    }
    await $fetch(`/api/admin/stickers/${editingStickerId.value}`, {
      method: 'PUT',
      headers,
      body: {
        name: editSticker.name.trim(),
        file_url: fileUrl,
      },
    })
    await loadStickers(selectedPackId.value)
    cancelEditSticker()
  } finally {
    savingEdit.value = false
  }
}

async function deleteSticker(id: string) {
  if (!confirm('Delete this sticker?')) return
  deletingStickerId.value = id
  try {
    await $fetch(`/api/admin/stickers/${id}`, {
      method: 'DELETE',
      headers,
    })
    await loadStickers(selectedPackId.value)
    if (editingStickerId.value === id) cancelEditSticker()
  } finally {
    deletingStickerId.value = ''
  }
}

watch(selectedPackId, (id) => {
  if (id) {
    loadStickers(id).catch(() => {})
  }
})

onMounted(async () => {
  try {
    await loadUsers()
    await loadPacks()
  } catch {
    // Keep admin page visible even when some API requests fail.
  }
})
</script>
