// Singleton WebSocket connection shared across the app.
let ws: WebSocket | null = null
let reconnectTimer: ReturnType<typeof setTimeout> | null = null

export function useWebSocket() {
  const auth = useAuthStore()
  const chatStore = useChatStore()
  const callStore = useCallStore()
  const config = useRuntimeConfig()

  function connect() {
    if (!import.meta.client || !auth.token) return
    if (ws && ws.readyState === WebSocket.OPEN) return

    const wsUrl = `${config.public.wsBase}?token=${encodeURIComponent(auth.token)}`
    ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      console.log('[ws] connected')
      if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null }
    }

    ws.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data)
        handleMessage(msg)
      } catch {}
    }

    ws.onclose = () => {
      console.log('[ws] disconnected, reconnecting…')
      ws = null
      reconnectTimer = setTimeout(connect, 3000)
    }

    ws.onerror = () => {
      ws?.close()
    }
  }

  function disconnect() {
    if (reconnectTimer) clearTimeout(reconnectTimer)
    ws?.close()
    ws = null
  }

  function sendRaw(data: object) {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data))
    }
  }

  function sendTyping(receiverId: string, chatId: string) {
    sendRaw({ type: 'typing', receiver_id: receiverId, chat_id: chatId })
  }

  // ── WebSocket event routing ─────────────────────────────────────────────
  function handleMessage(msg: any) {
    switch (msg.type) {
      case 'message':
        if (msg.data) chatStore.pushMessage(JSON.parse(msg.data))
        break

      case 'read':
        if (msg.data) {
          const d = JSON.parse(msg.data)
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
          const d = JSON.parse(msg.data)
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

  return { connect, disconnect, sendRaw, sendTyping }
}
