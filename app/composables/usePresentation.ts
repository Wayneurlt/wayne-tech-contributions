import { isMyBot } from '~~/content/evidence/chatbot-ownership'

/**
 * Presentation mode: hides every placeholder and everything not yet confirmed,
 * so the site and PDF contain only evidenced content. Off by default, remembered
 * in this browser (see plugins/presentation.client.ts).
 */
export const usePresentation = () => {
  const hide = useState<boolean>('hidePending', () => false)
  const shownProjects = computed(() => (hide.value ? projects.filter((p) => p.verification !== 'pending') : projects))
  const shownBots = computed(() => (hide.value ? bots.filter(isMyBot) : bots))
  const toggle = () => (hide.value = !hide.value)
  return { hide, shownProjects, shownBots, toggle }
}
