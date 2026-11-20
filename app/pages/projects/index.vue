<script setup lang="ts">
useHead({ title: 'Projects · Technical Contributions' })
const { shownProjects } = usePresentation()
const route = useRoute()
const router = useRouter()

const q = ref(String(route.query.q ?? ''))
const category = ref(String(route.query.category ?? 'all'))
const verification = ref(String(route.query.verification ?? 'all'))

watch([q, category, verification], () => {
  router.replace({
    query: {
      q: q.value || undefined,
      category: category.value === 'all' ? undefined : category.value,
      verification: verification.value === 'all' ? undefined : verification.value,
    },
  })
})

const filtered = computed(() => {
  const term = q.value.trim().toLowerCase()
  return shownProjects.value.filter((p) => {
    if (category.value !== 'all' && p.category !== category.value) return false
    if (verification.value !== 'all' && p.verification !== verification.value) return false
    if (!term) return true
    const hay = [p.name, p.summary, p.sector, p.role, ...p.technologies.map((t) => t.name), ...p.contributions.map((c) => c.text)]
      .join(' ')
      .toLowerCase()
    return hay.includes(term)
  })
})

const reset = () => {
  q.value = ''
  category.value = 'all'
  verification.value = 'all'
}
</script>

<template>
  <div class="container-page py-12">
    <p class="eyebrow">Page 2</p>
    <h1 class="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Projects</h1>
    <p class="lead mt-3 max-w-3xl">Systems I built or helped build. Open a preview to visit the live site, or Details for what I did.</p>

    <form class="mt-8 grid gap-3 md:grid-cols-[1fr_auto_auto_auto]" role="search" @submit.prevent>
      <div>
        <label for="q" class="sr-only">Search projects</label>
        <div class="relative">
          <Icon name="lucide:search" class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input
            id="q"
            v-model="q"
            type="search"
            placeholder="Search by project, technology or contribution"
            class="w-full rounded-lg border border-line bg-surface py-2 pl-9 pr-3 text-sm text-fg placeholder:text-muted"
          />
        </div>
      </div>
      <div>
        <label for="cat" class="sr-only">Category</label>
        <select id="cat" v-model="category" class="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-fg">
          <option value="all">All categories</option>
          <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.label }}</option>
        </select>
      </div>
      <div>
        <label for="ver" class="sr-only">Verification</label>
        <select id="ver" v-model="verification" class="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-fg">
          <option value="all">Any verification</option>
          <option v-for="(v, k) in verificationLabels" :key="k" :value="k">{{ v.label }}</option>
        </select>
      </div>
      <button type="button" class="btn justify-center" @click="reset">Reset</button>
    </form>

    <p class="mt-4 text-sm text-muted" role="status" aria-live="polite">{{ filtered.length }} of {{ shownProjects.length }} projects</p>

    <ul v-if="filtered.length" class="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      <li v-for="p in filtered" :key="p.id"><ProjectShowcaseCard :project="p" /></li>
    </ul>
    <div v-else class="card mt-6 p-8 text-center">
      <p class="font-medium">No projects match these filters.</p>
      <button type="button" class="btn mt-4" @click="reset">Clear filters</button>
    </div>

    <p v-if="category === 'conversational-ai' || category === 'all'" class="mt-8 text-sm text-muted">
      Chatbot projects have their own page:
      <NuxtLink to="/chatbots" class="link">Chatbot and AI development</NuxtLink>.
    </p>
  </div>
</template>
