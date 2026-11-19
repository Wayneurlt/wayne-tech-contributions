<script setup lang="ts">
import { highlights } from '~~/content/highlights'
import { isMyBot } from '~~/content/evidence/chatbot-ownership'
useHead({ title: 'Overview · Technical Contributions' })

const { shownProjects, shownBots } = usePresentation()
const o = computed(() => overview(shownProjects.value))
const activity = monthlyActivity()
const shownIds = computed(() => new Set(shownProjects.value.map((p) => p.id)))

const top = computed(() =>
  highlights.top
    .filter((t) => shownIds.value.has(t.projectId))
    .map((t) => {
      const p = getProject(t.projectId)!
      return { ...t, p, s: statsForProject(p), proof: evidenceForIds(t.proof) }
    }),
)

const months = computed(() => monthRange(shownProjects.value))
const period = computed(() => (months.value.length ? `${formatMonth(months.value[0]!)} to ${formatMonth(months.value.at(-1)!)}` : ''))

const rings = computed(() => {
  const counts = new Map<string, number>()
  for (const p of shownProjects.value) for (const t of new Set(p.technologies.map((x) => x.name))) counts.set(t, (counts.get(t) ?? 0) + 1)
  return [...counts.entries()]
    .filter(([n]) => !n.includes('SDK') && !n.includes('driver'))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
})

const whatsapp = computed(() => shownBots.value.filter(isMyBot))
const sectorCards = computed(() =>
  categories
    .map((c) => ({ ...c, items: shownProjects.value.filter((p) => p.category === c.id) }))
    .filter((c) => c.items.length || (c.id === 'conversational-ai' && whatsapp.value.length)),
)
const pad = (n: number) => String(n).padStart(3, '0')
</script>

