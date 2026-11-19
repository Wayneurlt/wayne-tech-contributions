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
const groupsWithEvidence = capabilities.filter((c) => c.projectIds.length || c.technologies.length)
const pad = (n: number) => String(n).padStart(3, '0')
</script>

<template>
  <div class="container-page space-y-6 py-6 lg:py-2">
    <!-- Activity -->
    <section class="card p-6 sm:p-8" aria-labelledby="hero">
      <p class="num">Overview</p>
      <h1 id="hero" class="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Work over time</h1>
      <p class="mt-1 text-sm text-muted">{{ period }}</p>
      <div class="mt-5"><ActivityChart :data="activity" label="My commits per month across documented repositories" /></div>
      <NuxtLink to="/timeline" class="link mt-4 inline-block text-sm">Open the timeline →</NuxtLink>
    </section>

    <!-- Scope -->
    <section aria-labelledby="scope">
      <h2 id="scope" class="sr-only">Scope at a glance</h2>
      <div class="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatTile :value="o.projectCount" label="Projects documented" :note="o.pendingProjects ? `${o.pendingProjects} pending confirmation` : undefined" />
        <StatTile :value="o.sectors" label="Sectors and categories" />
        <StatTile :value="o.repos" label="Repositories" note="Shared with other developers" />
        <StatTile :value="o.evidenceCount" label="Linked commits" note="Each one verified" />
        <StatTile :value="whatsapp.length" label="WhatsApp chatbots" note="Built with Kingsley, self-reported" />
        <StatTile :value="months.length" label="Months of activity" :note="period" />
      </div>
    </section>

    <!-- What I delivered -->
    <section class="card p-6 sm:p-8" aria-labelledby="delivered">
      <p class="num">Key contributions</p>
      <h2 id="delivered" class="h-section mt-2">What I delivered</h2>
      <p class="mt-2 max-w-3xl text-sm text-muted">Shared projects say so, and the share of commits is shown for each.</p>
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

    <!-- Chatbots and research -->
    <section class="grid gap-4 md:grid-cols-2" aria-label="Chatbots and research">
      <NuxtLink v-if="whatsapp.length" to="/chatbots" class="card card-hover block p-6">
        <p class="num">Chatbots</p>
        <p class="mt-2 text-lg font-medium">{{ whatsapp.length }} WhatsApp chatbots</p>
        <p class="mt-1 text-sm text-muted">
          Virtual-hospital and consumer bots on SendPulse, Kenyan numbers, built with Kingsley (self-reported). Clients include
          Somerset, HF Group and ICEA LION.
        </p>
        <p class="mt-4 text-xs text-accent">See the chatbot list →</p>
      </NuxtLink>
      <NuxtLink to="/research" class="card card-hover block p-6">
        <p class="num">Research</p>
        <p class="mt-2 text-lg font-medium">{{ research[0]?.title }}</p>
        <p class="mt-1 text-sm text-muted">{{ research[0]?.purpose }}</p>
        <p class="mt-4 text-xs text-accent">Read about the proof of concept →</p>
      </NuxtLink>
    </section>

    <!-- Sectors -->
    <section aria-labelledby="sectors">
      <h2 id="sectors" class="h-section mb-4">Sectors covered</h2>
      <ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <li v-for="c in sectorCards" :key="c.id">
          <NuxtLink :to="c.id === 'conversational-ai' ? '/chatbots' : { path: '/projects', query: { category: c.id } }" class="card card-hover block h-full p-5">
            <p class="font-medium">{{ c.label }}</p>
            <p class="mt-1 text-sm text-muted">{{ c.blurb }}</p>
            <p class="mt-3 text-xs text-accent">
              <template v-if="c.id === 'conversational-ai'">{{ whatsapp.length }} WhatsApp chatbots</template>
              <template v-else>{{ c.items.length }} project{{ c.items.length === 1 ? '' : 's' }}: {{ c.items.map((p) => p.name.replace(/ \(.*\)/, '')).join(', ') }}</template>
            </p>
          </NuxtLink>
        </li>
      </ul>
    </section>

    <!-- Timeline -->
    <section class="card p-6 sm:p-8" aria-labelledby="when">
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p class="num">Timeline</p>
          <h2 id="when" class="h-section mt-2">Months worked, by project</h2>
        </div>
        <NuxtLink to="/timeline" class="no-print link text-sm">Filter by period →</NuxtLink>
      </div>
      <div class="mt-5"><WorkTimeline :projects="shownProjects" compact /></div>
      <p class="mt-3 text-xs text-muted">Commit dates from git. Gaps do not mean no work.</p>
    </section>

    <!-- Projects -->
    <section class="card p-6 sm:p-8" aria-labelledby="projects">
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p class="num">Projects</p>
          <h2 id="projects" class="h-section mt-2">Where the work has been</h2>
        </div>
        <NuxtLink to="/projects" class="link text-sm">All projects and filters →</NuxtLink>
      </div>
      <ul class="mt-6 space-y-3">
        <li v-for="(p, i) in shownProjects" :key="p.id">
          <NuxtLink :to="`/projects/${p.id}`" class="card card-hover group grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 !rounded-xl p-4 sm:grid-cols-[3rem_1fr_14rem_auto]">
            <span class="num">{{ pad(i + 1) }}</span>
            <span>
              <span class="block font-medium">{{ p.name }}</span>
              <span class="block text-xs text-muted">{{ categoryLabel(p.category) }}</span>
            </span>
            <span class="hidden flex-wrap gap-1.5 sm:flex">
              <span v-for="t in p.technologies.slice(0, 3)" :key="t.name" class="chip">{{ t.name }}</span>
            </span>
            <span class="grid h-9 w-9 place-items-center rounded-full border border-line text-accent transition-colors group-hover:border-accent">
              <Icon name="lucide:arrow-up-right" class="h-4 w-4" aria-hidden="true" />
            </span>
          </NuxtLink>
        </li>
      </ul>
    </section>

    <!-- Technology and capabilities -->
    <section aria-labelledby="stack">
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p class="num">Technology</p>
          <h2 id="stack" class="h-section mt-2">Technology ecosystem</h2>
        </div>
        <NuxtLink to="/capabilities" class="link text-sm">Capabilities by discipline →</NuxtLink>
      </div>
      <p class="mt-2 max-w-2xl text-sm text-muted">
        Each ring shows how many documented projects have the technology in their repositories. It shows what the projects use,
        not a proficiency score.
      </p>
      <ul class="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <li v-for="[name, n] in rings" :key="name"><TechRing :name="name" :count="n" :total="o.projectCount" /></li>
      </ul>
      <ul class="mt-5 flex flex-wrap gap-2" aria-label="Disciplines">
        <li v-for="c in groupsWithEvidence" :key="c.id" class="tag-pill"><span class="h-1.5 w-1.5 rounded-full bg-accent" />{{ c.group }}</li>
      </ul>
    </section>

    <!-- How the evidence is classified -->
    <section class="card p-6 sm:p-8" aria-labelledby="trust">
      <p class="num">Evidence</p>
      <h2 id="trust" class="h-section mt-2">How to trust these numbers</h2>
      <p class="mt-2 max-w-3xl text-sm text-muted">
        Every claim is classified, and project pages link to the commits behind it. Commit links open private repositories and
        need access. Commit counts show activity, not value.
      </p>
      <dl class="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div v-for="(v, k) in verificationLabels" :key="k" class="rounded-xl border border-line bg-surface p-4">
          <dt><VerificationBadge :status="k" /></dt>
          <dd class="mt-2 text-xs text-muted">{{ v.description }}</dd>
        </div>
      </dl>
      <NuxtLink to="/evidence" class="link mt-5 inline-block text-sm">Browse the evidence →</NuxtLink>
    </section>
  </div>
</template>
