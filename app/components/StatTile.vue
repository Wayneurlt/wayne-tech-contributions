<script setup lang="ts">
defineProps<{ value: string | number; label: string; note?: string }>()
</script>

<template>
  <div class="card p-5">
    <p class="text-4xl font-light tracking-tight text-muted">{{ value }}</p>
    <p class="mt-2 text-sm text-fg">{{ label }}</p>
    <p v-if="note" class="mt-1 text-xs text-muted">{{ note }}</p>
  </div>
</template>
