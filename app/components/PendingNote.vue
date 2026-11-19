<script setup lang="ts">
const { hide } = usePresentation()
</script>

<template>
  <div v-if="!hide" class="flex gap-3 rounded-lg border border-dashed border-warn/50 bg-warn/5 p-3 text-sm">
    <Icon name="lucide:circle-help" class="mt-0.5 h-4 w-4 shrink-0 text-warn" aria-hidden="true" />
    <p class="text-muted">
      <span class="font-medium text-fg">Pending: </span>
      <slot />
    </p>
  </div>
</template>
