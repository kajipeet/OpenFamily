// Route guard: redirect non-admins away from /app/admin.
export default defineNuxtRouteMiddleware(async () => {
  const auth = useAuthStore()

  if (import.meta.client && !auth.token) {
    auth.hydrate()
  }

  if (auth.token && !auth.user) {
    try {
      const me = await $fetch('/api/users/me', { headers: useAuthHeaders() })
      auth.user = me as any
      localStorage.setItem('of_user', JSON.stringify(me))
    } catch {
      auth.logout()
      return navigateTo('/garden')
    }
  }

  if (!auth.isAdmin) {
    return navigateTo('/app')
  }
})
