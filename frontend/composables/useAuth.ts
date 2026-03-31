export function useAuth() {
  const auth = useAuthStore()
  const router = useRouter()
  const config = useRuntimeConfig()

  async function loginUser(username: string, password: string) {
    const data: any = await $fetch(`${config.public.apiBase}/auth/login`, {
      method: 'POST',
      body: { username, password },
    })
    auth.set(data.token, data.user)
    await useE2EE().ensurePublished()
    return data
  }

  function logout() {
    auth.logout()
    // Disconnect WebSocket.
    useWebSocket().disconnect()
    router.push('/garden')
  }

  return { loginUser, logout }
}

// Convenience composable: returns headers with the Bearer token.
export function useAuthHeaders() {
  const auth = useAuthStore()
  return auth.token ? { Authorization: `Bearer ${auth.token}` } : {}
}
