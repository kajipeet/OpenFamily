// Singleton WebSocket connection shared across the app.
let ws: WebSocket | null = null
let reconnectTimer: ReturnType<typeof setTimeout> | null = null
let heartbeatTimer: ReturnType<typeof setInterval> | null = null
let pollTimer: ReturnType<typeof setInterval> | null = null
let failureCount = 0
const MAX_FAILURES = 3
const HEARTBEAT_INTERVAL = 30000 // 30 seconds
const POLL_INTERVAL = 3000 // 3 seconds
let lastMessageTime = Date.now()

export function useWebSocket() {
  const auth = useAuthStore()
  const chatStore = useChatStore()
  const callStore = useCallStore()
  const config = useRuntimeConfig()

  function connect() {
    if (!import.meta.client || !auth.token) return
    if (ws && ws.readyState === WebSocket.OPEN) return

    const wsUrl = `${config.public.wsBase}?token=${encodeURIComponent(auth.token)}`
    
    try {
      ws = new WebSocket(wsUrl)
    } catch (err) {
      console.warn('[ws] WebSocket creation failed, falling back to polling', err)
      startPolling()
      return
    }

    ws.onopen = () => {
      console.log('[ws] connected')
      failureCount = 0
      if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null }
      if (pollTimer) startHeartbeat()
      // Stop polling if it was active
      if (pollTimer) {
        clearInterval(pollTimer)
        pollTimer = null
      }
    }

    ws.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data)
        if (msg.type !== 'ping') {
          handleMessage(msg)
          lastMessageTime = Date.now()
        }
      } catch {}
    }

    ws.onclose = () => {
      console.log('[ws] disconnected')
      ws = null
      failureCount++
      stopHeartbeat()
      
      // After multiple failures, fall back to polling
      if (failureCount >= MAX_FAILURES) {
        console.warn(`[ws] Failed ${failureCount} times, switching to polling`)
        startPolling()
        return
      }
      
      // Otherwise try to reconnect
      reconnectTimer = setTimeout(connect, 3000 + Math.random() * 2000)
    }

    ws.onerror = (err) => {
      console.warn('[ws] error:', err)
      failureCount++
      ws?.close()
    }
  }

  function startHeartbeat() {
    stopHeartbeat()
    heartbeatTimer = setInterval(() => {
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'ping' }))
      }
    }, HEARTBEAT_INTERVAL)
  }

  function stopHeartbeat() {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer)
      heartbeatTimer = null
    }
  }

  async function startPolling() {
    if (pollTimer) return
    console.log('[ws] starting HTTP polling fallback')
    
    pollTimer = setInterval(async () => {
      try {
        const response = await $fetch('/api/events/poll', {
          method: 'POST',
          headers: { Authorization: `Bearer ${auth.token}` },
          body: { since: lastMessageTime },
        })
        
        if (response && typeof response === 'object') {
          const events = Array.isArray(response) ? response : response.events || []
          for (const evt of events) {
            handleMessage(evt)
          }
          lastMessageTime = Date.now()
          failureCount = 0
        }
      } catch (err) {
        console.warn('[poll] error:', err)
        failureCount++
      }
    }, POLL_INTERVAL)
  }

  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
  }

  function disconnect() {
    if (reconnectTimer) clearTimeout(reconnectTimer)
    stopHeartbeat()
    stopPolling()
    ws?.close()
    ws = null
  }

  function sendRaw(data: object) {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data))
    }
    // Note: polling is read-only, real-time sends still use REST API
  }

  function sendTyping(receiverId: string, chatId: string) {
    sendRaw({ type: 'typing', receiver_id: receiverId, chat_id: chatId })
  }

  // ── WebSocket event routing ─────────────────────────────────────────────
  function handleMessage(msg: any) {
    switch (msg.type) {
      case 'message':
        if (msg.data) {
          const parsed = typeof msg.data === 'string' ? JSON.parse(msg.data) : msg.data
          chatStore.pushMessage(parsed)
        }
        break

      case 'read':
        if (msg.data) {
          const d = typeof msg.data === 'string' ? JSON.parse(msg.data) : msg.data
          chatStore.applyReadReceipt(d.chat_id, d.delete_at)
        }
        break

      case 'message_deleted':
        if (msg.message_id) chatStore.removeMessage(msg.message_id)
        break

      case 'typing':
        chatStore.setTyping(msg.sender_id)
        break

      case 'call_ring':
        if (msg.data) {
          const d = typeof msg.data === 'string' ? JSON.parse(msg.data) : msg.data
          callStore.receiveCall(msg.sender_id, d.display_name ?? msg.sender_id, d.type ?? 'video', d.sdp)
        }
        break

      case 'call_answer':
      case 'call_ice':
      case 'call_end':
      case 'call_reject':
        // Forwarded to the WebRTC composable via a custom event bus.
        window.dispatchEvent(new CustomEvent('webrtc-signal', { detail: msg }))
        break
    }
  }

  return { connect, disconnect, sendRaw, sendTyping, isConnected: () => ws?.readyState === WebSocket.OPEN }
}
