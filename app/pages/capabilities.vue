<script setup lang="ts">
useHead({ title: 'Technical capabilities · Technical Contributions' })
const { hide, shownProjects } = usePresentation()
const shownIds = computed(() => new Set(shownProjects.value.map((p) => p.id)))
const groups = computed(() =>
  capabilities
    .map((c) => ({ ...c, projectIds: c.projectIds.filter((id) => shownIds.value.has(id)) }))
    .filter((c) => !(hide.value && !c.projectIds.length)),
)
</script>

<template>
  <div class="container-page py-12">
    <p class="eyebrow">Page 4</p>
    <h1 class="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Technical capabilities</h1>
    <p class="lead mt-3 max-w-3xl">
      Each capability links to the projects where it is evidenced. Groups without evidence are labelled and not padded.
    </p>

    <ul class="mt-10 space-y-4">
      <li v-for="c in groups" :key="c.id" class="card p-5">
        <div class="flex flex-wrap items-start justify-between gap-2">
          <h2 class="text-lg font-semibold tracking-tight">{{ c.group }}</h2>
          <span class="text-xs text-muted">{{ c.projectIds.length }} project{{ c.projectIds.length === 1 ? '' : 's' }}</span>
        </div>
        <p class="mt-2 max-w-3xl text-sm text-muted">{{ c.summary }}</p>

        <div v-if="c.projectIds.length" class="mt-4 flex flex-wrap gap-2">
          <NuxtLink v-for="id in c.projectIds" :key="id" :to="`/projects/${id}`" class="chip hover:border-accent hover:text-fg">
            {{ getProject(id)?.name }}
          </NuxtLink>
        </div>
        <ul v-if="c.technologies.length" class="mt-3 flex flex-wrap gap-1.5">
          <li v-for="t in c.technologies" :key="t" class="chip">{{ t }}</li>
        </ul>
        <div v-if="c.pendingNote" class="mt-4"><PendingNote>{{ c.pendingNote }}</PendingNote></div>
      </li>
    </ul>

    <section class="mt-14" aria-labelledby="stated">
      <h2 id="stated" class="h-section !text-xl">Stated stack (self-reported)</h2>
      <p class="mt-2 max-w-3xl text-sm text-muted">
        The wider skills list supplied for this report. It is not claimed against any project unless a project page shows it.
      </p>
      <div class="mt-4 grid gap-4 md:grid-cols-3">
        <div v-for="(items, group) in { Languages: profile.statedStack.languages, 'Frameworks and technologies': profile.statedStack.frameworks, 'AI and automation': profile.statedStack.ai }" :key="group" class="card p-4">
          <p class="text-sm font-medium">{{ group }}</p>
          <ul class="mt-2 flex flex-wrap gap-1.5"><li v-for="i in items" :key="i" class="chip">{{ i }}</li></ul>
        </div>
      </div>
    </section>
  </div>
</template>
