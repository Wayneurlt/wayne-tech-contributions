<script setup lang="ts">
import type { Verification } from '~/types/content'
const props = defineProps<{ status: Verification }>()
const styles: Record<Verification, string> = {
  verified: 'text-ok border-ok/40',
  documented: 'text-info border-info/40',
  'self-reported': 'text-muted border-line',
  pending: 'text-warn border-warn/50',
}
const icons: Record<Verification, string> = {
  verified: 'lucide:badge-check',
  documented: 'lucide:file-text',
  'self-reported': 'lucide:user',
  pending: 'lucide:clock',
}
</script>

<template>
  <span
    class="inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium"
    :class="styles[props.status]"
    :title="verificationLabels[props.status].description"
  >
    <Icon :name="icons[props.status]" class="h-3 w-3" aria-hidden="true" />
    {{ verificationLabels[props.status].label }}
  </span>
</template>
