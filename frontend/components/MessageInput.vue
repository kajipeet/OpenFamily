<template>
  <div class="border-t border-black/10 bg-white px-2 sm:px-3 py-2 sm:py-3 flex-shrink-0 w-full min-h-[60px] sm:min-h-[68px]">
    <form class="flex items-end gap-1 sm:gap-1.5 md:gap-2" @submit.prevent="submitText">
      <label class="shrink-0 cursor-pointer rounded-full p-1.5 sm:p-2 hover:bg-gray-100 transition text-base sm:text-lg" title="Attach file">
        <input class="hidden" type="file" @change="onFileChange" />
        <span>📎</span>
      </label>
      <button 
        type="button" 
        class="shrink-0 rounded-full p-1.5 sm:p-2 hover:bg-gray-100 transition text-base sm:text-lg" 
        title="Record voice note" 
        @click="toggleRecording"
        :class="isRecording ? 'bg-red-100' : ''"
      >
        <span>{{ isRecording ? '⏹️' : '🎤' }}</span>
      </button>
      <textarea
        v-model="text"
        rows="1"
        placeholder="Write a message"
        class="flex-1 resize-none rounded-2xl border border-gray-200 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-tg-blue min-h-[36px] sm:min-h-[40px] max-h-24"
        @input="handleInput"
        @keydown.enter.exact.prevent="submitText"
      />
      <button 
        type="submit"
        class="shrink-0 rounded-full bg-tg-blue text-white w-9 h-9 sm:w-10 sm:h-10 hover:bg-tg-blue-dark transition flex items-center justify-center text-sm sm:text-base flex-shrink-0"
      >
        ➤
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  chatId: { type: String, required: true },
  receiverId: { type: String, required: true },
  receiverPublicKey: { type: String, required: true },
})

const emit = defineEmits(['sent'])
const chatStore = useChatStore()
const headers = useAuthHeaders()
const { sendTyping } = useWebSocket()
const e2ee = useE2EE()
const uploader = useChunkedUpload()
const text = ref('')
const isRecording = ref(false)
let recorder: MediaRecorder | null = null
let chunks: Blob[] = []

onMounted(async () => {
  await e2ee.ensurePublished()
})

async function withRetry<T>(run: () => Promise<T>, attempts = 5) {
  let lastError: any
  for (let i = 0; i < attempts; i++) {
    try {
      return await run()
    } catch (err) {
      lastError = err
      // Exponential backoff for unstable networks.
      const delay = Math.min(1200 * (i + 1), 5000)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }
  throw lastError
}

function handleInput() {
  if (props.receiverId) {
    sendTyping(props.receiverId, props.chatId)
  }
}

async function submitText() {
  const content = text.value.trim()
  if (!content) return

  if (!props.receiverPublicKey) {
    alert('Receiver E2EE key is not available yet')
    return
  }

  const encrypted = await e2ee.encryptTextForChat(content, props.receiverPublicKey, props.chatId)

  const message: any = await withRetry(() => $fetch(`/api/chats/${props.chatId}/messages`, {
    method: 'POST',
    headers,
    body: {
      type: 'text',
      content: encrypted.ciphertext,
      nonce: encrypted.nonce,
      e2ee_version: encrypted.version,
    },
  }))
  chatStore.messages.push(message)
  text.value = ''
  emit('sent')
}

async function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  if (!props.receiverPublicKey) {
    alert('Receiver E2EE key is not available yet')
    return
  }

  await sendEncryptedFile(file)
  input.value = ''
}

async function sendEncryptedFile(file: File, forcedType?: string) {
  let encryptedCaption: { ciphertext: string; nonce: string; version: string } | null = null
  const caption = text.value.trim()
  if (caption) {
    encryptedCaption = await e2ee.encryptTextForChat(caption, props.receiverPublicKey, props.chatId)
  }

  const encryptedFileName = await e2ee.encryptTextForChat(file.name, props.receiverPublicKey, props.chatId)
  const encryptedFile = await e2ee.encryptFileForChat(file, props.receiverPublicKey, props.chatId)
  const upload: any = await withRetry(() => uploader.uploadFile(encryptedFile.encryptedFile), 4)

  const type = forcedType || (file.type.startsWith('image/')
    ? 'image'
    : file.type.startsWith('video/')
      ? 'video'
      : file.type.startsWith('audio/')
        ? 'audio'
        : 'file')

  const message: any = await withRetry(() => $fetch(`/api/chats/${props.chatId}/messages`, {
    method: 'POST',
    headers,
    body: {
      type,
      content: encryptedCaption?.ciphertext || '',
      nonce: encryptedCaption?.nonce || '',
      file_url: upload.url,
      file_name: encryptedFileName.ciphertext,
      file_name_nonce: encryptedFileName.nonce,
      file_nonce: encryptedFile.fileNonce,
      mime_type: file.type,
      file_size: file.size,
      e2ee_version: encryptedFile.version,
    },
  }))

  chatStore.messages.push(message)
  text.value = ''
  emit('sent')
}

async function toggleRecording() {
  if (isRecording.value) {
    recorder?.stop()
    isRecording.value = false
    return
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    recorder = new MediaRecorder(stream)
    chunks = []

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data)
    }

    recorder.onstop = async () => {
      const blob = new Blob(chunks, { type: 'audio/webm' })
      const file = new File([blob], `voice-${Date.now()}.webm`, { type: 'audio/webm' })
      await sendEncryptedFile(file, 'voice')
      stream.getTracks().forEach((track) => track.stop())
    }

    recorder.start()
    isRecording.value = true
  } catch (err) {
    console.error('Microphone access denied:', err)
    alert('Microphone access is required to record voice messages')
  }
}
</script>
