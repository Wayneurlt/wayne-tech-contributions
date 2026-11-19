<script setup lang="ts">
defineProps<{ to: string; accent?: boolean }>()
</script>

<template>
  <span class="inline-flex items-center gap-1.5">
    <NuxtLink :to="to" class="btn" :class="{ 'btn-accent': accent }"><slot /></NuxtLink>
    <NuxtLink
      :to="to"
      class="grid h-9 w-9 place-items-center rounded-full border border-line bg-card text-accent transition-colors hover:border-accent"
      aria-hidden="true"
      tabindex="-1"
    >
      <Icon name="lucide:arrow-up-right" class="h-4 w-4" />
    </NuxtLink>
  </span>
</template>
