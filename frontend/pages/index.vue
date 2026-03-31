<template>
  <div layout="public">

    <!-- Navigation -->
    <nav class="border-b border-gray-100 sticky top-0 bg-white z-10">
      <div class="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
        <a href="/" class="flex items-center gap-2 font-semibold text-green-700 text-lg">
          OpenFamily
        </a>
        <div class="hidden md:flex items-center gap-6 text-sm text-gray-600">
          <a href="#features" class="hover:text-green-700">Features</a>
          <a href="#security" class="hover:text-green-700">Security</a>
          <a href="#about" class="hover:text-green-700">About</a>
          <NuxtLink
            to="/garden"
            class="px-4 py-1.5 bg-green-700 text-white rounded-full text-sm hover:bg-green-800 transition"
          >
            Sign In
          </NuxtLink>
        </div>
        <NuxtLink to="/garden" class="md:hidden text-xs text-green-700 font-medium border border-green-700 px-3 py-1 rounded-full">
          Sign In
        </NuxtLink>
      </div>
    </nav>

    <!-- Hero -->
    <header class="bg-gradient-to-br from-green-50 to-emerald-100 py-16 px-4 text-center">
      <h1 class="text-4xl md:text-5xl font-bold text-green-900 mb-4">
        Private Family Chat And Calls
      </h1>
      <p class="text-lg text-green-700 max-w-2xl mx-auto">
        Self-hosted messaging for family communication with chat, file sharing,
        voice notes, stickers, and audio or video calls.
      </p>
    </header>

    <section class="max-w-4xl mx-auto px-4 -mt-6">
      <div class="bg-white rounded-2xl shadow-md p-6 grid md:grid-cols-3 gap-4 text-sm text-gray-600">
        <div>
          <p class="font-semibold text-gray-900 mb-1">Admin-managed accounts</p>
          <p>Users are created and removed only by an administrator.</p>
        </div>
        <div>
          <p class="font-semibold text-gray-900 mb-1">Encrypted storage</p>
          <p>MongoDB stores encrypted user and message payload fields.</p>
        </div>
        <div>
          <p class="font-semibold text-gray-900 mb-1">Ephemeral messages</p>
          <p>Read messages start a visible 3-minute deletion timer and are removed server-side.</p>
        </div>
      </div>
    </section>

    <section id="features" class="max-w-6xl mx-auto px-4 py-14">
      <h2 class="text-2xl font-bold text-gray-800 mb-8">Features</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div
          v-for="feature in features"
          :key="feature.name"
          class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer"
        >
          <div class="text-3xl mb-2">{{ feature.emoji }}</div>
          <h3 class="font-semibold text-gray-800 text-sm">{{ feature.name }}</h3>
          <p class="text-xs text-gray-500 mt-1">{{ feature.description }}</p>
        </div>
      </div>
    </section>

    <section id="security" class="bg-green-50 py-14">
      <div class="max-w-6xl mx-auto px-4">
        <h2 class="text-2xl font-bold text-gray-800 mb-8">Security And Delivery Model</h2>
        <div class="grid md:grid-cols-3 gap-6">
          <article
            v-for="card in securityCards"
            :key="card.name"
            class="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100"
          >
            <div class="h-40 flex items-center justify-center text-7xl bg-gradient-to-br from-green-50 to-emerald-100">
              {{ card.emoji }}
            </div>
            <div class="p-4">
              <h3 class="font-bold text-gray-800">{{ card.name }}</h3>
              <p class="text-sm text-gray-600">{{ card.description }}</p>
              <div class="mt-3 flex flex-wrap gap-1">
                <span
                  v-for="tag in card.tags"
                  :key="tag"
                  class="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full"
                >{{ tag }}</span>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- About -->
    <section id="about" class="max-w-4xl mx-auto px-4 py-14">
      <h2 class="text-2xl font-bold text-gray-800 mb-4">About OpenFamily</h2>
      <div class="prose prose-green max-w-none text-gray-600 text-sm leading-relaxed space-y-3">
        <p>
          OpenFamily is a self-hosted communication platform for small trusted groups.
          It is designed for direct administration, private infrastructure, and clear ownership
          of data and deployment.
        </p>
        <p>
          The stack uses a Go backend with Gin, a Nuxt frontend styled with Tailwind,
          JWT authentication, WebSocket signalling, MongoDB for storage, and Docker Compose
          for deployment on a self-hosted server.
        </p>
        <p>
          The application is intended for legitimate private communication. Access is explicit,
          administration is centralized, and the public landing page accurately describes the service.
        </p>
      </div>
    </section>

    <footer class="border-t border-gray-100 py-8 text-center text-xs text-gray-400">
      © {{ new Date().getFullYear() }} OpenFamily ·
      <a href="#" class="hover:underline">Privacy</a> ·
      <a href="#" class="hover:underline">Terms</a>
    </footer>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'public' })

useSeoMeta({
  title: 'OpenFamily - Private Family Chat And Calls',
  description:
    'Self-hosted private family messenger with ephemeral messages, file sharing, stickers, and audio or video calls.',
  ogTitle: 'OpenFamily - Private Family Chat And Calls',
  ogDescription:
    'Self-hosted private family messenger built with Go, Nuxt, Tailwind, JWT, WebSocket signalling, and MongoDB.',
  ogType: 'website',
  robots: 'index, follow',
})

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'OpenFamily',
        description: 'Self-hosted private family chat and calling platform.',
        about: { '@type': 'SoftwareApplication', name: 'Family messenger' },
        inLanguage: 'en',
      }),
    },
  ],
})

const features = [
  {
    name: 'One-to-one chat',
    emoji: '💬',
    description: 'Telegram-like chat layout with per-user conversations and unread counters.',
  },
  {
    name: 'File and media sharing',
    emoji: '📎',
    description: 'Send files, images, voice notes, audio, and video attachments.',
  },
  {
    name: 'Audio and video calls',
    emoji: '📹',
    description: 'WebRTC-based direct calls with TURN support for self-hosted deployments.',
  },
  {
    name: 'Admin user lifecycle',
    emoji: '🛡️',
    description: 'Only administrators can create or remove accounts.',
  },
  {
    name: 'Automatic tags',
    emoji: '🏷️',
    description: 'Users are searchable by an automatically assigned unique tag.',
  },
  {
    name: 'Avatars and stickers',
    emoji: '🖼️',
    description: 'Upload profile avatars and create sticker packs for family chats.',
  },
]

const securityCards = [
  {
    name: 'Encrypted fields in MongoDB',
    emoji: '🔐',
    description:
      'Sensitive user and message content fields are encrypted before persistence using AES-256-GCM.',
    tags: ['AES-256-GCM', 'MongoDB', 'At-rest protection'],
  },
  {
    name: 'Ephemeral read lifecycle',
    emoji: '⏱️',
    description:
      'Unread messages stay on the server until the recipient reads them, then enter a visible three-minute deletion window.',
    tags: ['Read receipts', 'Visible timer', 'Server cleanup'],
  },
  {
    name: 'Self-host deployment',
    emoji: '🐳',
    description:
      'Docker Compose includes frontend, backend, MongoDB, Nginx, and coturn for a complete family-hosted stack.',
    tags: ['Docker Compose', 'Nginx', 'coturn'],
  },
]
</script>
