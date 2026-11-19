<script setup lang="ts">
definePageMeta({ layout: 'report' })
useHead({ title: `${profile.name} · Technical Contribution Report` })
import { highlights } from '~~/content/highlights'
const { hide, shownProjects, shownBots } = usePresentation()
const o = computed(() => overview(shownProjects.value))
const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
const rows = computed(() => shownProjects.value.map((p) => ({ p, s: statsForProject(p) })))
const shownIds = computed(() => new Set(shownProjects.value.map((p) => p.id)))
const months = computed(() => monthRange(shownProjects.value))
const cellColor = (n: number) => `color-mix(in srgb, #0b6e86 ${[0, 22, 45, 70, 100][intensity(n)]}%, white)`
const keyContributions = computed(() =>
  highlights.top
    .filter((t) => shownIds.value.has(t.projectId))
    .map((t) => ({ ...t, p: getProject(t.projectId)!, s: statsForProject(getProject(t.projectId)!), proof: evidenceForIds(t.proof) })),
)
const groups = computed(() =>
  capabilities
    .map((c) => ({ ...c, projectIds: c.projectIds.filter((id) => shownIds.value.has(id)) }))
    .filter((c) => !(hide.value && !c.projectIds.length && c.pendingNote)),
)
const hash = (id: string) => id.split('-').pop()
const print = () => window.print()
</script>

