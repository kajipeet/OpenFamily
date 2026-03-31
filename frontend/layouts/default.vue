<template>
  <!-- App shell: Telegram-style sidebar + main panel -->
  <div class="flex h-screen overflow-hidden bg-tg-bg font-sans text-gray-900">
    <AppSidebar />
    <main class="flex-1 flex flex-col min-w-0">
      <slot />
    </main>

    <!-- Global video call overlay -->
    <VideoCallOverlay v-if="callStore.active" />
  </div>
</template>

<script setup lang="ts">
import { useCallStore } from '~/stores/call'
const callStore = useCallStore()
</script>
