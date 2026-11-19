<script setup lang="ts">
import { botAttribution } from '~~/content/evidence/chatbot-ownership'
useHead({ title: 'Chatbot and AI development · Technical Contributions' })

const { hide, shownBots } = usePresentation()
const q = ref('')
const visible = ref(30)

const channelCount = (c: string) => shownBots.value.filter((b) => b.channel === c).length
const featured = computed(() =>
  featuredBotNames
    .map((n) => ({ name: n, bot: shownBots.value.find((b) => b.name === n) }))
    .filter((f) => f.bot),
)
const moved = computed(() => shownBots.value.filter((b) => b.projectId))
const listable = computed(() => shownBots.value.filter((b) => !b.projectId))
const filtered = computed(() => {
  const term = q.value.trim().toLowerCase()
  return listable.value.filter((b) => !term || b.name.toLowerCase().includes(term))
})
watch(q, () => (visible.value = 30))

const aiEvidence = evidenceForIds(['hr-backend-1e61308', 'hr-backend-d0c52a1', 'hr-frontend-105ac54'])
</script>

<template>
  <div class="container-page space-y-8 py-6 lg:py-2">
    <header>
      <p class="num">Page 3</p>
      <h1 class="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Chatbot and AI development</h1>
      <p class="lead mt-3 max-w-3xl">
        WhatsApp virtual-hospital and consumer chatbots on SendPulse, built by Wayne Gift Ludenyi and Kingsley, plus
        AI-assisted features in repositories.
      </p>
    </header>

    <template v-if="shownBots.length">
      <section class="grid gap-3 sm:grid-cols-3" aria-label="Chatbot totals">
        <StatTile :value="shownBots.length" label="Chatbots" />
        <StatTile :value="channelCount('WHATSAPP')" label="WhatsApp chatbots" />
        <StatTile :value="channelCount('INSTAGRAM') + channelCount('LIVE_CHAT')" label="Instagram and website chat bots" />
      </section>

      <section class="card space-y-2 p-5 text-sm">
        <p class="font-medium">How to read these figures</p>
        <ul class="list-disc space-y-1 pl-5 text-muted">
          <li>
            Source: SendPulse chatbots API, read-only, retrieved {{ formatDate(botRetrievedAt) }}. Only bot names, channels,
            creation dates and inbox totals were read. No contacts or messages were accessed.
          </li>
          <li>Scope: {{ botScope }}. Bots serving other countries are not listed.</li>
          <li>{{ botAttribution }} This covers the WhatsApp chatbots. Instagram and website chat bots are listed but not claimed.</li>
          <li>
            "Inbox conversations" is the number of conversations in a bot's inbox. It is <strong class="text-fg">not</strong> a count of users.
          </li>
        </ul>
      </section>

      <section v-if="featured.length" aria-labelledby="named">
        <h2 id="named" class="h-section !text-xl">Client virtual-hospital bots</h2>
        <ul class="mt-4 grid gap-4 lg:grid-cols-3">
          <li v-for="f in featured" :key="f.name" class="card flex flex-col p-5">
            <div class="flex items-start justify-between gap-2">
              <Icon name="simple-icons:whatsapp" class="h-5 w-5 text-accent" aria-hidden="true" />
              <VerificationBadge status="self-reported" />
            </div>
            <h3 class="mt-3 font-medium">{{ f.name }}</h3>
            <p class="mt-1 text-xs text-muted">
              Created {{ formatDate(f.bot!.createdAt) }} · {{ f.bot!.inboxTotal.toLocaleString('en-GB') }} inbox conversations
            </p>
            <p class="mt-3 text-sm text-muted">Built by Wayne Gift Ludenyi and Kingsley.</p>
          </li>
        </ul>
      </section>

      <section v-if="listable.length" aria-labelledby="all">
        <div class="flex flex-wrap items-end justify-between gap-2">
          <h2 id="all" class="h-section !text-xl">All chatbots ({{ listable.length }})</h2>
          <p v-if="moved.length" class="text-xs text-muted">
            {{ moved.length }} bot{{ moved.length === 1 ? '' : 's' }} shown under
            <NuxtLink v-for="m in moved" :key="m.id" :to="`/projects/${m.projectId}`" class="link">{{ getProject(m.projectId!)?.name }}</NuxtLink>
          </p>
        </div>

        <form class="mt-4" role="search" @submit.prevent>
          <label for="bq" class="sr-only">Search bots</label>
          <div class="relative">
            <Icon name="lucide:search" class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input id="bq" v-model="q" type="search" placeholder="Search bots by name" class="w-full rounded-full border border-line bg-surface py-2 pl-9 pr-3 text-sm text-fg placeholder:text-muted" />
          </div>
        </form>

        <p class="mt-3 text-sm text-muted" role="status" aria-live="polite">{{ filtered.length }} bots</p>
        <ul class="mt-3 grid gap-2 md:grid-cols-2">
          <BotRow v-for="b in filtered.slice(0, visible)" :key="b.id" :bot="b" />
        </ul>
        <button v-if="filtered.length > visible" type="button" class="btn mt-4" @click="visible += 30">Show more</button>
      </section>
    </template>

    <section aria-labelledby="ai">
      <h2 id="ai" class="h-section !text-xl">AI-assisted features with repository evidence</h2>
      <div class="card mt-4 p-5">
        <div class="flex flex-wrap items-start justify-between gap-2">
          <h3 class="font-medium">HR Assistant · The Play Group HR</h3>
          <VerificationBadge status="verified" />
        </div>
        <p class="mt-2 max-w-3xl text-sm text-muted">
          An assistant inside the HR platform. My commits cover backend support for it, making it tolerate misconfigured server
          keys and show administrators why it fails, and fixing the chat layout on phones. Frank Omondi authored most of the repository.
        </p>
        <ul class="mt-4 space-y-2"><EvidenceItem v-for="e in aiEvidence" :key="e.id" :item="e" /></ul>
        <div class="mt-4"><PendingNote>Which model provider the HR Assistant uses in production (both OpenAI and Google GenAI SDKs are in the backend requirements), and your part in its design.</PendingNote></div>
      </div>
    </section>

    <section v-if="!hide" aria-labelledby="stack">
      <h2 id="stack" class="h-section !text-xl">Stated AI and automation stack</h2>
      <p class="mt-2 text-sm text-muted">Self-reported. Items are not tied to projects until evidence is supplied.</p>
      <ul class="mt-4 flex flex-wrap gap-2">
        <li v-for="t in profile.statedStack.ai" :key="t" class="chip !text-sm">{{ t }} <span class="ml-1 text-muted">· self-reported</span></li>
      </ul>
    </section>
  </div>
</template>
