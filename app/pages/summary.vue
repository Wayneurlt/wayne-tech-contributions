<script setup lang="ts">
import { highlights } from '~~/content/highlights'
import { botAttribution, isMyBot } from '~~/content/evidence/chatbot-ownership'
useHead({ title: 'Summary of contributions · Technical Contributions' })

const { hide, shownProjects, shownBots } = usePresentation()
const o = computed(() => overview(shownProjects.value))
const shownIds = computed(() => new Set(shownProjects.value.map((p) => p.id)))

const months = computed(() => monthRange(shownProjects.value))
const period = computed(() => (months.value.length ? `${formatMonth(months.value[0]!)} to ${formatMonth(months.value.at(-1)!)}` : ''))
const rows = computed(() => shownProjects.value.map((p) => ({ p, s: statsForProject(p) })))

const sectors = computed(() =>
  categories.map((c) => ({ ...c, items: shownProjects.value.filter((p) => p.category === c.id) })).filter((c) => c.items.length),
)

const disciplines = computed(() =>
  capabilities
    .map((c) => ({ ...c, projectIds: c.projectIds.filter((id) => shownIds.value.has(id)) }))
    .filter((c) => c.projectIds.length || c.technologies.length),
)
const byArea = computed(() => {
  const m: Record<string, number> = {}
  for (const p of shownProjects.value) for (const c of p.contributions) m[c.area] = (m[c.area] ?? 0) + 1
  return Object.entries(m).sort((a, b) => b[1] - a[1])
})

const implementations = computed(() =>
  highlights.top.filter((t) => shownIds.value.has(t.projectId)).map((t) => ({ p: getProject(t.projectId)!, line: t.line })),
)
const integrations = computed(() =>
  shownProjects.value.flatMap((p) =>
    p.contributions.filter((c) => c.kind === 'integration' || c.area === 'integration').map((c) => ({ p, text: c.text })),
  ),
)

const whatsapp = computed(() => shownBots.value.filter(isMyBot))
const topBots = computed(() => [...whatsapp.value].sort((a, b) => b.inboxTotal - a.inboxTotal).slice(0, 5))

const proofs = computed(() =>
  highlights.top
    .filter((t) => shownIds.value.has(t.projectId))
    .flatMap((t) => evidenceForIds(t.proof).slice(0, 2).map((e) => ({ p: getProject(t.projectId)!, e }))),
)
const openItems = [
  'Pull requests: not yet linked',
  'Screenshots and recordings: none supplied',
  'Business outcomes and usage figures: not yet supplied',
]
</script>

