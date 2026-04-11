<template>
  <div class="relative">
    <button
      class="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition text-base"
      title="Уведомления"
      @click="toggleOpen"
    >
      🔔
      <span
        v-if="notificationStore.unreadCount"
        class="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[10px] grid place-items-center"
      >
        {{ notificationStore.unreadCount > 99 ? '99+' : notificationStore.unreadCount }}
      </span>
    </button>

    <div
      v-if="open"
      class="absolute right-0 mt-2 w-80 max-w-[85vw] rounded-xl border border-white/10 bg-tg-sidebar-darker shadow-xl z-50"
    >
      <div class="flex items-center justify-between px-3 py-2 border-b border-white/10">
        <p class="text-white text-sm font-medium">Уведомления</p>
        <button class="text-xs text-tg-gray hover:text-white transition" @click="notificationStore.markAllRead()">Отметить все прочитанными</button>
      </div>
      <div v-if="notificationStore.items.length === 0" class="px-3 py-4 text-xs text-tg-gray">Уведомлений пока нет</div>
      <div v-else class="max-h-72 overflow-y-auto">
        <button
          v-for="n in notificationStore.items"
          :key="n.id"
          class="w-full text-left px-3 py-2.5 border-b border-white/5 hover:bg-white/5 transition"
          @click="openNotification(n)"
        >
          <p :class="['text-sm truncate', n.read ? 'text-white/80' : 'text-white font-medium']">{{ n.title }}</p>
          <p class="text-xs text-tg-gray truncate mt-0.5">{{ n.body }}</p>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useNotificationStore } from '~/stores/notifications'

const router = useRouter()
const notificationStore = useNotificationStore()
const open = ref(false)

onMounted(() => {
  notificationStore.syncPermission()
})

function toggleOpen() {
  open.value = !open.value
  if (open.value) {
    notificationStore.markAllRead()
  }
}

function openNotification(n: any) {
  notificationStore.markRead(n.id)
  open.value = false
  if (n.chatId) {
    router.push(`/app/chat/${n.chatId}`)
  }
}
</script>
