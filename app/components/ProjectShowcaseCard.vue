<script setup lang="ts">
import type { Project } from '~/types/content'
const props = defineProps<{ project: Project }>()

const shortName = computed(() => props.project.name.replace(/ \(.*\)/, ''))
const host = computed(() => (props.project.liveUrl ? new URL(props.project.liveUrl).host : 'Not publicly deployed'))
const initials = computed(() =>
  shortName.value
    .split(/\s+/)
    .filter((w) => /^[A-Za-z0-9]/.test(w))
    .map((w) => w[0]!.toUpperCase())
    .slice(0, 2)
    .join(''),
)
const role = computed(() => ({ lead: 'Main developer', primary: 'Main developer', shared: 'Co-developer', minor: 'Contributor', unassessed: '' })[props.project.attribution])

// The screenshot is optional. If the file is missing, a placeholder is shown instead.
const src = computed(() => `/screens/${props.project.id}.png`)
const failed = ref(false)
const img = ref<HTMLImageElement | null>(null)
onMounted(() => {
  // An error can fire before hydration, so check once the page is interactive.
  if (img.value && img.value.complete && img.value.naturalWidth === 0) failed.value = true
})
</script>

<template>
  <article class="card card-hover group flex h-full flex-col overflow-hidden !p-0">
    <!-- Browser-style preview -->
    <div class="relative">
      <div class="flex items-center gap-2 border-b border-line bg-surface px-3 py-2" aria-hidden="true">
        <span class="flex gap-1"><span class="h-2 w-2 rounded-full bg-line" /><span class="h-2 w-2 rounded-full bg-line" /><span class="h-2 w-2 rounded-full bg-line" /></span>
        <span class="min-w-0 flex-1 truncate rounded-full bg-bg/60 px-3 py-0.5 text-[11px] text-muted">{{ host }}</span>
      </div>

      <div class="relative aspect-[16/10] overflow-hidden bg-surface">
        <img
          v-if="!failed"
          ref="img"
          :src="src"
          :alt="`Preview of ${shortName}`"
          loading="lazy"
          class="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]"
          @error="failed = true"
        />
        <div
          v-else
          class="absolute inset-0 grid place-items-center"
          style="background: radial-gradient(120% 90% at 20% 0%, color-mix(in srgb, var(--color-accent) 24%, var(--color-surface)), var(--color-surface))"
          aria-hidden="true"
        >
          <span class="text-6xl font-semibold tracking-tight text-accent/35">{{ initials }}</span>
        </div>

        <a
          v-if="project.liveUrl"
          :href="project.liveUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="absolute inset-0 flex items-end justify-end bg-gradient-to-t from-bg/70 via-transparent to-transparent p-3 opacity-0 transition-opacity duration-200 focus-visible:opacity-100 group-hover:opacity-100"
          :aria-label="`Open ${shortName} live site (opens in a new tab)`"
        >
          <span class="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-medium text-[#04121a]">
            Visit site <Icon name="lucide:arrow-up-right" class="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        </a>
      </div>
    </div>

    <!-- Caption -->
    <div class="flex flex-1 flex-col p-4">
      <p class="font-medium leading-snug">{{ shortName }}</p>
      <p class="mt-0.5 text-xs text-muted">{{ categoryLabel(project.category) }}</p>

      <div class="mt-auto flex flex-wrap items-center justify-between gap-2 pt-4">
        <span class="flex flex-wrap items-center gap-1.5">
          <span v-if="role" class="chip">{{ role }}</span>
          <span v-if="project.status === 'proof-of-concept'" class="chip">Proof of concept</span>
        </span>
        <span class="flex items-center gap-2">
          <a
            v-if="project.liveUrl"
            :href="project.liveUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-accent !gap-1 !px-3 !py-1 text-xs"
          >
            Visit <Icon name="lucide:arrow-up-right" class="h-3.5 w-3.5" aria-hidden="true" /><span class="sr-only">{{ shortName }} (opens in a new tab)</span>
          </a>
          <NuxtLink :to="`/projects/${project.id}`" class="btn !px-3 !py-1 text-xs">Details</NuxtLink>
        </span>
      </div>
    </div>
  </article>
</template>
