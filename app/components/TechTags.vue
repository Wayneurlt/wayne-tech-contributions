<script setup lang="ts">
import type { TechTag } from '~/types/content'
defineProps<{ tags: TechTag[] }>()
const basisText: Record<TechTag['basis'], string> = {
  'repo-manifest': 'Listed in the repository dependency manifest',
  commit: 'Evidenced by files changed in commits',
  'self-reported': 'Self-reported',
}
</script>

<template>
  <ul class="flex flex-wrap gap-1.5">
    <li v-for="t in tags" :key="t.name" class="chip" :title="basisText[t.basis]">{{ t.name }}</li>
  </ul>
</template>
