// WebRTC composable — handles 1-to-1 audio/video calls via WebSocket signalling.
export function useWebRTC() {
  const callStore = useCallStore()
  const auth = useAuthStore()
  const { sendRaw } = useWebSocket()
  const config = useRuntimeConfig()

  let pc: RTCPeerConnection | null = null
  let localStream: MediaStream | null = null

  const localVideo  = ref<HTMLVideoElement | null>(null)
  const remoteVideo = ref<HTMLVideoElement | null>(null)

  const iceServers = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    // Add TURN here if coturn is configured.
    ...(config.public.turnServer
      ? [{
          urls: `turn:${config.public.turnServer}:3478`,
          username: auth.user?.id ?? 'user',
          credential: config.public.turnSecret,
        }]
      : []),
  ]

  async function startCall(peerId: string, type: 'video' | 'audio') {
    await setupPC()
    const stream = await getLocalMedia(type)

    stream.getTracks().forEach(t => pc!.addTrack(t, stream))

    const offer = await pc!.createOffer()
    await pc!.setLocalDescription(offer)

    sendRaw({
      type: 'call_ring',
      receiver_id: peerId,
      data: JSON.stringify({
        sdp: offer,
        type: type,
        display_name: auth.user?.display_name,
      }),
    })
  }

  async function acceptCall(offer: RTCSessionDescriptionInit, peerId: string, type: 'video' | 'audio') {
    await setupPC()
    const stream = await getLocalMedia(type)
    stream.getTracks().forEach(t => pc!.addTrack(t, stream))

    await pc!.setRemoteDescription(new RTCSessionDescription(offer))

    const answer = await pc!.createAnswer()
    await pc!.setLocalDescription(answer)

    sendRaw({ type: 'call_answer', receiver_id: peerId, data: JSON.stringify({ sdp: answer }) })
  }

  async function handleAnswer(sdp: RTCSessionDescriptionInit) {
    await pc?.setRemoteDescription(new RTCSessionDescription(sdp))
  }

  async function handleICE(candidate: RTCIceCandidateInit) {
    try {
      await pc?.addIceCandidate(new RTCIceCandidate(candidate))
    } catch {}
  }

  function rejectCall(peerId: string) {
    sendRaw({ type: 'call_reject', receiver_id: peerId })
    callStore.endCall()
  }

  function endCall() {
    sendRaw({ type: 'call_end', receiver_id: callStore.peerId })
    cleanup()
    callStore.endCall()
  }

  function hangUp() {
    endCall()
  }

  function toggleMicrophone(mute: boolean) {
    if (!localStream) return
    localStream.getAudioTracks().forEach(track => {
      track.enabled = !mute
    })
  }

  function toggleCamera(mute: boolean) {
    if (!localStream) return
    localStream.getVideoTracks().forEach(track => {
      track.enabled = !mute
    })
  }

  function cleanup() {
    localStream?.getTracks().forEach(t => t.stop())
    pc?.close()
    pc = null
    localStream = null
  }

  async function setupPC() {
    if (pc) { pc.close(); pc = null }
    pc = new RTCPeerConnection({ iceServers })

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        sendRaw({
          type: 'call_ice',
          receiver_id: callStore.peerId,
          data: JSON.stringify({ candidate: e.candidate }),
        })
      }
    }

    pc.ontrack = (e) => {
      if (remoteVideo.value) remoteVideo.value.srcObject = e.streams[0]
    }
  }

  async function getLocalMedia(type: 'video' | 'audio') {
    localStream = await navigator.mediaDevices.getUserMedia({
      video: type === 'video',
      audio: true,
    })
    if (localVideo.value) localVideo.value.srcObject = localStream
    return localStream
  }

  // Listen for WebRTC signals routed through the WebSocket composable.
  function listenSignals() {
    window.addEventListener('webrtc-signal', async (e: Event) => {
      const msg = (e as CustomEvent).detail
      if (!msg) return
      if (msg.type === 'call_answer' && msg.data) {
        const d = JSON.parse(msg.data)
        await handleAnswer(d.sdp)
      } else if (msg.type === 'call_ice' && msg.data) {
        const d = JSON.parse(msg.data)
        await handleICE(d.candidate)
      } else if (msg.type === 'call_end' || msg.type === 'call_reject') {
        cleanup()
        callStore.endCall()
      }
    })
  }

  onMounted(listenSignals)
  onUnmounted(cleanup)

  return { startCall, acceptCall, rejectCall, endCall, hangUp, toggleMicrophone, toggleCamera, localVideo, remoteVideo }
}
