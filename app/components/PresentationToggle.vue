<script setup lang="ts">
const { hide, toggle } = usePresentation()
</script>

<template>
  <button
    type="button"
    role="switch"
    :aria-checked="hide"
    class="flex w-full items-center justify-between gap-3 rounded-xl border border-line bg-surface px-3 py-2 text-left text-xs transition-colors hover:border-accent"
    @click="toggle"
  >
    <span>
      <span class="block text-fg">Presentation mode</span>
      <span class="block text-muted">{{ hide ? 'Pending items hidden' : 'Hide pending items' }}</span>
    </span>
    <span class="relative h-5 w-9 shrink-0 rounded-full transition-colors" :class="hide ? 'bg-accent' : 'bg-line'" aria-hidden="true">
      <span class="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all" :class="hide ? 'left-[1.1rem]' : 'left-0.5'" />
    </span>
  </button>
</template>
