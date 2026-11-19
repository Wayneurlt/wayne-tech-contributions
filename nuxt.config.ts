import tailwindcss from '@tailwindcss/vite'

// Private-first: the site is not indexed, and access can be gated server-side
// (see server/middleware/auth.ts and the README).
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  modules: ['@nuxt/icon', '@nuxt/fonts'],
  css: ['~/assets/css/main.css'],
  vite: { plugins: [tailwindcss()] },
  fonts: {
    families: [{ name: 'Inter', provider: 'google', weights: [400, 500, 600, 700] }],
  },
  icon: { serverBundle: 'local', clientBundle: { scan: true } },
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'Technical Contributions',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'robots', content: 'noindex, nofollow, noarchive' },
        { name: 'color-scheme', content: 'dark light' },
        { name: 'description', content: 'Private technical contribution report. Not for public distribution.' },
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },
  routeRules: {
    '/**': { headers: { 'X-Robots-Tag': 'noindex, nofollow, noarchive', 'Referrer-Policy': 'no-referrer' } },
  },
  typescript: { strict: true },
})
