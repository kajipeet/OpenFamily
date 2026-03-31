<template>
  <!-- Chat list (home screen) — shows when no chat is selected -->
  <div class="h-full flex items-center justify-center text-gray-400">
    <div class="text-center">
      <div class="text-6xl mb-4">💬</div>
      <p class="font-medium text-gray-500">Select a chat to start messaging</p>
      <p class="text-sm mt-1">or search for someone by their @tag</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default', middleware: 'auth' })
</script>
