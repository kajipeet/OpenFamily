<template>
  <div class="fixed inset-0 z-50 bg-black flex items-center justify-center p-2 sm:p-4">
    <div :class="['w-full h-full flex flex-col rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl', !isFullscreen ? 'sm:max-w-5xl sm:h-auto' : '']">
      <!-- Header -->
      <div class="flex items-center justify-between px-3 sm:px-5 py-2 sm:py-4 bg-gradient-to-r from-slate-900 to-slate-800 border-b border-white/10 text-white flex-shrink-0">
        <div class="min-w-0">
          <p class="font-semibold text-sm sm:text-base truncate">{{ callStore.peerName || 'Call' }}</p>
          <p class="text-xs text-white/60">{{ callStore.type === 'video' ? 'Video call' : 'Audio call' }} • {{ connectionQuality }}</p>
        </div>
        <div class="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <button
            v-if="callStore.type === 'video' && !isFullscreen"
            @click="toggleFullscreen"
            class="p-2 rounded-full hover:bg-white/10 transition text-white text-lg"
            title="Fullscreen"
          >
            ⛶
          </button>
          <button
            @click="toggleVolumeIcon"
            class="p-2 rounded-full hover:bg-white/10 transition text-white text-lg"
            :title="isMuted ? 'Unmute' : 'Mute'"
          >
            {{ isMuted ? '🔇' : '🔊' }}
          </button>
        </div>
      </div>

      <!-- Video/Audio Container -->
      <div :class="['flex-1 bg-black flex gap-2 sm:gap-4 p-2 sm:p-4 overflow-hidden', callStore.type === 'video' ? 'flex-col sm:flex-row' : 'flex-col items-center justify-center']">
        <!-- Remote video (main) -->
        <div :class="['rounded-2xl bg-slate-950 overflow-hidden flex items-center justify-center flex-shrink-0', callStore.type === 'video' ? 'flex-1 min-h-0 sm:aspect-video' : 'w-32 h-32']">
          <video 
            ref="remoteVideoEl" 
            autoplay 
            playsinline 
            class="w-full h-full object-cover"
          />
          <div v-if="!remoteVideoActive" class="absolute text-center">
            <div class="text-6xl sm:text-8xl mb-2">📹</div>
            <p class="text-white/60 text-sm sm:text-base">{{ callStore.peerName || 'Peer' }}</p>
            <p v-if="callStore.type === 'audio'" class="text-white/40 text-xs sm:text-sm">Audio only</p>
          </div>
        </div>

        <!-- Local video (picture-in-picture or small on mobile) -->
        <div :class="['rounded-2xl bg-slate-950 overflow-hidden flex items-center justify-center flex-shrink-0', callStore.type === 'video' ? 'w-24 h-24 sm:w-40 sm:h-40 sm:aspect-video' : 'w-24 h-24']">
          <video 
            ref="localVideoEl" 
            autoplay 
            playsinline 
            muted 
            class="w-full h-full object-cover"
          />
          <div v-if="!localVideoActive || callStore.type === 'audio'" class="absolute text-center">
            <div class="text-3xl sm:text-4xl">🎥</div>
          </div>
        </div>
      </div>

      <!-- Controls Footer -->
      <div class="flex items-center justify-center gap-2 sm:gap-4 px-3 sm:px-5 py-3 sm:py-4 bg-gradient-to-r from-slate-900 to-slate-800 border-t border-white/10 flex-shrink-0">
        <!-- Incoming call actions -->
        <template v-if="callStore.incoming">
          <button
            @click="acceptIncoming"
            class="flex-1 sm:flex-none px-6 sm:px-8 py-2.5 sm:py-3 rounded-full bg-green-600 hover:bg-green-500 text-white font-medium text-sm sm:text-base transition shadow-lg hover:shadow-green-500/50"
          >
            ✓ Accept
          </button>
          <button
            @click="rejectIncoming"
            class="flex-1 sm:flex-none px-6 sm:px-8 py-2.5 sm:py-3 rounded-full bg-red-600 hover:bg-red-500 text-white font-medium text-sm sm:text-base transition shadow-lg hover:shadow-red-500/50"
          >
            ✕ Reject
          </button>
        </template>

        <!-- Active call actions -->
        <template v-else>
          <button
            @click="toggleMic"
            :class="['px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-medium text-sm sm:text-base transition', isMicMuted ? 'bg-red-600 hover:bg-red-500' : 'bg-slate-700 hover:bg-slate-600']"
          >
            {{ isMicMuted ? '🔇' : '🎤' }}
            <span class="hidden sm:inline ml-2">{{ isMicMuted ? 'Unmute' : 'Mute' }}</span>
          </button>
          <button
            v-if="callStore.type === 'video'"
            @click="toggleCam"
            :class="['px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-medium text-sm sm:text-base transition', isCameraMuted ? 'bg-orange-600 hover:bg-orange-500' : 'bg-slate-700 hover:bg-slate-600']"
          >
            {{ isCameraMuted ? '📹' : '🎥' }}
            <span class="hidden sm:inline ml-2">{{ isCameraMuted ? 'Camera off' : 'Camera on' }}</span>
          </button>
          <button
            @click="hangUp"
            class="flex-1 sm:flex-none px-4 sm:px-8 py-2.5 sm:py-3 rounded-full bg-red-600 hover:bg-red-500 text-white font-medium text-sm sm:text-base transition shadow-lg hover:shadow-red-500/50"
          >
            📞 End Call
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const callStore = useCallStore()
const { startCall, acceptCall, rejectCall, endCall, hangUp: rtcHangup, toggleMicrophone, toggleCamera, localVideo, remoteVideo } = useWebRTC()

