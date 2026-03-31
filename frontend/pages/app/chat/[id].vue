<template>
  <div class="flex flex-col h-full">
    <!-- Chat header -->
    <div v-if="otherUser" class="flex items-center gap-3 px-4 py-3 bg-tg-sidebar-darker shadow-sm flex-shrink-0">
      <button @click="router.push('/app')" class="md:hidden text-white mr-1">←</button>
      <UserAvatar :user="otherUser" size="sm" />
      <div class="flex-1 min-w-0">
        <p class="text-white font-medium text-sm truncate">{{ otherUser.display_name }}</p>
        <p class="text-tg-gray text-xs">
          {{ chatStore.isTyping(otherUser.id) ? 'typing…' : (otherUser.is_online ? 'online' : formatLastSeen(otherUser.last_seen)) }}
        </p>
      </div>
      <div class="flex items-center gap-2">
        <button @click="startCall('audio')" class="text-white/70 hover:text-white transition p-1.5" title="Voice call">
          📞
        </button>
        <button @click="startCall('video')" class="text-white/70 hover:text-white transition p-1.5" title="Video call">
          📹
        </button>
      </div>
    </div>

    <!-- Messages -->
    <div ref="msgContainer" class="flex-1 overflow-y-auto px-4 py-4 space-y-1" @scroll="handleScroll">
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

const msgContainer = ref<HTMLElement>()
const bottomAnchor = ref<HTMLElement>()
const otherUser = ref<any>(null)

onMounted(async () => {
  await e2ee.ensurePublished()

  // Find the other chat participant.
  const chats = await $fetch('/api/chats', { headers: useAuthHeaders() })
  const chat = (chats as any[]).find((c: any) => c.id === chatId)
  if (chat) otherUser.value = chat.other_user

  await chatStore.loadMessages(chatId)
  await chatStore.markAllRead(chatId)
  scrollToBottom()
})

watch(() => chatStore.messages.length, () => scrollToBottom())

function scrollToBottom() {
  nextTick(() => bottomAnchor.value?.scrollIntoView({ behavior: 'smooth' }))
}

function handleScroll() {}

function startCall(type: 'audio' | 'video') {
  if (!otherUser.value) return
  callStore.initCall(otherUser.value.id, otherUser.value.display_name, type)
}

function formatLastSeen(ts: string) {
  if (!ts) return 'offline'
  return 'last seen ' + formatDistanceToNow(new Date(ts), { addSuffix: true })
}
</script>
