<script setup lang="ts">
import type { Evidence } from '~/types/content'
const props = defineProps<{ projectId: string }>()
const media = computed<Evidence[]>(() =>
  evidenceForProject(props.projectId).filter((e) => (e.type === 'screenshot' || e.type === 'recording') && e.media),
)
const active = ref<Evidence | null>(null)
</script>

<template>
  <div>
    <PendingNote v-if="!media.length">
      No screenshots or recordings have been supplied for this project. Add them in
      <code class="font-mono text-xs">content/evidence/media.ts</code>, taking care to hide customer or internal-dashboard data.
    </PendingNote>
    <ul v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <li v-for="m in media" :key="m.id">
        <button type="button" class="card card-hover block w-full overflow-hidden text-left" @click="active = m">
          <video v-if="m.type === 'recording'" :src="m.media" class="aspect-video w-full object-cover" muted preload="metadata" />
          <img v-else :src="m.media" :alt="m.title" loading="lazy" class="aspect-video w-full object-cover" />
          <span class="block p-3 text-xs text-muted">{{ m.title }}</span>
        </button>
      </li>
    </ul>

    <div
      v-if="active"
      class="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4"
      role="dialog"
      aria-modal="true"
      :aria-label="active.title"
      @click.self="active = null"
      @keydown.esc="active = null"
    >
      <div class="max-h-full max-w-4xl">
        <video v-if="active.type === 'recording'" :src="active.media" controls class="max-h-[80vh] rounded-lg" />
        <img v-else :src="active.media" :alt="active.title" class="max-h-[80vh] rounded-lg" />
        <div class="mt-3 flex items-center justify-between gap-4 text-sm text-muted">
          <span>{{ active.title }}</span>
          <button type="button" class="btn !py-1" autofocus @click="active = null">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>
