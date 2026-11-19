<script setup lang="ts">
const props = defineProps<{ mine: number; total: number }>()
const pct = computed(() => (props.total ? Math.round((props.mine / props.total) * 100) : 0))
</script>

<template>
  <div>
    <div class="flex items-baseline justify-between text-xs text-muted">
      <span>My commits in this project's repositories</span>
      <span class="text-fg"><span class="font-semibold text-accent">{{ mine }}</span> of {{ total }} ({{ pct }}%)</span>
    </div>
    <div
      class="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line"
      role="img"
      :aria-label="`${mine} of ${total} commits, ${pct} percent`"
    >
      <div class="h-full rounded-full bg-accent" :style="{ width: pct + '%' }" />
    </div>
  </div>
</template>
