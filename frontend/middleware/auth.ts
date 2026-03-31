// Route guard: redirect unauthenticated users to login.
export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore()
  if (!auth.isLoggedIn) {
    return navigateTo('/garden')
  }
})
