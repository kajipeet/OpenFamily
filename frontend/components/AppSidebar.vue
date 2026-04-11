<template>
  <aside class="w-full flex-shrink-0 bg-tg-sidebar flex flex-col h-full border-r border-tg-sidebar-darker">
    <div class="flex items-center justify-between px-4 py-3 bg-tg-sidebar-darker flex-shrink-0">
      <div class="flex items-center gap-3 min-w-0">
        <UserAvatar :user="auth.user" size="sm" />
        <div class="min-w-0">
          <p class="text-white text-sm font-medium leading-tight truncate">{{ auth.user?.display_name }}</p>
          <p class="text-tg-gray text-xs truncate">{{ auth.user?.tag }}</p>
        </div>
      </div>
      <div class="flex items-center gap-1 flex-shrink-0">
        <NotificationCenter />
        <NuxtLink
          v-if="auth.isAdmin"
          to="/app/admin"
          class="text-white/60 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition text-lg"
          title="Панель администратора"
        >⚙️</NuxtLink>
        <button
          @click="logout"
          class="text-white/60 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition text-sm"
          title="Выйти"
        >
          Выход
        </button>
      </div>
    </div>

    <div class="px-3 py-2 flex-shrink-0">
      <div class="flex items-center gap-2 bg-tg-sidebar-darker rounded-xl px-3 py-2">
        <span class="text-gray-400 text-sm">🔍</span>
        <input
          v-model="searchTag"
          @input="onSearchInput"
          type="text"
          placeholder="Поиск по @тегу"
          class="flex-1 bg-transparent text-white text-sm outline-none placeholder-gray-500"
        />
      </div>
    </div>

    <div v-if="searchResults.length > 0" class="px-3 pb-2 flex-shrink-0">
      <div class="bg-tg-sidebar-darker rounded-xl overflow-hidden">
        <div
          v-for="u in searchResults"
          :key="u.id"
          @click="openChatWith(u)"
          class="flex items-center gap-3 px-3 py-2.5 hover:bg-white/10 cursor-pointer transition"
        >
          <UserAvatar :user="u" size="sm" />
          <div class="min-w-0">
            <p class="text-white text-sm truncate">{{ u.display_name }}</p>
            <p class="text-tg-gray text-xs truncate">{{ u.tag }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto">
      <div v-if="chatStore.chats.length === 0" class="text-center text-tg-gray text-xs mt-8 px-4">
        Чатов пока нет.<br />Найдите участника по @тегу для начала.
      </div>
      <ChatListItem
        v-for="chat in chatStore.chats"
        :key="chat.id"
        :chat="chat"
        @click="openChat(chat)"
      />
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useNotificationStore } from '~/stores/notifications'

const auth = useAuthStore()
const chatStore = useChatStore()
const router = useRouter()
const headers = useAuthHeaders()
const { logout } = useAuth()
const searchTag = ref('')
const searchResults = ref<any[]>([])
const notificationStore = useNotificationStore()

onMounted(async () => {
  await chatStore.loadChats()
  notificationStore.syncPermission()
  // Request permission once in authenticated area for background notifications.
  notificationStore.ensurePermission()
})

let debounce: ReturnType<typeof setTimeout>

function onSearchInput() {
  clearTimeout(debounce)
  if (!searchTag.value.trim()) {
    searchResults.value = []
    return
  }
  debounce = setTimeout(async () => {
    searchResults.value = await $fetch(`/api/users/search?tag=${encodeURIComponent(searchTag.value)}`, {
      headers,
    }) as any[] ?? []
  }, 300)
}

async function openChatWith(user: any) {
  const chat: any = await $fetch('/api/chats', {
    method: 'POST',
    headers,
    body: { user_id: user.id },
  })
  searchTag.value = ''
  searchResults.value = []
  await chatStore.loadChats()
  router.push(`/app/chat/${chat.id}`)
}

function openChat(chat: any) {
  router.push(`/app/chat/${chat.id}`)
}
</script>
