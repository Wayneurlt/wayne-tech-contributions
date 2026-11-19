<script setup lang="ts">
import type { Project } from '~/types/content'
const props = defineProps<{ project: Project }>()
const stats = computed(() => statsForProject(props.project))
const topTech = computed(() => props.project.technologies.slice(0, 5))
</script>

<template>
  <article class="card card-hover group relative flex h-full flex-col p-5">
    <div class="flex items-start justify-between gap-3">
      <p class="eyebrow">{{ categoryLabel(project.category) }}</p>
      <VerificationBadge :status="project.verification" />
    </div>
    <h3 class="mt-3 text-lg font-semibold tracking-tight">
      <NuxtLink :to="`/projects/${project.id}`" class="after:absolute after:inset-0 after:content-['']">
        {{ project.name }}
      </NuxtLink>
    </h3>
    <p class="mt-2 line-clamp-3 text-sm text-muted">{{ project.summary }}</p>

    <dl class="mt-4 grid grid-cols-2 gap-3 text-xs">
      <div>
        <dt class="text-muted">Attribution</dt>
        <dd class="mt-0.5 text-fg">{{ attributionLabels[project.attribution] }}</dd>
      </div>
      <div>
        <dt class="text-muted">Period (my commits)</dt>
        <dd class="mt-0.5 text-fg">
          <template v-if="stats.first">{{ formatMonth(stats.first) }} – {{ formatMonth(stats.last!) }}</template>
          <template v-else>—</template>
        </dd>
      </div>
    </dl>

    <ul class="mt-4 flex flex-wrap gap-1.5">
      <li v-for="t in topTech" :key="t.name" class="chip">{{ t.name }}</li>
      <li v-if="project.technologies.length > topTech.length" class="chip">+{{ project.technologies.length - topTech.length }}</li>
    </ul>

    <div class="mt-auto pt-5">
      <AttributionMeter :mine="stats.mine" :total="stats.total" />
      <p class="mt-3 flex items-center gap-1 text-xs text-accent opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
        View contribution detail <Icon name="lucide:arrow-right" class="h-3 w-3" aria-hidden="true" />
      </p>
    </div>
  </article>
</template>
