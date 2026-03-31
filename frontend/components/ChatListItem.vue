<template>
  <div
    class="flex items-center gap-3 px-4 py-3 hover:bg-white/5 border-b border-white/5 transition cursor-pointer"
  >
    <UserAvatar :user="chat.other_user" size="md" />
    <div class="min-w-0 flex-1">
      <div class="flex items-center justify-between gap-2">
        <p class="text-white text-sm font-medium truncate">{{ chat.other_user?.display_name }}</p>
        <span class="text-[11px] text-tg-gray whitespace-nowrap">{{ formatTime(chat.last_message_at) }}</span>
      </div>
      <div class="flex items-center justify-between gap-2 mt-0.5">
        <p class="text-tg-gray text-xs truncate">{{ chat.last_message || 'No messages yet' }}</p>
        <span
          v-if="chat.unread_count"
          class="min-w-5 h-5 px-1 rounded-full bg-tg-green text-white text-[11px] grid place-items-center"
        >
          {{ chat.unread_count }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { format } from 'date-fns'

defineProps({
  chat: { type: Object, required: true },
})

function formatTime(ts?: string) {
  if (!ts) return ''
  try {
    return format(new Date(ts), 'HH:mm')
  } catch {
    return ''
  }
}
</script>
