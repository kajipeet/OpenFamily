// Hydrate auth state from localStorage on every client navigation,
// then open the WebSocket connection when the user is logged in.
export default defineNuxtPlugin(() => {
  const auth = useAuthStore()
  auth.hydrate()

  if (auth.isLoggedIn) {
    useE2EE().ensurePublished().catch(() => {})
    useWebSocket().connect()
  }
})
