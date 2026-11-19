<script setup lang="ts">
defineProps<{ value: string | number; label: string; note?: string; compact?: boolean }>()
</script>

<template>
  <div class="card" :class="compact ? 'p-4' : 'p-5'">
    <p class="font-light tracking-tight text-muted" :class="compact ? 'text-3xl' : 'text-4xl'">{{ value }}</p>
    <p class="mt-1.5 text-sm text-fg">{{ label }}</p>
    <p v-if="note" class="mt-0.5 text-xs text-muted">{{ note }}</p>
  </div>
</template>
