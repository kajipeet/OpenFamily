<template>
  <div :class="['flex', isMine ? 'justify-end' : 'justify-start']">
    <div :class="['max-w-[82%] md:max-w-[70%] px-3 py-2 shadow-sm', isMine ? 'chat-bubble-out' : 'chat-bubble-in']">
      <template v-if="message.type === 'text'">
        <p class="text-sm whitespace-pre-wrap break-words">{{ decryptedContent }}</p>
      </template>

      <template v-else-if="message.type === 'image'">
        <img :src="resolvedFileUrl" :alt="decryptedFileName || 'image'" class="rounded-xl max-h-80 w-auto mb-2" />
        <p v-if="decryptedContent" class="text-sm whitespace-pre-wrap break-words">{{ decryptedContent }}</p>
      </template>

      <template v-else-if="message.type === 'video'">
        <video :src="resolvedFileUrl" controls class="rounded-xl max-h-80 w-auto mb-2" />
        <p v-if="decryptedContent" class="text-sm whitespace-pre-wrap break-words">{{ decryptedContent }}</p>
      </template>

      <template v-else-if="message.type === 'audio' || message.type === 'voice'">
        <audio :src="resolvedFileUrl" controls class="w-full mb-2" />
        <p v-if="decryptedContent" class="text-sm whitespace-pre-wrap break-words">{{ decryptedContent }}</p>
      </template>

      <template v-else>
        <a :href="resolvedFileUrl" :download="decryptedFileName || undefined" target="_blank" rel="noreferrer" class="text-sm underline break-all">
          {{ decryptedFileName || decryptedContent || 'Attachment' }}
        </a>
      </template>

      <div class="mt-1 flex items-center justify-end gap-2 text-[11px] text-gray-500">
        <span>{{ formatTime(message.created_at) }}</span>
        <span v-if="message.delete_at" class="text-red-500">{{ countdown }}</span>
      </div>
    </div>
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
