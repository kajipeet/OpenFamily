<template>
  <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="w-full max-w-5xl bg-slate-950 rounded-3xl overflow-hidden shadow-2xl">
      <div class="flex items-center justify-between px-5 py-4 border-b border-white/10 text-white">
        <div>
          <p class="font-semibold">{{ callStore.peerName || 'Call' }}</p>
          <p class="text-xs text-white/60">{{ callStore.type === 'video' ? 'Video call' : 'Audio call' }}</p>
        </div>
        <div class="flex items-center gap-2">
          <button
            v-if="callStore.incoming"
            @click="acceptIncoming"
            class="px-4 py-2 rounded-full bg-green-600 hover:bg-green-500 text-sm"
          >Accept</button>
          <button
            v-if="callStore.incoming"
            @click="rejectIncoming"
            class="px-4 py-2 rounded-full bg-amber-600 hover:bg-amber-500 text-sm"
          >Reject</button>
          <button
            v-else
            @click="hangUp"
            class="px-4 py-2 rounded-full bg-red-600 hover:bg-red-500 text-sm"
          >End</button>
        </div>
      </div>

      <div class="grid md:grid-cols-2 gap-4 p-4 bg-slate-900">
        <div class="aspect-video rounded-2xl bg-black overflow-hidden flex items-center justify-center text-white/40">
          <video ref="localVideoEl" autoplay playsinline muted class="w-full h-full object-cover" />
          <span v-if="callStore.type === 'audio'" class="absolute">Local audio</span>
        </div>
        <div class="aspect-video rounded-2xl bg-black overflow-hidden flex items-center justify-center text-white/40">
          <video ref="remoteVideoEl" autoplay playsinline class="w-full h-full object-cover" />
          <span v-if="callStore.type === 'audio'" class="absolute">Remote audio</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const callStore = useCallStore()
const { startCall, acceptCall, rejectCall, endCall, localVideo, remoteVideo } = useWebRTC()

const localVideoEl = ref<HTMLVideoElement | null>(null)
const remoteVideoEl = ref<HTMLVideoElement | null>(null)
let startedOutgoing = false

watch(localVideoEl, (value) => {
  if (value) localVideo.value = value
}, { immediate: true })

watch(remoteVideoEl, (value) => {
  if (value) remoteVideo.value = value
}, { immediate: true })

onMounted(async () => {
  if (!callStore.incoming && callStore.peerId && !startedOutgoing) {
    startedOutgoing = true
    await startCall(callStore.peerId, callStore.type)
  }
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
  endCall()
}
</script>
