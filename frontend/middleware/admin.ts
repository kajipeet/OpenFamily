// Route guard: redirect non-admins away from /app/admin.
export default defineNuxtRouteMiddleware(async () => {
  const auth = useAuthStore()

  if (import.meta.client) {
    auth.hydrate()
  }

  if (!auth.token) {
    return navigateTo('/garden')
  }

  try {
    // Always refresh identity before role check to avoid stale localStorage races.
    const me = await $fetch('/api/users/me', { headers: useAuthHeaders() })
    auth.user = me as any
    if (import.meta.client) {
      localStorage.setItem('of_user', JSON.stringify(me))
    }
  } catch {
    auth.logout()
    return navigateTo('/garden')
  }

  if (!auth.isAdmin) {
    return navigateTo('/app')
  }
})
