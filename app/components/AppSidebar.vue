<script setup lang="ts">
import { navLinks } from './navLinks'
const route = useRoute()
const isActive = (to: string) => (to === '/' ? route.path === '/' : route.path.startsWith(to))
const initials = profile.name.split(' ').map((w) => w[0]).slice(0, 2).join('')
</script>

<template>
  <aside class="card sticky top-4 h-[calc(100vh-2rem)] flex-col overflow-y-auto p-5" aria-label="Site">
    <div class="text-center">
      <div
        class="mx-auto grid h-24 w-24 place-items-center rounded-full border border-line text-2xl font-semibold text-accent"
        style="background: radial-gradient(circle at 30% 25%, color-mix(in srgb, var(--color-accent) 22%, var(--color-surface)), var(--color-surface))"
        aria-hidden="true"
      >
        {{ initials }}
      </div>
      <p class="mt-4 text-xs text-muted">{{ profile.title }}</p>
      <p class="mt-1 text-lg font-semibold tracking-tight">{{ profile.name }}</p>
      <p class="text-xs text-muted">{{ profile.organisation }}</p>
      <div class="mt-4 flex flex-wrap justify-center gap-2">
        <NuxtLink to="/report" class="btn btn-accent !px-4 !py-1.5 text-xs">PDF report</NuxtLink>
        <NuxtLink to="/summary" class="btn !px-4 !py-1.5 text-xs">Summary</NuxtLink>
      </div>
    </div>

    <nav aria-label="Primary" class="mt-6 border-t border-line pt-4">
      <ul class="space-y-1">
        <li v-for="l in navLinks" :key="l.to">
          <NuxtLink
            :to="l.to"
            class="flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors"
            :class="isActive(l.to) ? 'bg-surface text-fg shadow-[inset_0_0_0_1px_var(--color-line)]' : 'text-muted hover:text-fg'"
            :aria-current="isActive(l.to) ? 'page' : undefined"
          >
            <Icon :name="l.icon" class="h-4 w-4" :class="isActive(l.to) ? 'text-accent' : ''" aria-hidden="true" />
            {{ l.label }}
          </NuxtLink>
        </li>
      </ul>
    </nav>

    <div class="mt-auto space-y-3 pt-6 text-xs text-muted">
      <p class="flex items-center gap-1.5"><Icon name="lucide:lock" class="h-3 w-3" aria-hidden="true" /> Confidential, internal review</p>
    </div>
  </aside>
</template>
