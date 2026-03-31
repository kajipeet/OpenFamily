<template>
  <!-- Chat list (home screen) — shows when no chat is selected -->
  <div class="h-full w-full flex flex-col md:hidden">
    <!-- Mobile header with menu button -->
    <div class="flex items-center justify-between px-4 py-3 bg-tg-sidebar-darker shadow-sm flex-shrink-0">
      <h1 class="text-white font-medium">Chats</h1>
      <button 
        @click="toggleMobileSidebar" 
        class="text-white text-xl p-1 hover:bg-white/10 rounded transition"
      >
        ☰
      </button>
    </div>
    
    <!-- Empty state for mobile -->
    <div class="flex-1 flex items-center justify-center text-gray-400 px-4">
      <div class="text-center">
        <div class="text-5xl mb-4">💬</div>
        <p class="font-medium text-gray-500 text-sm">No chat selected</p>
        <p class="text-xs mt-1">Tap ☰ to browse chats or search</p>
      </div>
    </div>
  </div>

  <!-- Desktop empty state -->
  <div class="hidden md:flex h-full items-center justify-center text-gray-400">
    <div class="text-center">
      <div class="text-6xl mb-4">💬</div>
      <p class="font-medium text-gray-500">Select a chat to start messaging</p>
      <p class="text-sm mt-1">or search for someone by their @tag</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default', middleware: 'auth' })

const toggleMobileSidebar = inject('toggleMobileSidebar', () => {})
</script>
