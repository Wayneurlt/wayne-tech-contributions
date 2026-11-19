<script setup lang="ts">
const route = useRoute()
const project = getProject(String(route.params.id))
if (!project) {
  throw createError({ statusCode: 404, statusMessage: 'Project not found', fatal: true })
}
useHead({ title: `${project.name} · Technical Contributions` })

import { botAttribution } from '~~/content/evidence/chatbot-ownership'
const { hide, shownProjects, shownBots } = usePresentation()
const stats = statsForProject(project)
const evidence = evidenceForProject(project.id)
const activity = monthlyActivity(project.id)
const list = shownProjects.value
const idx = list.findIndex((p) => p.id === project.id)
const prev = idx > 0 ? list[idx - 1] : undefined
const next = idx >= 0 ? list[idx + 1] : undefined
const projectBots = computed(() => shownBots.value.filter((b) => b.projectId === project.id))
const hasMedia = evidenceForProject(project.id).some((e) => (e.type === 'screenshot' || e.type === 'recording') && e.media)
const kinds = [...new Set(project.contributions.map((c) => c.area))]
const byMonth = (() => {
  const groups = new Map<string, typeof evidence>()
  for (const e of [...evidence].sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''))) {
    const m = (e.date ?? '').slice(0, 7)
    if (!m) continue
    groups.set(m, [...(groups.get(m) ?? []), e])
  }
  const monthly = monthlyForProject(project)
  return [...groups.entries()].map(([month, items]) => ({ month, items, commits: monthly[month] ?? items.length }))
})()
</script>