<template>
  <div class="container-page space-y-4 py-6 lg:py-2">
    <header class="px-1">
      <h1 class="text-2xl font-semibold tracking-tight sm:text-3xl">Overview</h1>
      <p class="mt-1 text-sm text-muted">{{ period }} · {{ o.projectCount }} projects across {{ o.sectors }} sectors</p>
    </header>

    <!-- Numbers -->
    <section aria-label="Scope in numbers" class="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      <StatTile compact :value="o.projectCount" label="Projects" :note="o.pendingProjects ? `${o.pendingProjects} pending confirmation` : undefined" />
      <StatTile compact :value="o.sectors" label="Sectors" />
      <StatTile compact :value="o.repos" label="Repositories" note="Shared with others" />
      <StatTile compact :value="o.evidenceCount" label="Linked commits" note="Each verified" />
      <StatTile compact :value="whatsapp.length" label="WhatsApp chatbots" note="With Kingsley, self-reported" />
      <StatTile compact :value="months.length" label="Months active" :note="period" />
    </section>

    <!-- Main columns -->
    <div class="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
      <section class="card p-5 sm:p-6" aria-labelledby="delivered">
        <div class="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="delivered" class="text-xl font-semibold tracking-tight">What I delivered</h2>
          <NuxtLink to="/projects" class="link text-sm">All projects →</NuxtLink>
        </div>
        <p class="mt-1 text-sm text-muted">Shared projects say so, and the share of commits is shown for each.</p>
        <ol class="mt-4 space-y-3">
          <li v-for="(t, i) in top" :key="t.projectId" class="rounded-xl border border-line bg-surface p-4">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="flex items-baseline gap-2">
                  <span class="num">{{ pad(i + 1) }}</span>
                  <NuxtLink :to="`/projects/${t.projectId}`" class="font-medium hover:text-accent">{{ t.p.name }}</NuxtLink>
                </p>
                <p class="mt-1 text-sm text-muted">{{ t.line }}</p>
              </div>
              <span class="chip shrink-0">{{ attributionLabels[t.p.attribution] }}</span>
            </div>
            <div class="mt-3 grid gap-x-6 gap-y-2 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
              <AttributionMeter :mine="t.s.mine" :total="t.s.total" />
              <p class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                <span>Evidence:</span>
                <template v-for="e in t.proof" :key="e.id">
                  <a v-if="e.url" :href="e.url" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 font-mono text-fg hover:text-accent" :title="e.title">
                    {{ e.id.split('-').pop() }}<Icon name="lucide:external-link" class="h-3 w-3" aria-hidden="true" />
                  </a>
                  <span v-else class="font-mono">{{ e.id.split('-').pop() }}</span>
                </template>
              </p>
            </div>
          </li>
        </ol>
      </section>

      <div class="space-y-4">
        <section class="card p-5" aria-labelledby="activity">
          <h2 id="activity" class="text-lg font-semibold tracking-tight">Work over time</h2>
          <p class="text-xs text-muted">{{ period }}</p>
          <div class="mt-3"><ActivityChart :data="activity" label="My commits per month across documented repositories" /></div>
          <NuxtLink to="/timeline" class="link mt-2 inline-block text-sm">Open the timeline →</NuxtLink>
        </section>

        <NuxtLink v-if="whatsapp.length" to="/chatbots" class="card card-hover block p-5">
          <p class="num">Chatbots</p>
          <p class="mt-1 text-lg font-medium">{{ whatsapp.length }} WhatsApp chatbots</p>
          <p class="mt-1 text-sm text-muted">
            Virtual-hospital and consumer bots on SendPulse, Kenyan numbers, built with Kingsley (self-reported). Clients include
            Somerset, HF Group and ICEA LION.
          </p>
          <p class="mt-3 text-xs text-accent">See the chatbot list →</p>
        </NuxtLink>

        <NuxtLink to="/research" class="card card-hover block p-5">
          <p class="num">Research</p>
          <p class="mt-1 text-lg font-medium">{{ research[0]?.title }}</p>
          <p class="mt-1 text-sm text-muted">{{ research[0]?.purpose }}</p>
          <p class="mt-3 text-xs text-accent">Read about the proof of concept →</p>
        </NuxtLink>
      </div>
    </div>

    <!-- Sectors and technology -->
    <div class="grid gap-4 xl:grid-cols-2">
      <section class="card p-5 sm:p-6" aria-labelledby="sectors">
        <h2 id="sectors" class="text-xl font-semibold tracking-tight">Sectors covered</h2>
        <ul class="mt-4 space-y-2">
          <li v-for="c in sectorCards" :key="c.id">
            <NuxtLink :to="c.id === 'conversational-ai' ? '/chatbots' : { path: '/projects', query: { category: c.id } }" class="card card-hover block !rounded-xl p-4">
              <div class="flex flex-wrap items-baseline justify-between gap-2">
                <p class="font-medium">{{ c.label }}</p>
                <p class="text-xs text-accent">
                  <template v-if="c.id === 'conversational-ai'">{{ whatsapp.length }} chatbots</template>
                  <template v-else>{{ c.items.length }} project{{ c.items.length === 1 ? '' : 's' }}</template>
                </p>
              </div>
              <p v-if="c.id !== 'conversational-ai'" class="mt-1 text-xs text-muted">{{ c.items.map((p) => p.name.replace(/ \(.*\)/, '')).join(', ') }}</p>
              <p v-else class="mt-1 text-xs text-muted">{{ c.blurb }}</p>
            </NuxtLink>
          </li>
        </ul>
      </section>

      <section class="card p-5 sm:p-6" aria-labelledby="stack">
        <div class="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="stack" class="text-xl font-semibold tracking-tight">Technology ecosystem</h2>
          <NuxtLink to="/capabilities" class="link text-sm">Capabilities →</NuxtLink>
        </div>
        <p class="mt-1 text-sm text-muted">Projects with each technology in their repositories. Not a proficiency score.</p>
        <ul class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <li v-for="[name, n] in rings" :key="name"><TechRing :name="name" :count="n" :total="o.projectCount" /></li>
        </ul>
      </section>
    </div>

    <!-- Timeline -->
    <section class="card p-5 sm:p-6" aria-labelledby="when">
      <div class="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="when" class="text-xl font-semibold tracking-tight">Months worked, by project</h2>
        <NuxtLink to="/timeline" class="no-print link text-sm">Filter by period →</NuxtLink>
      </div>
      <div class="mt-4"><WorkTimeline :projects="shownProjects" compact /></div>
      <p class="mt-2 text-xs text-muted">Commit dates from git. Gaps do not mean no work.</p>
    </section>

    <!-- Evidence classification -->
    <section class="card flex flex-wrap items-center gap-x-6 gap-y-3 p-5" aria-labelledby="trust">
      <div class="min-w-0 flex-1 basis-64">
        <h2 id="trust" class="text-base font-semibold">How the evidence is classified</h2>
        <p class="mt-1 text-xs text-muted">Commit links open private repositories and need access. Commit counts show activity, not value.</p>
      </div>
      <ul class="flex flex-wrap items-center gap-2">
        <li v-for="(v, k) in verificationLabels" :key="k"><VerificationBadge :status="k" /></li>
      </ul>
      <NuxtLink to="/evidence" class="link text-sm">Browse the evidence →</NuxtLink>
    </section>
  </div>
</template>
