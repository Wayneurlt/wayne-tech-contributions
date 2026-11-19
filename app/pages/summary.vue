<script setup lang="ts">
useHead({ title: 'Summary of contributions · Technical Contributions' })
const { hide, shownProjects } = usePresentation()
const o = computed(() => overview(shownProjects.value))
const rows = computed(() => shownProjects.value.map((p) => ({ p, s: statsForProject(p) })))
const byArea = computed(() => {
  const m: Record<string, number> = {}
  for (const p of shownProjects.value) for (const c of p.contributions) m[c.area] = (m[c.area] ?? 0) + 1
  return Object.entries(m).sort((a, b) => b[1] - a[1])
})
const pendingItems = computed(() => [
  `Your role on each of the ${bots.length} SendPulse bots: not yet confirmed`,
  'Pull requests and Linear tickets: not yet linked',
  'Screenshots and recordings: none supplied',
])
</script>

<template>
  <div class="container-page py-12">
    <p class="eyebrow">Page 7</p>
    <h1 class="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Summary of contributions</h1>
    <p class="lead mt-3 max-w-3xl">A one-page view of scope for management. Detail and supporting commits are on each project page.</p>

    <div class="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatTile :value="o.projectCount" label="Projects" :note="o.pendingProjects ? `${o.pendingProjects} pending confirmation` : undefined" />
      <StatTile :value="o.sectors" label="Categories" />
      <StatTile :value="o.contributionCount" label="Documented contributions" note="Each backed by commits" />
      <StatTile :value="o.evidenceCount" label="Linked commits" />
    </div>

    <section class="mt-12" aria-labelledby="table">
      <h2 id="table" class="h-section !text-xl">Contribution matrix</h2>
      <div class="card mt-4 overflow-x-auto">
        <table class="w-full min-w-[44rem] text-left text-sm">
          <caption class="sr-only">Projects, sector, my share of commits, attribution and verification</caption>
          <thead class="border-b border-line text-xs text-muted">
            <tr>
              <th scope="col" class="p-3 font-medium">Project</th>
              <th scope="col" class="p-3 font-medium">Sector</th>
              <th scope="col" class="p-3 font-medium">Attribution</th>
              <th scope="col" class="p-3 font-medium">My / total commits</th>
              <th scope="col" class="p-3 font-medium">Records</th>
              <th scope="col" class="p-3 font-medium">Verification</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in rows" :key="r.p.id" class="border-b border-line last:border-0">
              <th scope="row" class="p-3 font-medium"><NuxtLink :to="`/projects/${r.p.id}`" class="link">{{ r.p.name }}</NuxtLink></th>
              <td class="p-3 text-muted">{{ categoryLabel(r.p.category) }}</td>
              <td class="p-3">{{ attributionLabels[r.p.attribution] }}</td>
              <td class="p-3">{{ r.s.mine }} / {{ r.s.total }}</td>
              <td class="p-3">{{ evidenceForProject(r.p.id).length }}</td>
              <td class="p-3"><VerificationBadge :status="r.p.verification" /></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="mt-12 grid gap-6 md:grid-cols-2" aria-labelledby="areas">
      <div>
        <h2 id="areas" class="h-section !text-xl">Where the work sits</h2>
        <p class="mt-2 text-sm text-muted">Documented contributions by technical area.</p>
        <ul class="mt-4 space-y-2">
          <li v-for="[a, n] in byArea" :key="a" class="flex items-center gap-3 text-sm">
            <span class="w-24 shrink-0 text-muted">{{ areaLabels[a] }}</span>
            <span class="h-2 rounded-full bg-accent" :style="{ width: (n / byArea[0]![1]) * 100 + '%' }" role="img" :aria-label="`${n} contributions`" />
            <span>{{ n }}</span>
          </li>
        </ul>
      </div>
      <div>
        <h2 class="h-section !text-xl">Major implementations and integrations</h2>
        <ul class="mt-4 list-disc space-y-1.5 pl-5 text-sm text-muted">
          <li>i3 Biannual Report platform with Neon Postgres data model and admin export.</li>
          <li>Multi-country, bilingual Zuri Health front-end proof of concept.</li>
          <li>HR platform: leave, push notifications, projects, recognition and HR Assistant contributions.</li>
          <li>ByZara ordering, WhatsApp pay-per-order flow, inventory and role-based access control.</li>
          <li>Temi marketing sites and Flutter app screens; subscription tracking and consent redirect.</li>
        </ul>
      </div>
    </section>

    <section v-if="!hide" class="mt-12" aria-labelledby="pending">
      <h2 id="pending" class="h-section !text-xl">Not yet represented</h2>
      <ul class="mt-4 space-y-2">
        <li v-for="i in pendingItems" :key="i"><PendingNote>{{ i }}</PendingNote></li>
      </ul>
    </section>
  </div>
</template>
