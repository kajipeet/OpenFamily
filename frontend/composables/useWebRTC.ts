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
  const turnHost = config.public.turnServer
  const turnUsername = auth.user?.id ?? 'user'
  const turnCredential = config.public.turnSecret

  const iceServers = turnHost
    ? [{
        urls: [
          `turn:${turnHost}:80?transport=tcp`,
          `turn:${turnHost}:3478?transport=tcp`,
          `turns:${turnHost}:443?transport=tcp`,
          `turns:${turnHost}:5349?transport=tcp`,
        ],
        username: turnUsername,
        credential: turnCredential,
      }]
    : [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ]

  function sendSignal(receiverId: string, kind: string, payload?: any) {
    sendRaw({
      type: 'signal',
      receiver_id: receiverId,
      data: JSON.stringify({ k: kind, p: payload ?? {} }),
    })
  }

  async function startCall(peerId: string, type: 'video' | 'audio') {
    await setupPC()
    const stream = await getLocalMedia(type)

    stream.getTracks().forEach(t => pc!.addTrack(t, stream))

    const offer = await pc!.createOffer()
    await pc!.setLocalDescription(offer)

    sendSignal(peerId, 'r', {
        sdp: offer,
        type: type,
        display_name: auth.user?.display_name,
    })
  }

  async function acceptCall(offer: RTCSessionDescriptionInit, peerId: string, type: 'video' | 'audio') {
    await setupPC()
    const stream = await getLocalMedia(type)
    stream.getTracks().forEach(t => pc!.addTrack(t, stream))

    await pc!.setRemoteDescription(new RTCSessionDescription(offer))

    const answer = await pc!.createAnswer()
    await pc!.setLocalDescription(answer)

    sendSignal(peerId, 'a', { sdp: answer })
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
    sendSignal(peerId, 'x')
    callStore.endCall()
  }

  function endCall() {
    sendSignal(callStore.peerId, 'e')
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
    pc = new RTCPeerConnection({
      iceServers,
      iceTransportPolicy: turnHost ? 'relay' : 'all',
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require',
    })

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        sendSignal(callStore.peerId, 'i', { candidate: e.candidate })
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
