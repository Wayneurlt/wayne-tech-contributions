<script setup lang="ts">
import { isMyBot } from '~~/content/evidence/chatbot-ownership'
useHead({ title: 'Overview · Technical Contributions' })

const { shownProjects, shownBots } = usePresentation()
const o = computed(() => overview(shownProjects.value))
const activity = monthlyActivity()

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
</script>

<template>
  <div class="container-page space-y-6 py-6 lg:py-2">
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

    <!-- Systems built -->
    <section aria-labelledby="delivered">
      <div class="flex flex-wrap items-baseline justify-between gap-2 px-1">
        <div>
          <h2 id="delivered" class="text-xl font-semibold tracking-tight">What I delivered</h2>
          <p class="mt-1 text-sm text-muted">Systems I built or helped build. Open a preview to visit the live site.</p>
        </div>
        <NuxtLink to="/projects" class="link text-sm">All projects →</NuxtLink>
      </div>
      <ul class="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        <li v-for="p in shownProjects" :key="p.id"><ProjectShowcaseCard :project="p" /></li>
      </ul>
    </section>

    <!-- Activity, chatbots, research -->
    <section class="grid gap-4 lg:grid-cols-3" aria-label="Activity, chatbots and research">
      <section class="card flex flex-col p-5" aria-labelledby="activity">
        <h2 id="activity" class="text-lg font-semibold tracking-tight">Work over time</h2>
        <p class="text-xs text-muted">{{ period }}</p>
        <div class="my-3 flex-1"><ActivityChart :data="activity" label="My commits per month across documented repositories" /></div>
        <NuxtLink to="/timeline" class="link text-sm">Open the timeline →</NuxtLink>
      </section>

      <NuxtLink v-if="whatsapp.length" to="/chatbots" class="card card-hover flex flex-col p-5">
        <p class="num">Chatbots</p>
        <p class="mt-1 text-lg font-medium">{{ whatsapp.length }} WhatsApp chatbots</p>
        <p class="mt-1 text-sm text-muted">
          Virtual-hospital and consumer bots on SendPulse, Kenyan numbers, built with Kingsley (self-reported). Clients include
          Somerset, HF Group and ICEA LION.
        </p>
        <p class="mt-auto pt-3 text-xs text-accent">See the chatbot list →</p>
      </NuxtLink>

      <NuxtLink to="/research" class="card card-hover flex flex-col p-5">
        <p class="num">Research</p>
        <p class="mt-1 text-lg font-medium">{{ research[0]?.title }}</p>
        <p class="mt-1 text-sm text-muted">{{ research[0]?.purpose }}</p>
        <p class="mt-auto pt-3 text-xs text-accent">Read about the proof of concept →</p>
      </NuxtLink>
    </section>

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