<template>
  <div v-if="project" class="container-page py-12">
    <nav aria-label="Breadcrumb" class="text-sm text-muted">
      <NuxtLink to="/projects" class="link">Projects</NuxtLink> <span aria-hidden="true">/</span> {{ project.name }}
    </nav>

    <header class="mt-4">
      <p class="eyebrow">{{ categoryLabel(project.category) }}</p>
      <h1 class="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{{ project.name }}</h1>
      <p class="lead mt-3 max-w-3xl">{{ project.summary }}</p>
    </header>

    <div class="mt-8 grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div class="min-w-0 space-y-12">
        <!-- Overview -->
        <section aria-labelledby="overview">
          <h2 id="overview" class="h-section !text-xl">Project overview</h2>
          <dl class="card mt-4 grid gap-4 p-5 text-sm sm:grid-cols-2">
            <div><dt class="text-muted">Sector</dt><dd class="mt-0.5">{{ project.sector }}</dd></div>
            <div v-if="!(hide && project.status === 'unknown')"><dt class="text-muted">Status</dt><dd class="mt-0.5">{{ statusLabels[project.status] }}</dd></div>
            <div>
              <dt class="text-muted">Live URL</dt>
              <dd class="mt-0.5">
                <a v-if="project.liveUrl" :href="project.liveUrl" target="_blank" rel="noopener noreferrer" class="link inline-flex items-center gap-1">
                  {{ project.liveUrl.replace('https://', '') }}<Icon name="lucide:external-link" class="h-3 w-3" aria-hidden="true" />
                </a>
                <span v-else class="text-muted">None (not deployed publicly)</span>
              </dd>
            </div>
            <div><dt class="text-muted">Scale of my contribution</dt><dd class="mt-0.5">{{ scaleLabels[project.scale] }}</dd></div>
            <div class="sm:col-span-2"><dt class="text-muted">My role (as the records support it)</dt><dd class="mt-0.5">{{ project.role }}</dd></div>
            <div class="sm:col-span-2"><dt class="text-muted">Team and attribution</dt><dd class="mt-0.5">{{ project.teamNote }}</dd></div>
          </dl>
        </section>

        <!-- Contributions -->
        <section aria-labelledby="contributions">
          <h2 id="contributions" class="h-section !text-xl">My contributions</h2>
          <ul class="mt-4 space-y-3">
            <li v-for="(c, i) in project.contributions" :key="i" class="card p-4">
              <div class="flex flex-wrap items-start justify-between gap-2">
                <p class="max-w-2xl text-sm">{{ c.text }}</p>
                <VerificationBadge :status="c.status" />
              </div>
              <p class="mt-2 flex flex-wrap gap-1.5 text-xs">
                <span class="chip">{{ kindLabels[c.kind] }}</span><span class="chip">{{ areaLabels[c.area] }}</span>
              </p>
              <details v-if="c.evidenceIds?.length" class="mt-3 group">
                <summary class="flex cursor-pointer list-none items-center gap-1 text-xs text-accent">
                  <Icon name="lucide:chevron-right" class="h-3 w-3 transition-transform group-open:rotate-90" aria-hidden="true" />
                  {{ c.evidenceIds.length }} supporting record{{ c.evidenceIds.length === 1 ? '' : 's' }}
                </summary>
                <ul class="mt-2 space-y-2">
                  <EvidenceItem v-for="ev in evidenceForIds(c.evidenceIds)" :key="ev.id" :item="ev" />
                </ul>
              </details>
            </li>
          </ul>
        </section>

        <!-- Work by month -->
        <section v-if="byMonth.length" aria-labelledby="bymonth">
          <h2 id="bymonth" class="h-section !text-xl">Work by month</h2>
          <p class="mt-2 text-sm text-muted">
            The selected highlights in the order they were done. Commit totals are all of my commits that month.
          </p>
          <ol class="mt-4 space-y-3">
            <li v-for="g in byMonth" :key="g.month" class="card !rounded-xl p-4">
              <div class="flex flex-wrap items-baseline justify-between gap-2">
                <p class="font-medium">{{ formatDate(g.month, { month: 'long', year: 'numeric' }) }}</p>
                <p class="text-xs text-muted">{{ g.commits }} commit{{ g.commits === 1 ? '' : 's' }}</p>
              </div>
              <ul class="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">
                <li v-for="e in g.items" :key="e.id">{{ e.title }}</li>
              </ul>
            </li>
          </ol>
        </section>

        <!-- Technical -->
        <section aria-labelledby="technical">
          <h2 id="technical" class="h-section !text-xl">Technical implementation</h2>
          <h3 class="mt-4 text-sm font-medium text-muted">Technologies in the repositories</h3>
          <div class="mt-2"><TechTags :tags="project.technologies" /></div>
          <p class="mt-2 text-xs text-muted">
            Taken from dependency manifests or changed files. They show what the project uses, not that I used each one.
          </p>
          <h3 v-if="project.challenges.length || !hide" class="mt-6 text-sm font-medium text-muted">Challenges and solutions</h3>
          <ul v-if="project.challenges.length" class="mt-2 space-y-3">
            <li v-for="(ch, i) in project.challenges" :key="i" class="card p-4 text-sm">
              <p><span class="text-muted">Challenge: </span>{{ ch.challenge }}</p>
              <p class="mt-1"><span class="text-muted">Solution: </span>{{ ch.solution }}</p>
              <p class="mt-2"><VerificationBadge :status="ch.status" /></p>
            </li>
          </ul>
          <div v-else class="mt-2">
            <PendingNote>
              Technical challenges, architecture decisions and the solutions you implemented are not recorded in git.
              Please describe two or three for this project.
            </PendingNote>
          </div>
        </section>

        <!-- Evidence -->
        <section aria-labelledby="evidence">
          <h2 id="evidence" class="h-section !text-xl">Evidence</h2>
          <details class="card mt-4 p-4" :open="evidence.length <= 8">
            <summary class="cursor-pointer text-sm font-medium">
              Selected commits ({{ evidence.length }})
            </summary>
            <p class="mt-2 text-xs text-muted">
              Hand-selected from commits authored by me. Links open the repository on GitHub and need repository access.
            </p>
            <ul class="mt-3 space-y-2">
              <EvidenceItem v-for="ev in evidence" :key="ev.id" :item="ev" />
            </ul>
          </details>
          <div v-if="!hide" class="mt-4 grid gap-3 sm:grid-cols-2">
            <PendingNote>No pull requests have been linked yet (they need GitHub CLI or an export).</PendingNote>
          </div>
          <template v-if="hasMedia || !hide">
            <h3 class="mt-6 text-sm font-medium text-muted">Screenshots and recordings</h3>
            <div class="mt-2"><MediaGallery :project-id="project.id" /></div>
          </template>
        </section>

        <!-- Chatbots -->
        <section v-if="projectBots.length" aria-labelledby="bots">
          <h2 id="bots" class="h-section !text-xl">Chatbots</h2>
          <ul class="mt-4 space-y-2"><BotRow v-for="b in projectBots" :key="b.id" :bot="b" /></ul>
          <p class="mt-2 text-xs text-muted">
            From the SendPulse chatbots API, retrieved {{ formatDate(botRetrievedAt) }}. Inbox conversations are not a count of users.
          </p>
          <p class="mt-3 text-sm text-muted">{{ botAttribution }}</p>
        </section>

        <!-- Business relevance -->
        <section v-if="!(hide && typeof project.businessRelevance !== 'string')" aria-labelledby="business">
          <h2 id="business" class="h-section !text-xl">Business relevance</h2>
          <PendingNote v-if="typeof project.businessRelevance !== 'string'">{{ project.businessRelevance.needed }}</PendingNote>
          <template v-else>
            <p class="mt-3 max-w-3xl text-sm text-muted">{{ project.businessRelevance }}</p>
            <p class="mt-2 text-xs text-muted">Describes function as seen in the code. No commercial outcomes are claimed.</p>
          </template>
        </section>

        <section v-if="project.openQuestions.length && !hide" aria-labelledby="open">
          <h2 id="open" class="h-section !text-xl">Still needed from Wayne</h2>
          <ul class="mt-3 list-disc space-y-1 pl-5 text-sm text-muted">
            <li v-for="(qn, i) in project.openQuestions" :key="i">{{ qn }}</li>
          </ul>
        </section>
      </div>

      <!-- Sidebar -->
      <aside class="space-y-4 lg:sticky lg:top-20 lg:self-start" aria-label="Project facts">
        <div class="card p-4">
          <p class="text-sm font-medium">Attribution</p>
          <p class="mt-1 text-sm text-accent">{{ attributionLabels[project.attribution] }}</p>
          <div class="mt-4"><AttributionMeter :mine="stats.mine" :total="stats.total" /></div>
          <p v-if="stats.others.length" class="mt-3 text-xs text-muted">Also committed: {{ stats.others.join(', ') }}</p>
          <p class="mt-3 text-xs text-muted">Commit counts show activity, not value. Contribution is judged from the changes listed.</p>
        </div>
        <div class="card p-4">
          <p class="text-sm font-medium">Activity</p>
          <p class="mt-1 text-xs text-muted">
            {{ formatDate(stats.first) }} to {{ formatDate(stats.last) }}
          </p>
          <div class="mt-3"><ActivityChart :data="activity" label="My commits per month" /></div>
        </div>
        <div class="card p-4 text-sm">
          <p class="font-medium">Repositories</p>
          <ul class="mt-2 space-y-1.5">
            <li v-for="r in stats.repos" :key="r.repo" class="flex justify-between gap-2 text-xs">
              <span class="truncate font-mono text-muted">{{ r.repo }}</span>
              <span>{{ r.myCommits }}/{{ r.totalCommits }}</span>
            </li>
          </ul>
        </div>
        <p class="text-xs text-muted">Areas covered: {{ kinds.map((k) => areaLabels[k]).join(', ') }}</p>
      </aside>
    </div>

    <nav class="mt-16 flex justify-between gap-4 border-t border-line pt-6 text-sm" aria-label="Project navigation">
      <NuxtLink v-if="prev" :to="`/projects/${prev.id}`" class="link">← {{ prev.name }}</NuxtLink><span v-else />
      <NuxtLink v-if="next" :to="`/projects/${next.id}`" class="link">{{ next.name }} →</NuxtLink>
    </nav>
  </div>
</template>
