<script setup lang="ts">
import { glance } from '~~/content/glance'
import { myBotIds } from '~~/content/evidence/chatbot-ownership'
useHead({ title: 'At a glance · Technical Contributions' })

const { shownProjects, hide } = usePresentation()
// Only bots the author has confirmed as their own work are ever counted here.
const confirmedBots = computed(() => bots.filter((b) => myBotIds.includes(b.id)))
const o = computed(() => overview(shownProjects.value))
const shownIds = computed(() => new Set(shownProjects.value.map((p) => p.id)))

const top = computed(() =>
  glance.top
    .filter((t) => shownIds.value.has(t.projectId))
    .map((t) => {
      const p = getProject(t.projectId)!
      return { ...t, p, s: statsForProject(p), proof: evidenceForIds(t.proof) }
    }),
)

const i3 = computed(() => statsForProject(getProject('i3-zuri-health')!))
const daysBetween = (a: string | null, b: string | null) =>
  a && b ? Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000) + 1 : 0
const areas = computed(() => {
  const m: Record<string, number> = {}
  for (const p of shownProjects.value) for (const c of p.contributions) m[c.area] = (m[c.area] ?? 0) + 1
  return Object.entries(m).sort((a, b) => b[1] - a[1])
})
const pad = (n: number) => String(n).padStart(2, '0')
</script>

<template>
  <div class="container-page space-y-6 py-6 lg:py-2">
    <header class="card p-6 sm:p-8">
      <p class="num">AT A GLANCE</p>
      <h1 class="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{{ profile.name }}</h1>
      <p class="mt-1 text-muted">{{ profile.title }} · {{ profile.organisation }}</p>
      <p class="lead mt-4 max-w-3xl">{{ glance.headline }}</p>
      <div class="no-print mt-5"><ArrowButton to="/report" accent>PDF report</ArrowButton></div>
    </header>

    <section aria-label="Scope in numbers" class="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatTile :value="o.projectCount" label="Projects" :note="hide ? undefined : `${o.pendingProjects} pending confirmation`" />
      <StatTile :value="o.sectors" label="Sectors and categories" />
      <StatTile :value="o.repos" label="Repositories" note="Shared with other developers" />
      <StatTile :value="o.evidenceCount" label="Linked commits" note="Each one verified" />
    </section>

    <section class="card p-6 sm:p-8" aria-labelledby="top">
      <p class="num">TOP CONTRIBUTIONS</p>
      <h2 id="top" class="h-section mt-2">What I delivered</h2>
      <ol class="mt-6 space-y-4">
        <li v-for="(t, i) in top" :key="t.projectId" class="card !rounded-xl p-4 sm:p-5">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="flex min-w-0 items-start gap-3">
              <span class="num mt-1">{{ pad(i + 1) }}</span>
              <div class="min-w-0">
                <NuxtLink :to="`/projects/${t.projectId}`" class="font-medium hover:text-accent">{{ t.p.name }}</NuxtLink>
                <p class="mt-1 max-w-2xl text-sm text-muted">{{ t.line }}</p>
              </div>
            </div>
            <span class="chip shrink-0">{{ attributionLabels[t.p.attribution] }}</span>
          </div>
          <div class="mt-4"><AttributionMeter :mine="t.s.mine" :total="t.s.total" /></div>
          <p class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
            <span>Evidence:</span>
            <template v-for="e in t.proof" :key="e.id">
              <a v-if="e.url" :href="e.url" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 font-mono text-fg hover:text-accent" :title="e.title">
                {{ e.id.split('-').pop() }}<Icon name="lucide:external-link" class="h-3 w-3" aria-hidden="true" />
              </a>
              <span v-else class="font-mono">{{ e.id.split('-').pop() }}</span>
            </template>
          </p>
        </li>
      </ol>
    </section>

    <section class="card p-6 sm:p-8" aria-labelledby="when">
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p class="num">WHEN</p>
          <h2 id="when" class="h-section mt-2">Months worked, by project</h2>
        </div>
        <NuxtLink to="/timeline" class="no-print link text-sm">Open the interactive timeline →</NuxtLink>
      </div>
      <div class="mt-5"><WorkTimeline :projects="shownProjects" compact /></div>
      <p class="mt-3 text-xs text-muted">Commit dates from git. Gaps do not mean no work.</p>
    </section>

    <section class="grid gap-4 md:grid-cols-2" aria-label="Standout points">
      <div v-if="shownIds.has('i3-zuri-health')" class="card p-5">
        <p class="num">PACE</p>
        <p class="mt-2 text-lg font-medium">i3 report platform</p>
        <p class="mt-1 text-sm text-muted">
          First to last commit in {{ daysBetween(i3.first, i3.last) }} days ({{ formatDate(i3.first) }} to {{ formatDate(i3.last) }}),
          {{ i3.mine }} of {{ i3.total }} commits mine.
        </p>
      </div>
      <div class="card p-5">
        <p class="num">BREADTH</p>
        <p class="mt-2 text-lg font-medium">{{ o.projectCount }} projects, {{ o.sectors }} sectors</p>
        <p class="mt-1 text-sm text-muted">
          Work across {{ areas.slice(0, 5).map((a) => areaLabels[a[0]]!.toLowerCase()).join(', ') }}.
        </p>
      </div>
      <div v-if="confirmedBots.length" class="card p-5 md:col-span-2">
        <p class="num">CHATBOTS</p>
        <p class="mt-2 text-lg font-medium">{{ confirmedBots.length }} chatbot{{ confirmedBots.length === 1 ? '' : 's' }}</p>
        <p class="mt-1 text-sm text-muted">Bots confirmed as my work. See the Chatbots page for the part I handled on each.</p>
      </div>
    </section>

    <p class="px-1 text-xs text-muted">
      Shared projects say so. Commit shares show activity, not value. Every commit link opens the repository on GitHub and
      needs repository access.
    </p>
  </div>
</template>
