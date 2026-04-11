import { defineStore } from 'pinia'

type AppNotification = {
  id: string
  title: string
  body: string
  chatId?: string
  createdAt: string
  read: boolean
}

export const useNotificationStore = defineStore('notifications', {
  state: () => ({
    items: [] as AppNotification[],
    browserPermission: 'default' as NotificationPermission | 'default',
  }),
  getters: {
    unreadCount: (state) => state.items.filter((n) => !n.read).length,
  },
  actions: {
    syncPermission() {
      if (!import.meta.client || typeof Notification === 'undefined') return
      this.browserPermission = Notification.permission
    },
    async ensurePermission() {
      if (!import.meta.client || typeof Notification === 'undefined') return
      if (Notification.permission === 'default') {
        this.browserPermission = await Notification.requestPermission()
      } else {
        this.browserPermission = Notification.permission
      }
    },
    push(title: string, body: string, opts?: { chatId?: string; silent?: boolean }) {
      const item: AppNotification = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
        title,
        body,
        chatId: opts?.chatId,
        createdAt: new Date().toISOString(),
        read: false,
      }
      this.items.unshift(item)
      if (this.items.length > 50) {
        this.items = this.items.slice(0, 50)
      }

      if (!opts?.silent) {
        this.showBrowserNotification(item)
      }
    },
    markAllRead() {
      this.items = this.items.map((n) => ({ ...n, read: true }))
    },
    markRead(id: string) {
      const item = this.items.find((n) => n.id === id)
      if (item) item.read = true
    },
    showBrowserNotification(item: AppNotification) {
      if (!import.meta.client || typeof Notification === 'undefined') return
      if (Notification.permission !== 'granted') return
      const n = new Notification(item.title, { body: item.body, tag: item.chatId || item.id })
      setTimeout(() => n.close(), 5000)
    },
  },
})
