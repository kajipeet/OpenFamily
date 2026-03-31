<template>
  <!-- App shell: Telegram-style sidebar + main panel -->
  <div class="flex h-dvh overflow-hidden bg-tg-bg font-sans text-gray-900 fixed inset-0">
    <!-- Sidebar (hidden on mobile, shown from md breakpoint) -->
    <div class="hidden md:flex md:flex-col md:w-72 lg:w-80 flex-shrink-0">
      <AppSidebar />
    </div>
    
    <!-- Mobile sidebar overlay -->
    <Teleport to="body">
      <div 
        v-if="showMobileSidebar" 
        class="fixed inset-0 z-40 md:hidden"
        @click="showMobileSidebar = false"
      >
        <div class="fixed left-0 top-0 bottom-0 w-72 bg-tg-sidebar shadow-lg z-50 md:hidden"
          @click.stop>
          <AppSidebar />
        </div>
        <div class="absolute inset-0 bg-black/30" />
      </div>
    </Teleport>

    <main class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <slot />
    </main>

    <!-- Global video call overlay -->
    <VideoCallOverlay v-if="callStore.active" />
  </div>
</template>

<script setup lang="ts">
import { useCallStore } from '~/stores/call'
const callStore = useCallStore()
const showMobileSidebar = ref(false)

// Provide context for mobile sidebar toggle
provide('toggleMobileSidebar', () => {
  showMobileSidebar.value = !showMobileSidebar.value
})
</script>

<script setup lang="ts">
import { useCallStore } from '~/stores/call'
const callStore = useCallStore()
</script>
