<template>
  <div class="flex flex-col h-full w-full overflow-hidden">
    <!-- Chat header -->
    <div v-if="otherUser" class="flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 sm:py-3 bg-tg-sidebar-darker shadow-sm flex-shrink-0 min-h-[56px] sm:min-h-[64px]">
      <button @click="router.push('/app')" class="md:hidden text-white mr-1 p-1 hover:bg-white/10 rounded transition text-lg flex-shrink-0">
        ←
      </button>
      <UserAvatar :user="otherUser" size="sm" />
      <div class="flex-1 min-w-0">
        <p class="text-white font-medium text-sm sm:text-base truncate">{{ otherUser.display_name }}</p>
        <p class="text-tg-gray text-xs sm:text-sm leading-tight">
          {{ chatStore.isTyping(otherUser.id) ? 'typing…' : (otherUser.is_online ? 'online' : formatLastSeen(otherUser.last_seen)) }}
        </p>
      </div>
      <div class="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        <button @click="startCall('audio')" class="text-white/70 hover:text-white transition p-1.5 sm:p-2 hover:bg-white/10 rounded text-lg flex-shrink-0" title="Voice call">
          📞
        </button>
        <button @click="startCall('video')" class="text-white/70 hover:text-white transition p-1.5 sm:p-2 hover:bg-white/10 rounded text-lg flex-shrink-0" title="Video call">
          📹
        </button>
      </div>
    </div>

    <!-- Messages container -->
    <div ref="msgContainer" class="flex-1 overflow-y-auto px-2 sm:px-4 py-3 sm:py-4 space-y-0 w-full min-h-0" @scroll="handleScroll">
      <div v-if="loading" class="text-center text-sm text-gray-400 py-4">Loading messages…</div>
      <div v-else-if="chatStore.messages.length === 0" class="text-center text-sm text-gray-400 py-8">
        No messages yet. Start the conversation!
      </div>
      <MessageBubble
        v-for="msg in chatStore.messages"
        :key="msg.id"
        :message="msg"
        :is-mine="msg.sender_id === auth.user?.id"
        :peer-public-key="otherUser?.e2ee_public_key ?? ''"
      />
      <div ref="bottomAnchor" />
    </div>

    <!-- Message input -->
    <MessageInput
      :chat-id="chatId"
      :receiver-id="otherUser?.id ?? ''"
      :receiver-public-key="otherUser?.e2ee_public_key ?? ''"
      @sent="scrollToBottom"
    />
  </div>
</template>

<script setup lang="ts">
import { formatDistanceToNow } from 'date-fns'
definePageMeta({ layout: 'default', middleware: 'auth' })

const route = useRoute()
const router = useRouter()
const chatId = route.params.id as string

const auth = useAuthStore()
const chatStore = useChatStore()
const callStore = useCallStore()
const e2ee = useE2EE()
const { connect, disconnect } = useWebSocket()

const msgContainer = ref<HTMLElement>()
const bottomAnchor = ref<HTMLElement>()
const otherUser = ref<any>(null)
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    await e2ee.ensurePublished()
    
    // Ensure WebSocket is connected
    connect()

    // Find the other chat participant.
    const chats = await $fetch('/api/chats', { headers: useAuthHeaders() })
    const chat = (chats as any[]).find((c: any) => c.id === chatId)
    if (chat) otherUser.value = chat.other_user

    await chatStore.loadMessages(chatId)
    await chatStore.markAllRead(chatId)
    scrollToBottom()
  } finally {
    loading.value = false
  }
})

watch(() => chatStore.messages.length, () => scrollToBottom())

function scrollToBottom() {
  nextTick(() => bottomAnchor.value?.scrollIntoView({ behavior: 'smooth' }))
}

function handleScroll() {
  // Potential future: infinite scroll load older messages
}

function startCall(type: 'audio' | 'video') {
  if (!otherUser.value) return
  callStore.initCall(otherUser.value.id, otherUser.value.display_name, type)
}

function formatLastSeen(ts: string) {
  if (!ts) return 'offline'
  return 'last seen ' + formatDistanceToNow(new Date(ts), { addSuffix: true })
}
</script>
