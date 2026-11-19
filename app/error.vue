<script setup lang="ts">
import type { NuxtError } from '#app'
const props = defineProps<{ error: NuxtError }>()
const is404 = computed(() => props.error.statusCode === 404)
useHead({ title: is404.value ? 'Not found' : 'Something went wrong', meta: [{ name: 'robots', content: 'noindex' }] })
</script>

<template>
  <div class="grid min-h-screen place-items-center bg-bg px-4 text-center text-fg">
    <div>
      <p class="eyebrow">{{ error.statusCode }}</p>
      <h1 class="mt-3 text-3xl font-semibold tracking-tight">{{ is404 ? 'Page not found' : 'Something went wrong' }}</h1>
      <p class="mt-3 text-muted">{{ is404 ? 'That page or project does not exist.' : 'Please try again.' }}</p>
      <button class="btn btn-accent mt-6" type="button" @click="clearError({ redirect: '/' })">Back to overview</button>
    </div>
  </div>
</template>
