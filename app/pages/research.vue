<script setup lang="ts">
useHead({ title: 'Research, innovation and proofs of concept · Technical Contributions' })
const { hide } = usePresentation()
</script>

<template>
  <div class="container-page py-12">
    <p class="eyebrow">Page 6</p>
    <h1 class="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Research, innovation and proofs of concept</h1>
    <p class="lead mt-3 max-w-3xl">
      Technical work that may not have reached production. Each entry states its purpose and approach, and is explicit about
      production readiness.
    </p>

    <ul class="mt-10 space-y-6">
      <li v-for="r in research" :key="r.id" class="card p-6">
        <div class="flex flex-wrap items-start justify-between gap-2">
          <h2 class="text-xl font-semibold tracking-tight">{{ r.title }}</h2>
          <VerificationBadge :status="r.status" />
        </div>
        <dl class="mt-4 grid gap-5 text-sm md:grid-cols-3">
          <div><dt class="font-medium">Purpose</dt><dd class="mt-1 text-muted">{{ r.purpose }}</dd></div>
          <div><dt class="font-medium">Technical approach</dt><dd class="mt-1 text-muted">{{ r.approach }}</dd></div>
          <div><dt class="font-medium">Value and limits</dt><dd class="mt-1 text-muted">{{ r.valueAndLimits }}</dd></div>
        </dl>
        <div v-if="r.projectId" class="mt-5 flex flex-wrap items-center gap-4 text-sm">
          <NuxtLink :to="`/projects/${r.projectId}`" class="link">Contribution detail and commits</NuxtLink>
          <span class="text-muted">{{ statsForProject(getProject(r.projectId)!).mine }} of {{ statsForProject(getProject(r.projectId)!).total }} commits are mine</span>
        </div>
      </li>
    </ul>

    <section v-if="!hide" class="mt-12" aria-labelledby="more">
      <h2 id="more" class="h-section !text-xl">Other candidates</h2>
      <p class="mt-2 max-w-3xl text-sm text-muted">
        Some work may qualify as research or prototyping but has no distinguishing record yet. Add it to
        <code class="font-mono text-xs">content/site.ts</code> once you confirm it.
      </p>
      <div class="mt-4"><PendingNote>
        Candidates to confirm: the WhatsApp virtual-hospital chatbots, the HR Assistant design, and any architecture experiments not in git.
      </PendingNote></div>
    </section>
  </div>
</template>
