/**
 * Restores presentation mode from this browser. A link with ?present=1 switches it on
 * (and ?present=0 off), which is handy for opening the site straight into a clean view.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const hide = useState<boolean>('hidePending', () => false)
  const save = (v: boolean) => { try { localStorage.setItem('hidePending', v ? '1' : '0') } catch { /* storage unavailable */ } }

  nuxtApp.hook('app:mounted', () => {
    const param = new URLSearchParams(window.location.search).get('present')
    if (param === '1' || param === '0') {
      hide.value = param === '1'
      save(hide.value)
    } else {
      try { hide.value = localStorage.getItem('hidePending') === '1' } catch { /* ignore */ }
    }
    watch(hide, save)
  })
})