<template>
  <div>
    <div class="no-print sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-[#d6dae0] bg-[#f5f6f8] px-4 py-3 text-sm text-[#14171c]">
      <NuxtLink to="/" class="underline">← Back to site</NuxtLink>
      <p class="max-w-xl text-[#4d5560]">
        Print-optimised report. Choose <strong>Save as PDF</strong> in the print dialog, A4, and turn on background graphics if offered.
      </p>
      <button type="button" class="rounded-lg bg-[#14171c] px-4 py-2 font-medium text-white" @click="print">Print / Save as PDF</button>
    </div>

    <div class="mx-auto max-w-[190mm] px-4 py-8 print:p-0">
      <!-- Cover -->
      <section class="flex min-h-[250mm] flex-col justify-between avoid-break">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.18em]" style="color: var(--r-accent)">Confidential · Internal management review</p>
          <h1 class="mt-24 text-5xl font-semibold tracking-tight">Technical Contribution Report</h1>
          <p class="mt-4 text-2xl muted">{{ profile.name }}</p>
          <p class="mt-1 text-lg muted">{{ profile.title }} · {{ profile.organisation }}</p>
        </div>
        <div class="border-t rule pt-4 text-sm muted">
          <p>Prepared {{ today }}. Figures are drawn from git history and classified as Verified, Documented, Self-reported or Pending.</p>
          <p v-if="!hide" class="mt-1">Items marked Pending are placeholders awaiting information from the author and are not claims.</p>
        </div>
      </section>

      <!-- Key contributions -->
      <section class="page-break">
        <h2 class="text-2xl font-semibold">Key contributions</h2>
        <p class="mt-2">{{ highlights.headline }}</p>
        <ol class="mt-5 space-y-3 text-sm">
          <li v-for="t in keyContributions" :key="t.projectId" class="avoid-break border-b rule pb-3">
            <p class="font-semibold">{{ t.p.name }} <span class="muted font-normal">· {{ attributionLabels[t.p.attribution] }} · {{ t.s.mine }} of {{ t.s.total }} commits</span></p>
            <p class="mt-0.5">{{ t.line }}</p>
            <p class="mt-0.5 font-mono text-xs muted">Evidence: {{ t.proof.map((e) => e.id.split('-').pop()).join(', ') }}</p>
          </li>
        </ol>
      </section>

      <!-- Work timeline -->
      <section class="avoid-break mt-8">
        <h2 class="text-2xl font-semibold">Work timeline</h2>
        <p class="mt-1 text-sm muted">Commits per month, by project. Dates are commit dates from git. Gaps do not mean no work.</p>
        <table class="mt-3 w-full border-collapse text-[7pt]">
          <thead>
            <tr>
              <th class="w-32 py-1 text-left font-medium">Project</th>
              <th v-for="m in months" :key="m" class="px-0 text-center font-normal muted">{{ formatMonth(m).replace(' ', '\n') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in rows" :key="r.p.id" class="border-t rule">
              <th class="py-1 pr-1 text-left font-medium">{{ r.p.name.replace(/ \(.*\)/, '') }}</th>
              <td v-for="m in months" :key="m" class="print-exact p-0 text-center" :style="{ background: cellColor(monthlyForProject(r.p)[m] ?? 0) }">
                {{ monthlyForProject(r.p)[m] || '' }}
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- Executive summary -->
      <section class="page-break">
        <h2 class="text-2xl font-semibold">Executive summary</h2>
        <p class="mt-3">{{ profile.intro }}</p>
        <table class="mt-5 w-full text-sm">
          <tbody>
            <tr class="border-b rule"><th scope="row" class="py-2 pr-4 text-left font-medium">Projects documented</th><td>{{ o.projectCount }}<template v-if="o.pendingProjects"> ({{ o.pendingProjects }} pending confirmation)</template></td></tr>
            <tr class="border-b rule"><th scope="row" class="py-2 pr-4 text-left font-medium">Categories</th><td>{{ o.sectors }}</td></tr>
            <tr class="border-b rule"><th scope="row" class="py-2 pr-4 text-left font-medium">Repositories contributed to</th><td>{{ o.repos }} (shared with other developers)</td></tr>
            <tr class="border-b rule"><th scope="row" class="py-2 pr-4 text-left font-medium">Documented contributions</th><td>{{ o.contributionCount }}</td></tr>
            <tr class="border-b rule"><th scope="row" class="py-2 pr-4 text-left font-medium">Linked commits</th><td>{{ o.evidenceCount }}<template v-if="!hide"> (pull requests pending)</template></td></tr>
          </tbody>
        </table>
        <h3 class="mt-8 text-lg font-semibold">Reading this report</h3>
        <p class="mt-2 muted">
          Most repositories have more than one contributor. The share of commits is shown for context only. It indicates activity and
          not the value or difficulty of the work, so each project lists the specific changes made.
        </p>
      </section>

      <!-- Directory -->
      <section class="page-break">
        <h2 class="text-2xl font-semibold">Project directory</h2>
        <table class="mt-4 w-full text-left text-[9.5pt]">
          <thead class="border-b-2 rule"><tr><th class="py-2 pr-2">Project</th><th class="pr-2">Category</th><th class="pr-2">Attribution</th><th class="pr-2">Commits (mine / total)</th><th>Verification</th></tr></thead>
          <tbody>
            <tr v-for="r in rows" :key="r.p.id" class="avoid-break border-b rule align-top">
              <td class="py-2 pr-2 font-medium">{{ r.p.name }}</td>
              <td class="pr-2">{{ categoryLabel(r.p.category) }}</td>
              <td class="pr-2">{{ attributionLabels[r.p.attribution] }}</td>
              <td class="pr-2">{{ r.s.mine }} / {{ r.s.total }}</td>
              <td>{{ verificationLabels[r.p.verification].label }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- Projects -->
      <section v-for="r in rows" :key="r.p.id" class="page-break">
        <p class="text-xs font-semibold uppercase tracking-[0.14em]" style="color: var(--r-accent)">{{ categoryLabel(r.p.category) }}</p>
        <h2 class="mt-1 text-2xl font-semibold">{{ r.p.name }}</h2>
        <p class="mt-2">{{ r.p.summary }}</p>
        <dl class="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <div v-if="!(hide && r.p.status === 'unknown')"><dt class="muted">Status</dt><dd>{{ statusLabels[r.p.status] }}</dd></div>
          <div><dt class="muted">Live URL</dt><dd>{{ r.p.liveUrl ?? 'None' }}</dd></div>
          <div><dt class="muted">Period (my commits)</dt><dd>{{ r.s.first ? `${formatDate(r.s.first)} to ${formatDate(r.s.last)}` : '—' }}</dd></div>
          <div><dt class="muted">Commits (mine / total)</dt><dd>{{ r.s.mine }} / {{ r.s.total }}</dd></div>
          <div class="col-span-2"><dt class="muted">Role</dt><dd>{{ r.p.role }}</dd></div>
          <div class="col-span-2"><dt class="muted">Team and attribution</dt><dd>{{ r.p.teamNote }}</dd></div>
        </dl>

        <h3 class="mt-5 text-base font-semibold">Contributions</h3>
        <ul class="mt-2 list-disc space-y-1 pl-5 text-sm">
          <li v-for="(c, i) in r.p.contributions" :key="i" class="avoid-break">
            {{ c.text }} <span class="muted">[{{ verificationLabels[c.status].label }}]</span>
          </li>
        </ul>

        <h3 class="mt-5 text-base font-semibold">Technologies in the repositories</h3>
        <p class="mt-1 text-sm">{{ r.p.technologies.map((t) => t.name).join(', ') }}</p>

        <h3 class="mt-5 text-base font-semibold">Selected evidence</h3>
        <table class="mt-2 w-full text-left text-[9pt]">
          <tbody>
            <tr v-for="e in evidenceForProject(r.p.id).slice(0, 8)" :key="e.id" class="avoid-break border-b rule align-top">
              <td class="w-16 py-1 pr-2 font-mono">{{ hash(e.id) }}</td>
              <td class="w-20 pr-2">{{ formatDate(e.date, { day: 'numeric', month: 'short', year: '2-digit' }) }}</td>
              <td>{{ e.title }}</td>
            </tr>
          </tbody>
        </table>
        <p v-if="evidenceForProject(r.p.id).length > 8" class="mt-1 text-xs muted">
          Showing 8 of {{ evidenceForProject(r.p.id).length }} linked commits. The full list is on the website.
        </p>

        <h3 v-if="!(hide && typeof r.p.businessRelevance !== 'string')" class="mt-5 text-base font-semibold">Business relevance</h3>
        <p v-if="!(hide && typeof r.p.businessRelevance !== 'string')" class="mt-1 text-sm">
          <template v-if="typeof r.p.businessRelevance === 'string'">{{ r.p.businessRelevance }}</template>
          <template v-else><em class="muted">Pending: {{ r.p.businessRelevance.needed }}</em></template>
        </p>
      </section>

      <!-- Capabilities -->
      <section class="page-break">
        <h2 class="text-2xl font-semibold">Technical capabilities</h2>
        <div v-for="c in groups" :key="c.id" class="avoid-break mt-4">
          <h3 class="text-base font-semibold">{{ c.group }}</h3>
          <p class="mt-1 text-sm">{{ c.summary }}</p>
          <p v-if="c.projectIds.length" class="mt-1 text-xs muted">Evidenced in: {{ c.projectIds.map((id) => getProject(id)?.name).join('; ') }}</p>
          <p v-if="c.pendingNote && !hide" class="mt-1 text-xs"><em class="muted">Pending: {{ c.pendingNote }}</em></p>
        </div>
      </section>

      <!-- Chatbots and research -->
      <section class="page-break">
        <h2 class="text-2xl font-semibold">Chatbot and AI development</h2>
        <p v-if="shownBots.length" class="mt-2 text-sm muted">
          {{ shownBots.length }} chatbot{{ shownBots.length === 1 ? "" : "s" }} on SendPulse, Kenyan numbers (retrieved {{ formatDate(botRetrievedAt) }}).
          The WhatsApp chatbots were built by Wayne Gift Ludenyi and Kingsley (self-reported). Inbox conversations are not a count of users.
        </p>
        <table v-if="shownBots.length" class="mt-3 w-full text-left text-[8.5pt]">
          <thead class="border-b-2 rule"><tr><th class="py-1 pr-2">Bot</th><th class="pr-2">Channel</th><th class="pr-2">Created</th><th class="text-right">Inbox conv.</th></tr></thead>
          <tbody>
            <tr v-for="b in shownBots" :key="b.id" class="avoid-break border-b rule">
              <td class="py-0.5 pr-2">{{ b.name }}<template v-if="b.projectId"> <span class="muted">(under {{ getProject(b.projectId)?.name }})</span></template></td>
              <td class="pr-2">{{ b.channel === 'LIVE_CHAT' ? 'Live chat' : b.channel[0] + b.channel.slice(1).toLowerCase() }}</td>
              <td class="pr-2">{{ b.createdAt }}</td>
              <td class="text-right">{{ b.inboxTotal.toLocaleString('en-GB') }}</td>
            </tr>
          </tbody>
        </table>
        <h2 class="mt-10 text-2xl font-semibold">Research, innovation and proofs of concept</h2>
        <div v-for="r in research" :key="r.id" class="avoid-break mt-3">
          <h3 class="text-base font-semibold">{{ r.title }}</h3>
          <p class="mt-1 text-sm"><strong>Purpose.</strong> {{ r.purpose }}</p>
          <p class="mt-1 text-sm"><strong>Approach.</strong> {{ r.approach }}</p>
          <p class="mt-1 text-sm"><strong>Value and limits.</strong> {{ r.valueAndLimits }}</p>
        </div>
      </section>

      <!-- Summary -->
      <section class="page-break">
        <h2 class="text-2xl font-semibold">Summary of contributions</h2>
        <ul class="mt-3 list-disc space-y-1.5 pl-5 text-sm">
          <li>{{ o.projectCount }} projects across {{ o.sectors }} categories, shared with other developers where noted.</li>
          <li>Front-end work in Vue/Nuxt, React/Next.js and Flutter; back-end work in Nuxt server routes and FastAPI; data modelling in Postgres.</li>
          <li>Integrations: WhatsApp ordering, subscription click tracking and consent redirect, push notifications, real-time socket events, mobile-to-API wiring.</li>
          <li>AI and conversational: contributions to the HR Assistant, and WhatsApp chatbots built with a colleague, Kingsley (self-reported).</li>
          <li>Research: multi-country, bilingual Zuri Health front-end proof of concept.</li>
        </ul>
        <h3 v-if="!hide" class="mt-6 text-base font-semibold">Outstanding items</h3>
        <ul v-if="!hide" class="mt-2 list-disc space-y-1 pl-5 text-sm muted">
          <li>Pull requests; screenshots and recordings.</li>
          <li>Business outcomes and metrics the organisation is willing to cite.</li>
        </ul>
      </section>
    </div>
  </div>
</template>
