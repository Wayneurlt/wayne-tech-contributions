<script setup lang="ts">
const props = defineProps<{ data: { month: string; count: number }[]; label?: string }>()
const max = computed(() => Math.max(1, ...props.data.map((d) => d.count)))
const total = computed(() => props.data.reduce((s, d) => s + d.count, 0))
const peak = computed(() => props.data.reduce((a, b) => (b.count > a.count ? b : a), props.data[0] ?? { month: '', count: 0 }))
const W = 720
const H = 140
const gap = 2
const bw = computed(() => Math.min(28, Math.max(2, (W - gap * (props.data.length - 1)) / Math.max(1, props.data.length))))
const years = computed(() => {
  const seen: { y: string; x: number }[] = []
  props.data.forEach((d, i) => {
    const y = d.month.slice(0, 4)
    if (!seen.some((s) => s.y === y)) seen.push({ y, x: i * (bw.value + gap) })
  })
  return seen
})
</script>

<template>
  <figure>
    <svg
      :viewBox="`0 0 ${W} ${H + 18}`"
      class="w-full"
      role="img"
      :aria-label="`${label ?? 'Commits per month'}: ${total} commits in total, peak ${peak.count} in ${formatMonth(peak.month)}`"
    >
      <line x1="0" :y1="H" :x2="W" :y2="H" stroke="var(--color-line)" />
      <g v-for="(d, i) in data" :key="d.month">
        <rect
          :x="i * (bw + gap)"
          :y="H - (d.count / max) * (H - 8)"
          :width="bw"
          :height="(d.count / max) * (H - 8)"
          rx="1.5"
          :fill="d.month === peak.month ? 'var(--color-accent)' : 'var(--color-muted)'"
          :opacity="d.month === peak.month ? 1 : 0.55"
        >
          <title>{{ formatMonth(d.month) }}: {{ d.count }} commits</title>
        </rect>
      </g>
      <text v-for="y in years" :key="y.y" :x="y.x" :y="H + 14" fill="var(--color-muted)" font-size="11">{{ y.y }}</text>
    </svg>
    <figcaption class="mt-2 text-xs text-muted">
      {{ label ?? 'My commits per month' }}. Peak: <span class="text-fg">{{ peak.count }}</span> in {{ formatMonth(peak.month) }}.
      Commit counts show activity only, not the size or quality of the work.
    </figcaption>
  </figure>
</template>
