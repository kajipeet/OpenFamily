<template>
  <div :class="['flex gap-2 mb-3', isMine ? 'justify-end' : 'justify-start']">
    <div :class="['max-w-[90%] sm:max-w-[85%] md:max-w-[70%] lg:max-w-[60%] px-3 sm:px-4 py-2 shadow-sm rounded-2xl', isMine ? 'chat-bubble-out' : 'chat-bubble-in']">
      <template v-if="message.type === 'text'">
        <p class="text-sm sm:text-base whitespace-pre-wrap break-words leading-relaxed">{{ decryptedContent }}</p>
      </template>

      <template v-else-if="message.type === 'image'">
        <div class="cursor-pointer mb-2 inline-block" @click="showImageModal">
          <img 
            :src="resolvedFileUrl" 
            :alt="decryptedFileName || 'image'" 
            class="rounded-xl max-h-64 sm:max-h-80 w-auto max-w-full object-cover hover:opacity-90 transition" 
          />
        </div>
        <p v-if="decryptedContent" class="text-sm sm:text-base whitespace-pre-wrap break-words">{{ decryptedContent }}</p>
      </template>

      <template v-else-if="message.type === 'video'">
        <video 
          :src="resolvedFileUrl" 
          controls 
          class="rounded-xl max-h-64 sm:max-h-80 w-auto max-w-full mb-2"
          controlsList="nodownload"
        />
        <p v-if="decryptedContent" class="text-sm sm:text-base whitespace-pre-wrap break-words">{{ decryptedContent }}</p>
      </template>

      <template v-else-if="message.type === 'audio' || message.type === 'voice'">
        <div class="bg-black/5 rounded-xl p-2 sm:p-3 mb-2 w-full sm:min-w-60">
          <div class="flex items-center gap-2">
            <button class="flex-shrink-0 w-8 h-8 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center transition" @click="togglePlayPause">
              <span class="text-lg leading-none">{{ audioPlaying ? '⏸' : '▶' }}</span>
            </button>
            <audio 
              ref="audioEl" 
              :src="resolvedFileUrl"
              class="flex-1 h-6"
              @play="audioPlaying = true"
              @pause="audioPlaying = false"
              @ended="audioPlaying = false"
            />
          </div>
          <div v-if="message.type === 'voice'" class="text-xs text-gray-500 mt-1 px-10">Voice message</div>
        </div>
        <p v-if="decryptedContent" class="text-sm sm:text-base whitespace-pre-wrap break-words">{{ decryptedContent }}</p>
      </template>

      <template v-else>
        <a 
          :href="resolvedFileUrl" 
          :download="decryptedFileName || undefined" 
          target="_blank" 
          rel="noreferrer" 
          class="text-sm sm:text-base text-blue-600 hover:text-blue-800 underline break-all flex items-center gap-1"
        >
          📎 {{ decryptedFileName || decryptedContent || 'Attachment' }}
        </a>
      </template>

      <div class="mt-2 flex items-center justify-between gap-2 text-xs sm:text-[11px] px-0.5">
        <span class="text-gray-400 opacity-75">{{ formatTime(message.created_at) }}</span>
        <span v-if="message.delete_at" class="text-red-500 font-medium animate-pulse">{{ countdown }}</span>
      </div>
    </div>
  </div>

  <!-- Image Modal -->
  <div 
    v-if="showModal && message.type === 'image'" 
    class="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
    @click.self="showModal = false"
  >
    <button 
      class="absolute top-4 right-4 text-white text-2xl hover:opacity-70 transition"
      @click="showModal = false"
    >
      ✕
    </button>
    <img 
      :src="resolvedFileUrl" 
      :alt="decryptedFileName || 'image'" 
      class="max-h-screen max-w-screen object-contain"
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  message: { type: Object, required: true },
  isMine: { type: Boolean, default: false },
  peerPublicKey: { type: String, default: '' },
})

const e2ee = useE2EE()
const headers = useAuthHeaders()

const decryptedContent = ref('')
const decryptedFileName = ref('')
const resolvedFileUrl = ref('')
const showModal = ref(false)
const audioPlaying = ref(false)
const audioEl = ref<HTMLAudioElement>()

const now = ref(Date.now())
let timer: ReturnType<typeof setInterval> | null = null
let fileObjectUrl: string | null = null

watch(() => props.message?.id, () => {
  loadDecryptedData()
}, { immediate: true })

watch(() => props.peerPublicKey, () => {
  loadDecryptedData()
})

async function loadDecryptedData() {
  if (!props.message) return

  if (fileObjectUrl) {
    URL.revokeObjectURL(fileObjectUrl)
    fileObjectUrl = null
  }

  resolvedFileUrl.value = props.message.file_url || ''
  decryptedContent.value = props.message.content || ''
  decryptedFileName.value = props.message.file_name || ''

  if (!props.peerPublicKey) return

  if (props.message.content && props.message.nonce) {
    try {
      decryptedContent.value = await e2ee.decryptTextForChat(
        props.message.content,
        props.message.nonce,
        props.peerPublicKey,
        props.message.chat_id,
      )
    } catch {
      decryptedContent.value = '[encrypted]'
    }
  }

  if (props.message.file_name && props.message.file_name_nonce) {
    try {
      decryptedFileName.value = await e2ee.decryptTextForChat(
        props.message.file_name,
        props.message.file_name_nonce,
        props.peerPublicKey,
        props.message.chat_id,
      )
    } catch {
      decryptedFileName.value = 'Encrypted file'
    }
  }

  if (props.message.file_url && props.message.file_nonce) {
    try {
      const response = await fetch(props.message.file_url, { headers })
      if (!response.ok) throw new Error('failed to download encrypted file')
      const encryptedBlob = await response.blob()
      const decryptedBlob = await e2ee.decryptFileForChat(
        encryptedBlob,
        props.message.file_nonce,
        props.peerPublicKey,
        props.message.chat_id,
        props.message.mime_type,
      )
      fileObjectUrl = URL.createObjectURL(decryptedBlob)
      resolvedFileUrl.value = fileObjectUrl
    } catch {
      resolvedFileUrl.value = ''
    }
  }
}

const countdown = computed(() => {
  if (!props.message?.delete_at) return ''
  const diff = Math.max(0, new Date(props.message.delete_at).getTime() - now.value)
  const totalSeconds = Math.ceil(diff / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
})

function showImageModal() {
  if (props.message.type === 'image') {
    showModal.value = true
  }
}

function togglePlayPause() {
  if (!audioEl.value) return
  audioPlaying.value ? audioEl.value.pause() : audioEl.value.play()
}

onMounted(() => {
  timer = setInterval(() => {
    now.value = Date.now()
  }, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
  if (fileObjectUrl) URL.revokeObjectURL(fileObjectUrl)
})

function formatTime(ts?: string) {
  if (!ts) return ''
  try {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}
</script>
