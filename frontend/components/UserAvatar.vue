<template>
  <div
    :class="[
      'rounded-full overflow-hidden flex items-center justify-center bg-tg-header text-white shrink-0',
      sizeClass,
    ]"
  >
    <img
      v-if="user?.avatar"
      :src="user.avatar"
      :alt="user?.display_name || user?.username || 'avatar'"
      class="w-full h-full object-cover"
    />
    <span v-else class="font-medium uppercase">{{ initials }}</span>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  user: { type: Object, default: null },
  size: { type: String, default: 'md' },
})

const sizeClass = computed(() => {
  if (props.size === 'sm') return 'w-10 h-10 text-sm'
  if (props.size === 'lg') return 'w-16 h-16 text-xl'
  return 'w-12 h-12 text-base'
})

const initials = computed(() => {
  const text = props.user?.display_name || props.user?.username || '?'
  return String(text)
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part: string) => part[0])
    .join('') || '?'
})
</script>
