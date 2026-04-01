import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null as string | null,
    user:  null as any,
  }),
  getters: {
    isLoggedIn: (s) => !!s.token,
    isAdmin:    (s) => s.user?.role === 'admin',
  },
  actions: {
    hydrate() {
      if (import.meta.client) {
        this.token = localStorage.getItem('of_token')
        const raw = localStorage.getItem('of_user')
        if (!raw) {
          this.user = null
          return
        }
        try {
          this.user = JSON.parse(raw)
        } catch {
          this.user = null
          localStorage.removeItem('of_user')
        }
      }
    },
    set(token: string, user: any) {
      this.token = token
      this.user  = user
      if (import.meta.client) {
        localStorage.setItem('of_token', token)
        localStorage.setItem('of_user', JSON.stringify(user))
      }
    },
    logout() {
      this.token = null
      this.user  = null
      if (import.meta.client) {
        localStorage.removeItem('of_token')
        localStorage.removeItem('of_user')
      }
    },
  },
})
