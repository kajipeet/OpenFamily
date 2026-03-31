// Route guard: redirect non-admins away from /app/admin.
export default defineNuxtRouteMiddleware(() => {
  const auth = useAuthStore()
  if (!auth.isAdmin) {
    return navigateTo('/app')
  }
})
