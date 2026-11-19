<script setup lang="ts">
import type { Project } from '~/types/content'
const props = defineProps<{ projects: Project[]; compact?: boolean; from?: string; to?: string }>()

const allMonths = computed(() => monthRange(props.projects))
const months = computed(() => allMonths.value.filter((m) => (!props.from || m >= props.from) && (!props.to || m <= props.to)))
const inRange = computed(() => new Set(months.value))
const filtered = computed(() => !!props.from || !!props.to)
const rows = computed(() =>
  props.projects.map((p) => {
    const monthly = Object.fromEntries(Object.entries(monthlyForProject(p)).filter(([m]) => inRange.value.has(m)))
    const active = Object.keys(monthly).sort()
    return {
      p,
      monthly,
      first: active[0] ?? null,
      last: active.at(-1) ?? null,
      activeCount: active.length,
      span: active.length ? months.value.indexOf(active.at(-1)!) - months.value.indexOf(active[0]!) + 1 : 0,
    }
  }),
)
// When a period is chosen, only projects with activity in it are listed.
const visibleRows = computed(() => (filtered.value ? rows.value.filter((r) => r.activeCount > 0) : rows.value))
const hiddenCount = computed(() => rows.value.length - visibleRows.value.length)
const years = computed(() => {
  const out: { y: string; n: number }[] = []
  for (const m of months.value) {
    const y = m.slice(0, 4)
    const last = out.at(-1)
    if (last && last.y === y) last.n++
    else out.push({ y, n: 1 })
  }
  return out
})

const shade = (n: number) => {
  const pct = [0, 28, 52, 76, 100][intensity(n)]!
  return `color-mix(in srgb, var(--color-accent) ${pct}%, transparent)`
}
const monthLetter = (m: string) => new Date(`${m}-01`).toLocaleDateString('en-GB', { month: 'narrow' })
const monthName = (m: string) => formatDate(m, { month: 'long', year: 'numeric' })
const legend = [0, 1, 3, 6, 11]

const selected = ref<{ id: string; month: string } | null>(null)
const isSelected = (id: string, m: string) => !!selected.value && selected.value.id === id && selected.value.month === m
const select = (id: string, month: string) => {
  selected.value = isSelected(id, month) ? null : { id, month }
}
const detail = computed(() => {
  if (!selected.value) return null
  const row = rows.value.find((r) => r.p.id === selected.value!.id)
  if (!row) return null
  return { row, month: selected.value.month, count: row.monthly[selected.value.month] ?? 0, items: workInMonth(row.p.id, selected.value.month) }
})
</script>

<template>
  <div>
    <div class="overflow-x-auto pb-2">
      <table class="w-full border-separate text-xs" style="border-spacing: 2px">
        <caption class="sr-only">
          Months in which I committed work, per project. Select a month cell to see what was worked on.
        </caption>
        <thead>
          <tr>
            <th rowspan="2" scope="col" class="sticky left-0 z-10 min-w-[9rem] bg-card pr-2 text-left align-bottom font-medium text-muted">Project</th>
            <th v-for="y in years" :key="y.y" scope="colgroup" :colspan="y.n" class="text-left font-medium text-muted">{{ y.y }}</th>
            <th v-if="!compact" rowspan="2" scope="col" class="min-w-[8rem] pl-2 text-left align-bottom font-medium text-muted">Active</th>
          </tr>
          <tr>
            <th v-for="m in months" :key="m" scope="col" class="min-w-[1.4rem] font-normal text-muted" :title="monthName(m)">{{ monthLetter(m) }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in visibleRows" :key="r.p.id">
            <th scope="row" class="sticky left-0 z-10 bg-card pr-2 text-left font-medium">
              <NuxtLink :to="`/projects/${r.p.id}`" class="hover:text-accent">{{ r.p.name.replace(/ \(.*\)/, '') }}</NuxtLink>
            </th>
            <td v-for="m in months" :key="m" class="p-0">
              <button
                v-if="r.monthly[m]"
                type="button"
                class="block h-6 w-full rounded-sm outline-offset-1 transition-transform hover:scale-110"
                :class="isSelected(r.p.id, m) ? 'ring-2 ring-fg' : ''"
                :style="{ background: shade(r.monthly[m]!) }"
                :aria-label="`${r.p.name}, ${monthName(m)}: ${r.monthly[m]} commits`"
                :aria-pressed="isSelected(r.p.id, m)"
                :title="`${monthName(m)}: ${r.monthly[m]} commits`"
                @click="select(r.p.id, m)"
              />
              <span v-else class="block h-6 w-full rounded-sm bg-surface" aria-hidden="true" />
            </td>
            <td v-if="!compact" class="whitespace-nowrap pl-2 text-muted">
              <span v-if="r.first" class="text-fg">{{ formatMonth(r.first) }} – {{ formatMonth(r.last!) }}</span>
              <span class="block">{{ r.activeCount }} of {{ r.span }} month{{ r.span === 1 ? '' : 's' }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-if="!months.length || !visibleRows.length" class="mt-3 text-sm text-muted" role="status">
      No commits fall in this period.
    </p>
    <p v-else-if="hiddenCount" class="mt-2 text-xs text-muted" role="status">
      {{ hiddenCount }} other project{{ hiddenCount === 1 ? '' : 's' }} had no commits in this period and {{ hiddenCount === 1 ? 'is' : 'are' }} not shown.
    </p>

    <ul class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted" aria-label="Legend">
      <li v-for="(n, i) in legend" :key="n" class="flex items-center gap-1.5">
        <span class="h-3 w-3 rounded-sm" :class="i === 0 ? 'bg-surface ring-1 ring-line' : ''" :style="i === 0 ? undefined : { background: shade(n) }" />
        {{ intensityLabels[i] }}
      </li>
    </ul>

    <div v-if="!compact" class="mt-5" aria-live="polite">
      <div v-if="detail" class="card !rounded-xl p-4">
        <div class="flex flex-wrap items-baseline justify-between gap-2">
          <p class="font-medium">{{ detail.row.p.name }} · {{ monthName(detail.month) }}</p>
          <p class="text-xs text-muted">{{ detail.count }} commit{{ detail.count === 1 ? '' : 's' }} in git</p>
        </div>
        <ul v-if="detail.items.length" class="mt-3 space-y-2">
          <EvidenceItem v-for="e in detail.items" :key="e.id" :item="e" />
        </ul>
        <p v-else class="mt-3 text-sm text-muted">
          No hand-picked items fall in this month. The commits exist in git, but none were selected as highlights.
        </p>
      </div>
      <p v-else class="text-sm text-muted">Select a shaded month to see what was worked on in it.</p>
    </div>
  </div>
</template>
