<script setup lang="ts">
import type { ChatbotRecord } from '~/types/content'
defineProps<{ bot: ChatbotRecord }>()
const channelIcon: Record<string, string> = {
  WHATSAPP: 'simple-icons:whatsapp',
  INSTAGRAM: 'simple-icons:instagram',
  LIVE_CHAT: 'lucide:message-square',
}
const channelName: Record<string, string> = { WHATSAPP: 'WhatsApp', INSTAGRAM: 'Instagram', LIVE_CHAT: 'Website live chat' }
</script>

<template>
  <li class="card flex items-center gap-3 !rounded-xl p-3 sm:p-4">
    <span class="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line text-accent">
      <Icon :name="channelIcon[bot.channel] ?? 'lucide:bot'" class="h-4 w-4" aria-hidden="true" />
    </span>
    <div class="min-w-0 flex-1">
      <p class="break-words text-sm font-medium leading-snug">{{ bot.name }}</p>
      <p class="text-xs text-muted">{{ channelName[bot.channel] ?? bot.channel }} · {{ formatDate(bot.createdAt, { month: 'short', year: 'numeric' }) }}</p>
    </div>
    <div class="shrink-0 text-right" title="Conversations in the bot inbox, not a count of users">
      <p class="text-sm font-medium tabular-nums">{{ bot.inboxTotal.toLocaleString('en-GB') }}</p>
      <p class="text-[11px] text-muted">conversations</p>
    </div>
  </li>
</template>
