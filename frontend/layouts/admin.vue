<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white font-sans">
    <header class="border-b border-white/10 bg-black/20 backdrop-blur-sm">
      <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <div class="min-w-0">
          <h1 class="text-sm sm:text-base font-semibold truncate">OpenFamily Admin</h1>
          <p class="text-xs text-white/60">Management panel</p>
        </div>

        <div class="flex items-center gap-2 flex-shrink-0">
          <NuxtLink
            to="/app"
            class="px-3 py-1.5 rounded-lg text-xs sm:text-sm bg-white/10 hover:bg-white/20 transition"
          >
            Back to chats
          </NuxtLink>
          <button
            class="px-3 py-1.5 rounded-lg text-xs sm:text-sm bg-red-600/80 hover:bg-red-500 transition"
            @click="logout"
          >
            Logout
          </button>
        </div>
      </div>
    </header>

    <main class="max-w-6xl mx-auto px-4 py-5 sm:py-8">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const { logout } = useAuth()
</script>
