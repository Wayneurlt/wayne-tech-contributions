<script setup lang="ts">
import type { Evidence } from '~/types/content'
defineProps<{ item: Evidence; showProject?: boolean }>()
</script>

<template>
  <li class="flex min-w-0 flex-col gap-1 rounded-lg border border-line bg-surface p-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
    <div class="min-w-0">
      <p class="text-sm text-fg">{{ item.title }}</p>
      <p v-if="item.reference" class="mt-0.5 truncate font-mono text-xs text-muted" :title="item.reference">
        {{ item.reference }}
      </p>
      <p class="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
        <span>{{ formatDate(item.date) }}</span>
        <span v-if="item.repo" class="font-mono">{{ item.repo }}</span>
        <span v-if="item.kind" class="chip">{{ kindLabels[item.kind] }}</span>
        <span v-if="item.area" class="chip">{{ areaLabels[item.area] }}</span>
        <NuxtLink v-if="showProject" :to="`/projects/${item.projectId}`" class="link">{{ getProject(item.projectId)?.name }}</NuxtLink>
      </p>
    </div>
    <div class="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end">
      <VerificationBadge :status="item.status" />
      <a
        v-if="item.url"
        :href="item.url"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-1 text-xs text-fg hover:text-accent"
      >
        <span class="font-mono">{{ item.id.split('-').pop() }}</span>
        <Icon name="lucide:external-link" class="h-3 w-3" aria-hidden="true" />
        <span class="sr-only">Open commit on GitHub (opens in a new tab; requires repository access)</span>
      </a>
      <span v-else class="text-xs text-muted">No public link</span>
    </div>
  </li>
</template>
