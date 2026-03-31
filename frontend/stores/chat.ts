import { defineStore } from 'pinia'

export const useChatStore = defineStore('chat', {
  state: () => ({
    chats:    [] as any[],
    messages: [] as any[],
    activeChatId: null as string | null,
    typingUsers: {} as Record<string, ReturnType<typeof setTimeout>>,
  }),
  actions: {
    async loadChats() {
      const headers = useAuthHeaders()
      this.chats = await $fetch('/api/chats', { headers }) as any[] ?? []
    },
    async loadMessages(chatId: string) {
      this.activeChatId = chatId
      const headers = useAuthHeaders()
      this.messages = await $fetch(`/api/chats/${chatId}/messages`, { headers }) as any[] ?? []
    },
    async markAllRead(chatId: string) {
      const headers = useAuthHeaders()
      const auth = useAuthStore()
      try {
        const res: any = await $fetch(`/api/chats/${chatId}/read`, { method: 'PUT', headers })
        // Update only incoming unread messages (read by current user).
        if (res?.delete_at) {
          this.messages.forEach((m: any) => {
            if (!m.read_at && m.sender_id !== auth.user?.id) {
              m.read_at = new Date().toISOString()
              m.delete_at = res.delete_at
            }
          })
        }
      } catch {}
    },
    pushMessage(msg: any) {
      if (this.messages.some((m: any) => m.id === msg.id)) {
        return
      }
      this.messages.push(msg)
      // Update chat last message.
      const chat = this.chats.find(c => c.id === msg.chat_id)
      if (chat) {
        chat.last_message = msg.type === 'text' ? '[encrypted message]' : '[encrypted file]'
        chat.last_message_at = msg.created_at
        chat.unread_count = (chat.unread_count ?? 0) + 1
      }
    },
    applyReadReceipt(chatId: string, deleteAt: string) {
      const auth = useAuthStore()
      this.messages.forEach((m: any) => {
        // Apply receipt only to my outgoing unread messages.
        if (m.chat_id === chatId && !m.read_at && m.sender_id === auth.user?.id) {
          m.read_at = new Date().toISOString()
          m.delete_at = deleteAt
        }
      })
    },
    removeMessage(msgId: string) {
      this.messages = this.messages.filter((m: any) => m.id !== msgId)
    },
    setTyping(userId: string) {
      if (this.typingUsers[userId]) clearTimeout(this.typingUsers[userId])
      this.typingUsers[userId] = setTimeout(() => {
        delete this.typingUsers[userId]
      }, 3000) as any
    },
    isTyping(userId: string) {
      return !!this.typingUsers[userId]
    },
  },
})