const localVideoEl = ref<HTMLVideoElement | null>(null)
const remoteVideoEl = ref<HTMLVideoElement | null>(null)
const isFullscreen = ref(false)
const isMicMuted = ref(false)
const isCameraMuted = ref(false)
const isMuted = ref(false)
const remoteVideoActive = ref(false)
const localVideoActive = ref(false)
const connectionQuality = ref('connecting...')
let startedOutgoing = false

watch(localVideoEl, (value) => {
  if (value) {
    localVideo.value = value
    value.onloadedmetadata = () => {
      localVideoActive.value = value!.readyState === value!.HAVE_ENOUGH_DATA
    }
  }
}, { immediate: true })

watch(remoteVideoEl, (value) => {
  if (value) {
    remoteVideo.value = value
    value.onloadedmetadata = () => {
      remoteVideoActive.value = value!.readyState === value!.HAVE_ENOUGH_DATA
    }
  }
}, { immediate: true })

onMounted(async () => {
  if (!callStore.incoming && callStore.peerId && !startedOutgoing) {
    startedOutgoing = true
    await startCall(callStore.peerId, callStore.type)
  }
  
  // Monitor connection quality every 2 seconds
  const qualityInterval = setInterval(() => {
    updateConnectionQuality()
  }, 2000)
  
  onUnmounted(() => clearInterval(qualityInterval))
})

async function acceptIncoming() {
  if (!callStore.incomingOffer) return
  await acceptCall(callStore.incomingOffer, callStore.peerId, callStore.type)
  callStore.incoming = false
}

function rejectIncoming() {
  rejectCall(callStore.peerId)
}

function hangUp() {
  rtcHangup()
  endCall()
}

function toggleMic() {
  isMicMuted.value = !isMicMuted.value
  toggleMicrophone(isMicMuted.value)
}

function toggleCam() {
  isCameraMuted.value = !isCameraMuted.value
  toggleCamera(isCameraMuted.value)
}

function toggleVolumeIcon() {
  isMuted.value = !isMuted.value
  if (remoteVideoEl.value) {
    remoteVideoEl.value.muted = isMuted.value
  }
}

function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value
  if (isFullscreen.value && remoteVideoEl.value) {
    remoteVideoEl.value.requestFullscreen?.().catch(() => {})
  }
}

function updateConnectionQuality() {
  // This would fetch stats from the RTCPeerConnection
  connectionQuality.value = 'good' // Placeholder - implement actual stats gathering
}
</script>
