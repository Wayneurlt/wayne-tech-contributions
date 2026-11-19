<script setup lang="ts">
import { navLinks } from './navLinks'
const open = ref(false)
const route = useRoute()
watch(() => route.fullPath, () => (open.value = false))
const isActive = (to: string) => (to === '/' ? route.path === '/' : route.path.startsWith(to))
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur">
    <div class="container-page flex h-14 items-center justify-between gap-4">
      <NuxtLink to="/" class="flex items-center gap-2 text-sm font-semibold tracking-tight">
        <span class="grid h-7 w-7 place-items-center rounded-full bg-accent text-xs font-bold text-[#04121a]" aria-hidden="true">W</span>
        <span>Technical Contributions</span>
      </NuxtLink>
      <button class="btn !py-1.5" type="button" :aria-expanded="open" aria-controls="mobile-nav" @click="open = !open">
        <Icon :name="open ? 'lucide:x' : 'lucide:menu'" class="h-4 w-4" aria-hidden="true" />
        Menu
      </button>
    </div>
    <nav v-show="open" id="mobile-nav" aria-label="Mobile" class="border-t border-line bg-surface">
      <ul class="container-page flex flex-col py-2">
        <li v-for="l in navLinks" :key="l.to">
          <NuxtLink :to="l.to" class="flex items-center gap-3 rounded-lg px-2 py-3 text-sm" :class="isActive(l.to) ? 'text-accent' : 'text-fg'" :aria-current="isActive(l.to) ? 'page' : undefined">
            <Icon :name="l.icon" class="h-4 w-4" aria-hidden="true" /> {{ l.label }}
          </NuxtLink>
        </li>
        <li>
          <NuxtLink to="/report" class="flex items-center gap-3 rounded-lg px-2 py-3 text-sm text-fg">
            <Icon name="lucide:file-down" class="h-4 w-4" aria-hidden="true" /> PDF report
          </NuxtLink>
        </li>
      </ul>
    </nav>
  </header>
</template>