<template>
  <div class="container-page space-y-10 py-6 lg:py-2">
    <header>
      <p class="num">Page 8</p>
      <h1 class="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Summary of contributions</h1>
      <p class="lead mt-3 max-w-3xl">
        {{ o.projectCount }} projects across {{ o.sectors }} sectors, in {{ o.repos }} repositories shared with other developers,
        with {{ o.evidenceCount }} commits linked as evidence. Activity runs from {{ period }}. Each section below links to
        the detail behind it.
      </p>
    </header>

    <section class="grid grid-cols-2 gap-3 lg:grid-cols-3" aria-label="Scope in numbers">
      <StatTile :value="o.projectCount" label="Projects" :note="o.pendingProjects ? `${o.pendingProjects} pending confirmation` : undefined" />
      <StatTile :value="o.sectors" label="Sectors and categories" />
      <StatTile :value="o.contributionCount" label="Documented contributions" note="Each backed by commits" />
      <StatTile :value="o.evidenceCount" label="Linked commits" />
      <StatTile :value="whatsapp.length" label="WhatsApp chatbots" note="Built with Kingsley, self-reported" />
      <StatTile :value="months.length" label="Months of activity" :note="period" />
    </section>

    <section aria-labelledby="matrix">
      <h2 id="matrix" class="h-section !text-xl">Projects contributed to</h2>
      <p class="mt-2 text-sm text-muted">Attribution is stated for every project. Shared projects show the share of commits for context only.</p>
      <div class="card mt-4 overflow-x-auto">
        <table class="w-full min-w-176 text-left text-sm">
          <caption class="sr-only">Projects, sector, attribution, my commits, period and verification</caption>
          <thead class="border-b border-line text-xs text-muted">
            <tr>
              <th scope="col" class="p-3 font-medium">Project</th>
              <th scope="col" class="p-3 font-medium">Sector</th>
              <th scope="col" class="p-3 font-medium">Attribution</th>
              <th scope="col" class="p-3 font-medium">My / total commits</th>
              <th scope="col" class="p-3 font-medium">Period</th>
              <th scope="col" class="p-3 font-medium">Verification</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in rows" :key="r.p.id" class="border-b border-line last:border-0">
              <th scope="row" class="p-3 font-medium"><NuxtLink :to="`/projects/${r.p.id}`" class="link">{{ r.p.name }}</NuxtLink></th>
              <td class="p-3 text-muted">{{ categoryLabel(r.p.category) }}</td>
              <td class="p-3">{{ attributionLabels[r.p.attribution] }}</td>
              <td class="p-3">{{ r.s.mine }} / {{ r.s.total }}</td>
              <td class="p-3 whitespace-nowrap text-muted">{{ r.s.first ? `${formatMonth(r.s.first)} – ${formatMonth(r.s.last!)}` : '—' }}</td>
              <td class="p-3"><VerificationBadge :status="r.p.verification" /></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section aria-labelledby="sectors">
      <h2 id="sectors" class="h-section !text-xl">Sectors covered</h2>
      <ul class="mt-4 grid gap-4 md:grid-cols-2">
        <li v-for="c in sectors" :key="c.id" class="card p-5">
          <p class="font-medium">{{ c.label }}</p>
          <p class="mt-1 text-sm text-muted">{{ c.blurb }}</p>
          <ul class="mt-3 flex flex-wrap gap-2">
            <li v-for="p in c.items" :key="p.id">
              <NuxtLink :to="`/projects/${p.id}`" class="chip hover:border-accent hover:text-fg">{{ p.name.replace(/ \(.*\)/, '') }}</NuxtLink>
            </li>
          </ul>
        </li>
        <li v-if="whatsapp.length" class="card p-5">
          <p class="font-medium">Conversational AI and Chatbots</p>
          <p class="mt-1 text-sm text-muted">WhatsApp virtual-hospital and consumer chatbots.</p>
          <p class="mt-3"><NuxtLink to="/chatbots" class="chip hover:border-accent hover:text-fg">{{ whatsapp.length }} WhatsApp chatbots</NuxtLink></p>
        </li>
      </ul>
    </section>

    <section class="grid gap-8 lg:grid-cols-[1.4fr_1fr]" aria-labelledby="disciplines">
      <div>
        <h2 id="disciplines" class="h-section !text-xl">Technical disciplines</h2>
        <ul class="mt-4 space-y-3">
          <li v-for="c in disciplines" :key="c.id" class="card p-4">
            <div class="flex flex-wrap items-baseline justify-between gap-2">
              <p class="font-medium">{{ c.group }}</p>
              <p v-if="c.projectIds.length" class="text-xs text-muted">{{ c.projectIds.length }} project{{ c.projectIds.length === 1 ? '' : 's' }}</p>
            </div>
            <p class="mt-1 text-sm text-muted">{{ c.summary }}</p>
          </li>
        </ul>
        <NuxtLink to="/capabilities" class="link mt-4 inline-block text-sm">Capabilities in detail →</NuxtLink>
      </div>
      <div>
        <h2 class="h-section !text-xl">Where the work sits</h2>
        <p class="mt-2 text-sm text-muted">Documented contributions by technical area.</p>
        <ul class="mt-4 space-y-2">
          <li v-for="[a, n] in byArea" :key="a" class="flex items-center gap-3 text-sm">
            <span class="w-24 shrink-0 text-muted">{{ areaLabels[a] }}</span>
            <span class="h-2 rounded-full bg-accent" :style="{ width: (n / byArea[0]![1]) * 100 + '%' }" role="img" :aria-label="`${n} contributions`" />
            <span>{{ n }}</span>
          </li>
        </ul>
      </div>
    </section>

    <section aria-labelledby="major">
      <h2 id="major" class="h-section !text-xl">Major implementations</h2>
      <ul class="mt-4 space-y-3">
        <li v-for="i in implementations" :key="i.p.id" class="card p-4 text-sm">
          <NuxtLink :to="`/projects/${i.p.id}`" class="font-medium hover:text-accent">{{ i.p.name }}</NuxtLink>
          <p class="mt-1 text-muted">{{ i.line }}</p>
        </li>
      </ul>
    </section>

    <section aria-labelledby="integrations">
      <h2 id="integrations" class="h-section !text-xl">Integrations</h2>
      <ul class="mt-4 space-y-2">
        <li v-for="(i, n) in integrations" :key="n" class="card flex flex-wrap items-baseline gap-x-3 gap-y-1 !rounded-xl p-3 text-sm">
          <NuxtLink :to="`/projects/${i.p.id}`" class="shrink-0 font-medium hover:text-accent">{{ i.p.name.replace(/ \(.*\)/, '') }}</NuxtLink>
          <span class="text-muted">{{ i.text }}</span>
        </li>
      </ul>
    </section>

    <section aria-labelledby="bots">
      <h2 id="bots" class="h-section !text-xl">Chatbot solutions</h2>
      <div class="card mt-4 p-5">
        <p class="text-sm text-muted">
          {{ whatsapp.length }} WhatsApp chatbots on Kenyan numbers: virtual-hospital bots for clients including Somerset, HF Group,
          ICEA LION, Equity and I&amp;M Bank, plus consumer health bots such as Vera KE and Zuri Mama. {{ botAttribution }}
        </p>
        <p class="mt-4 text-xs text-muted">Largest by inbox conversations (conversations, not users):</p>
        <ul class="mt-2 grid gap-2 sm:grid-cols-2">
          <li v-for="b in topBots" :key="b.id" class="flex items-baseline justify-between gap-3 rounded-lg border border-line bg-surface px-3 py-2 text-sm">
            <span class="truncate">{{ b.name }}</span>
            <span class="shrink-0 tabular-nums text-muted">{{ b.inboxTotal.toLocaleString('en-GB') }}</span>
          </li>
        </ul>
        <p class="mt-4 text-sm text-muted">
          AI-assisted work in repositories: contributions to the HR Assistant in The Play Group HR platform.
        </p>
        <NuxtLink to="/chatbots" class="link mt-4 inline-block text-sm">Full chatbot list →</NuxtLink>
      </div>
    </section>

    <section aria-labelledby="research">
      <h2 id="research" class="h-section !text-xl">Research and innovation</h2>
      <ul class="mt-4 space-y-3">
        <li v-for="r in research" :key="r.id" class="card p-5 text-sm">
          <p class="font-medium">{{ r.title }}</p>
          <p class="mt-1 text-muted">{{ r.purpose }}</p>
          <p class="mt-2 text-muted">{{ r.valueAndLimits }}</p>
          <NuxtLink to="/research" class="link mt-3 inline-block text-sm">Read more →</NuxtLink>
        </li>
      </ul>
    </section>

    <section aria-labelledby="proof">
      <h2 id="proof" class="h-section !text-xl">Evidence-backed highlights</h2>
      <p class="mt-2 text-sm text-muted">
        Representative commits from the strongest projects. Links open private repositories and need access.
      </p>
      <div class="card mt-4 overflow-x-auto">
        <table class="w-full min-w-160 text-left text-sm">
          <caption class="sr-only">Representative commits by project</caption>
          <thead class="border-b border-line text-xs text-muted">
            <tr>
              <th scope="col" class="p-3 font-medium">Project</th>
              <th scope="col" class="p-3 font-medium">What it shows</th>
              <th scope="col" class="p-3 font-medium">Date</th>
              <th scope="col" class="p-3 font-medium">Commit</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="x in proofs" :key="x.e.id" class="border-b border-line align-top last:border-0">
              <th scope="row" class="p-3 font-medium">{{ x.p.name.replace(/ \(.*\)/, '') }}</th>
              <td class="p-3 text-muted">{{ x.e.title }}</td>
              <td class="p-3 whitespace-nowrap text-muted">{{ formatDate(x.e.date, { day: 'numeric', month: 'short', year: '2-digit' }) }}</td>
              <td class="p-3 font-mono text-xs">
                <a v-if="x.e.url" :href="x.e.url" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 hover:text-accent">
                  {{ x.e.id.split('-').pop() }}<Icon name="lucide:external-link" class="h-3 w-3" aria-hidden="true" />
                </a>
                <span v-else>{{ x.e.id.split('-').pop() }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <NuxtLink to="/evidence" class="link mt-4 inline-block text-sm">All evidence →</NuxtLink>
    </section>

    <section v-if="!hide" aria-labelledby="open">
      <h2 id="open" class="h-section !text-xl">Not yet represented</h2>
      <ul class="mt-4 space-y-2">
        <li v-for="i in openItems" :key="i"><PendingNote>{{ i }}</PendingNote></li>
      </ul>
    </section>
  </div>
</template>
