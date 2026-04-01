// Route guard: redirect unauthenticated users to login.
export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore()

  if (import.meta.client && !auth.token) {
    auth.hydrate()
  }

  if (!auth.isLoggedIn) {
    return navigateTo('/garden')
  }
})
