<script setup lang="ts">
useHead({ title: 'Engineering activity and evidence · Technical Contributions' })

const { hide, shownProjects } = usePresentation()
const shownIds = computed(() => new Set(shownProjects.value.map((p) => p.id)))
const scoped = computed(() => allEvidence.filter((e) => shownIds.value.has(e.projectId)))
const project = ref('all')
const kind = ref('all')
const visible = ref(25)

const filtered = computed(() =>
  scoped.value.filter((e) => (project.value === 'all' || e.projectId === project.value) && (kind.value === 'all' || e.kind === kind.value)),
)
watch([project, kind], () => (visible.value = 25))

const activity = monthlyActivity()
const byKind = computed(() => {
  const m: Record<string, number> = {}
  for (const e of scoped.value) if (e.kind) m[e.kind] = (m[e.kind] ?? 0) + 1
  return Object.entries(m).sort((a, b) => b[1] - a[1])
})
const timeline = computed(() =>
  shownProjects.value
    .map((p) => ({ p, s: statsForProject(p) }))
    .filter((x) => x.s.first)
    .sort((a, b) => a.s.first!.localeCompare(b.s.first!)),
)
const range = computed(() => {
  const firsts = timeline.value.map((t) => t.s.first!).sort()
  const lasts = timeline.value.map((t) => t.s.last!).sort()
  const a = new Date(firsts[0]!).getTime()
  const b = new Date(lasts.at(-1)!).getTime()
  return { a, span: Math.max(1, b - a), first: firsts[0]!, last: lasts.at(-1)! }
})
const pos = (d: string) => ((new Date(d).getTime() - range.value.a) / range.value.span) * 100
</script>

<template>
  <div class="container-page py-12">
    <p class="eyebrow">Page 5</p>
    <h1 class="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Engineering activity and evidence</h1>
    <p class="lead mt-3 max-w-3xl">
      Real records only, taken from local git history. Pull requests and Linear tickets are not included yet because those
      sources have not been connected.
    </p>

    <section class="mt-10" aria-labelledby="classes">
      <h2 id="classes" class="h-section !text-xl">How evidence is classified</h2>
      <dl class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div v-for="(v, k) in verificationLabels" :key="k" class="card p-4">
          <dt><VerificationBadge :status="k" /></dt>
          <dd class="mt-2 text-sm text-muted">{{ v.description }}</dd>
        </div>
      </dl>
      <div class="mt-4 grid gap-3 sm:grid-cols-3">
        <StatTile :value="scoped.length" label="Commits linked" note="All authored by me" />
        <template v-if="!hide">
          <StatTile value="0" label="Pull requests linked" note="Pending: needs gh or an export" />
          <StatTile value="0" label="Linear tickets linked" note="Pending: connector or export" />
        </template>
      </div>
    </section>

    <section class="mt-14" aria-labelledby="activity">
      <h2 id="activity" class="h-section !text-xl">Activity over time</h2>
      <div class="card mt-4 p-5"><ActivityChart :data="activity" label="My commits per month across documented repositories" /></div>
    </section>

    <section class="mt-14" aria-labelledby="timeline">
      <h2 id="timeline" class="h-section !text-xl">Project timelines</h2>
      <p class="mt-2 text-sm text-muted">From my first to my last commit in each project's repositories.</p>
      <div class="card mt-4 p-5">
        <div class="flex justify-between text-xs text-muted"><span>{{ formatDate(range.first, { month: 'short', year: 'numeric' }) }}</span><span>{{ formatDate(range.last, { month: 'short', year: 'numeric' }) }}</span></div>
        <ul class="mt-3 space-y-3">
          <li v-for="t in timeline" :key="t.p.id">
            <div class="mb-1 flex justify-between text-xs">
              <NuxtLink :to="`/projects/${t.p.id}`" class="link truncate">{{ t.p.name }}</NuxtLink>
              <span class="shrink-0 text-muted">{{ formatMonth(t.s.first!) }} – {{ formatMonth(t.s.last!) }}</span>
            </div>
            <div class="relative h-2 rounded-full bg-line" role="img" :aria-label="`${t.p.name}: ${formatDate(t.s.first)} to ${formatDate(t.s.last)}`">
              <div
                class="absolute h-2 rounded-full bg-accent"
                :style="{ left: pos(t.s.first!) + '%', width: Math.max(1.2, pos(t.s.last!) - pos(t.s.first!)) + '%' }"
              />
            </div>
          </li>
        </ul>
      </div>
    </section>

    <section class="mt-14" aria-labelledby="kinds">
      <h2 id="kinds" class="h-section !text-xl">Selected work by type</h2>
      <ul class="mt-4 flex flex-wrap gap-2">
        <li v-for="[k, n] in byKind" :key="k" class="chip !text-sm !px-3 !py-1">{{ kindLabels[k] }} <span class="ml-1.5 text-accent">{{ n }}</span></li>
      </ul>
    </section>

    <section class="mt-14" aria-labelledby="list">
      <h2 id="list" class="h-section !text-xl">Selected commits</h2>
      <div class="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label for="proj" class="sr-only">Project</label>
          <select id="proj" v-model="project" class="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm">
            <option value="all">All projects</option>
            <option v-for="p in shownProjects" :key="p.id" :value="p.id">{{ p.name }}</option>
          </select>
        </div>
        <div>
          <label for="kind" class="sr-only">Type of work</label>
          <select id="kind" v-model="kind" class="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm">
            <option value="all">All types</option>
            <option v-for="(label, k) in kindLabels" :key="k" :value="k">{{ label }}</option>
          </select>
        </div>
      </div>
      <p class="mt-3 text-sm text-muted" role="status" aria-live="polite">{{ filtered.length }} records</p>
      <ul class="mt-3 space-y-2">
        <EvidenceItem v-for="e in filtered.slice(0, visible)" :key="e.id" :item="e" show-project />
      </ul>
      <button v-if="filtered.length > visible" type="button" class="btn mt-4" @click="visible += 25">Show more</button>
      <p class="mt-6 text-xs text-muted">
        Commit links point to private repositories and require access. Commits are selected by hand to show meaningful work;
        trivial commits, secrets-related commits and unrelated changes are omitted.
      </p>
    </section>
  </div>
</template>
