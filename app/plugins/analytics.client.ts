// Загружает Google Tag Manager (2.2) только при: заданном ID и согласии cookie.
// GA4 и Meta Pixel настраиваются как теги внутри GTM-контейнера.
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const gtmId = config.public.gtmId
  if (!gtmId) return

  let consent: string | null = null
  try {
    consent = localStorage.getItem('cookie-consent')
  }
  catch { /* приватный режим — просто не грузим */ }
  if (consent !== 'all') return

  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({ 'gtm.start': Date.now(), 'event': 'gtm.js' })

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`
  document.head.appendChild(script)
})
