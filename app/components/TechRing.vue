<script setup lang="ts">
const props = defineProps<{ name: string; count: number; total: number }>()
const R = 34
const C = 2 * Math.PI * R
const dash = computed(() => `${(props.count / props.total) * C} ${C}`)
</script>

<template>
  <div class="card flex flex-col items-center p-4 text-center">
    <svg viewBox="0 0 80 80" class="h-20 w-20" role="img" :aria-label="`${name}: present in ${count} of ${total} projects`">
      <circle cx="40" cy="40" :r="R" fill="none" stroke="var(--color-line)" stroke-width="3" />
      <circle
        cx="40" cy="40" :r="R" fill="none" stroke="var(--color-accent)" stroke-width="3" stroke-linecap="round"
        :stroke-dasharray="dash" transform="rotate(-90 40 40)"
      />
      <text x="40" y="45" text-anchor="middle" font-size="16" font-weight="600" fill="var(--color-fg)">{{ count }}</text>
    </svg>
    <p class="mt-2 text-sm font-medium">{{ name }}</p>
    <p class="text-xs text-muted">of {{ total }} projects</p>
  </div>
</template>
