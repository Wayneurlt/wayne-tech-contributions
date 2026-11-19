<script setup lang="ts">
useHead({ title: 'Overview · Technical Contributions' })
const { shownProjects, shownBots } = usePresentation()
const o = computed(() => overview(shownProjects.value))
const activity = monthlyActivity()

const rings = computed(() => {
  const counts = new Map<string, number>()
  for (const p of shownProjects.value) for (const t of new Set(p.technologies.map((x) => x.name))) counts.set(t, (counts.get(t) ?? 0) + 1)
  return [...counts.entries()]
    .filter(([n]) => !n.includes('SDK') && !n.includes('driver'))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
})

const highlights = [
  { to: '/projects/i3-zuri-health', title: 'i3 Biannual Report platform', text: 'Neon Postgres data model by month and country, report calculation, admin entry and export, built between 9 and 16 November 2026.' },
  { to: '/projects/zuri-frontend-poc', title: 'Multi-country Zuri Health front end', text: 'Country-aware Next.js proof of concept with English and French localisation across five markets.' },
  { to: '/projects/play-group-hr', title: 'HR platform features', text: 'Leave and records, push notifications, projects, recognition and contributions to the HR Assistant.' },
  { to: '/projects/byzara', title: 'ByZara ordering and access control', text: 'Order, inventory and user administration, a WhatsApp ordering flow, and role-based permissions.' },
]
const pad = (n: number) => String(n).padStart(3, '0')
</script>

<template>
  <div class="container-page space-y-6 py-6 lg:py-2">
    <!-- Hero bento -->
    <section class="grid gap-4 lg:grid-cols-[1.35fr_1fr]" aria-labelledby="hero">
      <div class="card flex flex-col justify-between p-6 sm:p-8">
        <div>
          <p class="text-sm text-muted">Technical contribution report</p>
          <h1 id="hero" class="mt-3 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            {{ profile.name.split(' ').slice(0, 2).join(' ') }}<br />{{ profile.name.split(' ').slice(2).join(' ') }}
          </h1>
          <ul class="mt-5 flex flex-wrap gap-2">
            <li class="tag-pill"><span class="h-1.5 w-1.5 rounded-full bg-accent" />{{ profile.title }}</li>
            <li class="tag-pill"><span class="h-1.5 w-1.5 rounded-full bg-accent" />{{ profile.organisation }}</li>
          </ul>
          <p class="lead mt-5 max-w-xl text-sm sm:text-base">{{ profile.intro }}</p>
        </div>
        <div class="mt-7 flex flex-wrap items-center gap-3">
          <ArrowButton to="/projects" accent>Browse projects</ArrowButton>
          <ArrowButton to="/summary">Summary</ArrowButton>
        </div>
      </div>

      <div class="card flex flex-col p-6">
        <p class="num">ACTIVITY</p>
        <p class="mt-2 text-lg font-medium">Work over time</p>
        <div class="my-4 flex-1"><ActivityChart :data="activity" label="My commits per month across documented repositories" /></div>
        <NuxtLink to="/evidence" class="link text-sm">Engineering evidence →</NuxtLink>
      </div>
    </section>

    <!-- Stats -->
    <section aria-labelledby="scope">
      <h2 id="scope" class="sr-only">Scope at a glance</h2>
      <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile :value="o.projectCount" label="Projects documented" :note="o.pendingProjects ? `${o.pendingProjects} pending confirmation` : undefined" />
        <StatTile :value="o.sectors" label="Sectors and categories" />
        <StatTile :value="o.repos" label="Repositories" note="Shared with other developers" />
        <StatTile :value="o.evidenceCount" label="Linked commits" note="Each one verified" />
      </div>
    </section>

    <!-- Projects as numbered rows -->
    <section class="card p-6 sm:p-8" aria-labelledby="projects">
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p class="num">PROJECTS</p>
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

    <!-- Categories -->
    <section aria-labelledby="categories">
      <h2 id="categories" class="h-section mb-4">Project categories</h2>
      <ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <li v-for="c in categories" :key="c.id">
          <NuxtLink :to="{ path: '/projects', query: { category: c.id } }" class="card card-hover block h-full p-5">
            <p class="font-medium">{{ c.label }}</p>
            <p class="mt-1 text-sm text-muted">{{ c.blurb }}</p>
            <p class="mt-3 text-xs text-accent">
              <template v-if="c.id === 'conversational-ai'">{{ shownBots.length }} bot{{ shownBots.length === 1 ? '' : 's' }} listed</template>
              <template v-else>
                {{ shownProjects.filter((p) => p.category === c.id).length || 'No' }} project{{ shownProjects.filter((p) => p.category === c.id).length === 1 ? '' : 's' }}
              </template>
            </p>
          </NuxtLink>
        </li>
      </ul>
    </section>

    <!-- Highlights -->
    <section aria-labelledby="highlights">
      <h2 id="highlights" class="h-section">Selected highlights</h2>
      <p class="mt-2 text-sm text-muted">Each links to a project page with its supporting commits. Team contributions are shown as such.</p>
      <ul class="mt-4 grid gap-4 md:grid-cols-2">
        <li v-for="h in highlights" :key="h.to">
          <NuxtLink :to="h.to" class="card card-hover block h-full p-5">
            <p class="font-medium">{{ h.title }}</p>
            <p class="mt-1 text-sm text-muted">{{ h.text }}</p>
          </NuxtLink>
        </li>
      </ul>
    </section>

    <!-- Tech rings -->
    <section aria-labelledby="stack">
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p class="num">TECHNOLOGY</p>
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
    </section>
  </div>
</template>
