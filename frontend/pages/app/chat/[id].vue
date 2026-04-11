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
          {{ chatStore.isTyping(otherUser.id) ? 'печатает…' : (otherUser.is_online ? 'в сети' : formatLastSeen(otherUser.last_seen)) }}
        </p>
      </div>
      <div class="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        <button @click="startCall('audio')" class="text-white/70 hover:text-white transition p-1.5 sm:p-2 hover:bg-white/10 rounded text-lg flex-shrink-0" title="Голосовой звонок">
          📞
        </button>
        <button @click="startCall('video')" class="text-white/70 hover:text-white transition p-1.5 sm:p-2 hover:bg-white/10 rounded text-lg flex-shrink-0" title="Видеозвонок">
          📹
        </button>
      </div>
    </div>

    <!-- Messages container -->
    <div ref="msgContainer" class="flex-1 overflow-y-auto px-2 sm:px-4 py-3 sm:py-4 space-y-0 w-full min-h-0" @scroll="handleScroll">
      <div v-if="loading" class="text-center text-sm text-gray-400 py-4">Загрузка сообщений…</div>
      <div v-else-if="chatStore.messages.length === 0" class="text-center text-sm text-gray-400 py-8">
        Сообщений пока нет. Начните разговор!
      </div>
      <div
        v-for="msg in chatStore.messages"
        :key="msg.id"
        :data-unread-incoming="!msg.read_at && msg.sender_id !== auth.user?.id ? '1' : '0'"
      >
        <MessageBubble
          :message="msg"
          :is-mine="msg.sender_id === auth.user?.id"
          :peer-public-key="otherUser?.e2ee_public_key ?? ''"
          :reply-to-message="messageById[msg.reply_to_id] || null"
          @reply="setReply"
        />
      </div>
      <div ref="bottomAnchor" />
    </div>

    <!-- Message input -->
    <MessageInput
      :chat-id="chatId"
      :receiver-id="otherUser?.id ?? ''"
      :receiver-public-key="otherUser?.e2ee_public_key ?? ''"
      :reply-to="replyTarget"
      @clear-reply="clearReply"
      @sent="scrollToBottom"
    />
  </div>
</template>

<script setup lang="ts">
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'
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
const replyTarget = ref<any>(null)
let readObserver: IntersectionObserver | null = null
let markInFlight = false

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
    setupReadObserver()
    scrollToBottom()
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  if (readObserver) {
    readObserver.disconnect()
    readObserver = null
  }
  document.removeEventListener('visibilitychange', onVisibilityChange)
})

watch(() => chatStore.messages.length, async () => {
  scrollToBottom()
  await nextTick()
  setupReadObserver()
})

const messageById = computed(() => {
  const map: Record<string, any> = {}
  chatStore.messages.forEach((m: any) => {
    if (m?.id) map[m.id] = m
  })
  return map
})

function setReply(msg: any) {
  replyTarget.value = msg
}

function clearReply() {
  replyTarget.value = null
}

function scrollToBottom() {
  nextTick(() => bottomAnchor.value?.scrollIntoView({ behavior: 'smooth' }))
}

function handleScroll() {
  maybeMarkRead()
}

function hasUnreadIncoming() {
  return chatStore.messages.some((m: any) => !m.read_at && m.sender_id !== auth.user?.id)
}

function setupReadObserver() {
  if (!import.meta.client || !msgContainer.value) return
  if (!hasUnreadIncoming()) return

  if (readObserver) {
    readObserver.disconnect()
  }

  readObserver = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      maybeMarkRead()
    }
  }, {
    root: msgContainer.value,
    threshold: 0.7,
  })

  const nodes = msgContainer.value.querySelectorAll<HTMLElement>('[data-unread-incoming="1"]')
  nodes.forEach((node) => readObserver?.observe(node))

  document.removeEventListener('visibilitychange', onVisibilityChange)
  document.addEventListener('visibilitychange', onVisibilityChange)

  maybeMarkRead()
}

function onVisibilityChange() {
  if (document.visibilityState === 'visible') {
    maybeMarkRead()
  }
}

async function maybeMarkRead() {
  if (markInFlight) return
  if (!hasUnreadIncoming()) return
  if (!msgContainer.value) return
  if (document.visibilityState !== 'visible') return

  const visibleUnread = msgContainer.value.querySelectorAll('[data-unread-incoming="1"]')
  if (!visibleUnread.length) return

  markInFlight = true
  try {
    await chatStore.markAllRead(chatId)
  } finally {
    markInFlight = false
    setupReadObserver()
  }
}

function startCall(type: 'audio' | 'video') {
  if (!otherUser.value) return
  callStore.initCall(otherUser.value.id, otherUser.value.display_name, type)
}

function formatLastSeen(ts: string) {
  if (!ts) return 'не в сети'
  return 'был(а) ' + formatDistanceToNow(new Date(ts), { addSuffix: true, locale: ru })
}
</script>
