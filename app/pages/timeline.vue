<script setup lang="ts">
useHead({ title: 'Work timeline · Technical Contributions' })
const { shownProjects } = usePresentation()
const route = useRoute()
const router = useRouter()

const allMonths = computed(() => monthRange(shownProjects.value))
const first = computed(() => allMonths.value[0] ?? '')
const last = computed(() => allMonths.value.at(-1) ?? '')

const valid = (v: unknown) => (typeof v === 'string' && allMonths.value.includes(v) ? v : '')
const from = ref(valid(route.query.from) || first.value)
const to = ref(valid(route.query.to) || last.value)

// Keep the range ordered: moving one end past the other drags the other with it.
watch(from, (v) => { if (v > to.value) to.value = v })
watch(to, (v) => { if (v < from.value) from.value = v })

const isFiltered = computed(() => from.value !== first.value || to.value !== last.value)
watch([from, to], () => {
  router.replace({ query: { from: from.value !== first.value ? from.value : undefined, to: to.value !== last.value ? to.value : undefined } })
})
const reset = () => { from.value = first.value; to.value = last.value }

const monthLabel = (m: string) => formatDate(m, { month: 'long', year: 'numeric' })
const quick = computed(() => {
  const years = [...new Set(allMonths.value.map((m) => m.slice(0, 4)))]
  return years.map((y) => ({
    label: y,
    from: allMonths.value.find((m) => m.startsWith(y))!,
    to: allMonths.value.filter((m) => m.startsWith(y)).at(-1)!,
  }))
})
const apply = (f: string, t: string) => { from.value = f; to.value = t }

const activity = computed(() => monthlyActivity().filter((d) => d.month >= from.value && d.month <= to.value))
const summary = computed(() => {
  const inRange = (m: string) => m >= from.value && m <= to.value
  let commits = 0
  let active = 0
  for (const p of shownProjects.value) {
    const n = Object.entries(monthlyForProject(p)).filter(([m]) => inRange(m)).reduce((s, [, c]) => s + c, 0)
    commits += n
    if (n > 0) active++
  }
  const months = allMonths.value.filter(inRange).length
  return { commits, active, months }
})
</script>

<template>
  <div class="container-page space-y-6 py-6 lg:py-2">
    <header>
      <p class="num">TIMELINE</p>
      <h1 class="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">What I worked on, and when</h1>
      <p class="lead mt-3 max-w-3xl">
        Each row is a project and each column a month. Shaded months are months in which I committed work. Choose a period
        below, and select a month to see the work done in it.
      </p>
    </header>

    <section class="card p-5" aria-labelledby="period">
      <h2 id="period" class="sr-only">Choose a period</h2>
      <form class="flex flex-wrap items-end gap-3" @submit.prevent>
        <div>
          <label for="tl-from" class="mb-1 block text-xs text-muted">From</label>
          <select id="tl-from" v-model="from" class="rounded-full border border-line bg-surface px-4 py-2 text-sm">
            <option v-for="m in allMonths" :key="m" :value="m">{{ monthLabel(m) }}</option>
          </select>
        </div>
        <div>
          <label for="tl-to" class="mb-1 block text-xs text-muted">To</label>
          <select id="tl-to" v-model="to" class="rounded-full border border-line bg-surface px-4 py-2 text-sm">
            <option v-for="m in allMonths" :key="m" :value="m">{{ monthLabel(m) }}</option>
          </select>
        </div>
        <div class="flex flex-wrap items-center gap-2" role="group" aria-label="Quick periods">
          <button v-for="q in quick" :key="q.label" type="button" class="btn !px-4 !py-2 text-xs" :class="from === q.from && to === q.to ? '!border-accent' : ''" @click="apply(q.from, q.to)">
            {{ q.label }}
          </button>
          <button type="button" class="btn !px-4 !py-2 text-xs" :disabled="!isFiltered" :class="!isFiltered ? 'opacity-50' : ''" @click="reset">All time</button>
        </div>
      </form>
      <p class="mt-4 text-sm text-muted" role="status" aria-live="polite">
        <span class="text-fg">{{ monthLabel(from) }} to {{ monthLabel(to) }}</span>:
        {{ summary.months }} month{{ summary.months === 1 ? '' : 's' }},
        {{ summary.active }} project{{ summary.active === 1 ? '' : 's' }} with commits,
        {{ summary.commits }} commit{{ summary.commits === 1 ? '' : 's' }}.
      </p>
    </section>

    <section class="card p-5 sm:p-6" aria-labelledby="grid">
      <h2 id="grid" class="sr-only">Month by month</h2>
      <WorkTimeline :projects="shownProjects" :from="from" :to="to" />
    </section>

    <section class="card p-5 sm:p-6" aria-labelledby="total">
      <p class="num">ALL PROJECTS</p>
      <h2 id="total" class="mt-2 text-lg font-medium">Total activity per month</h2>
      <div v-if="activity.length" class="mt-4"><ActivityChart :data="activity" label="My commits per month across documented repositories" /></div>
      <p v-else class="mt-4 text-sm text-muted">No commits fall in this period.</p>
    </section>

    <section class="card p-5 text-sm text-muted">
      <p class="font-medium text-fg">How to read this</p>
      <ul class="mt-2 list-disc space-y-1 pl-5">
        <li>Dates are commit dates from git. They show when code was committed, not the total time spent on a project.</li>
        <li>Gaps do not mean no work. Meetings, planning, support, review and work tracked elsewhere do not appear in git.</li>
        <li>Shading shows the number of commits in the month. Commit counts show activity, not the size or difficulty of the work.</li>
        <li>Several projects overlap in time, which shows work was done in parallel.</li>
      </ul>
    </section>
  </div>
</template>
