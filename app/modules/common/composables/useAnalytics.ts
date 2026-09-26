// Единая точка отправки e-commerce событий (2.2).
// Толкает в dataLayer (GTM/GA4) и в fbq (Meta Pixel), если они загружены.
// Безопасно вызывать всегда: без сконфигурированных ID это no-op.

type TrackPayload = Record<string, unknown>

declare global {
  interface Window {
    dataLayer?: unknown[]
    fbq?: (...args: unknown[]) => void
  }
}

export function useAnalytics() {
  function track(event: string, payload: TrackPayload = {}) {
    if (import.meta.server) return
    try {
      window.dataLayer?.push({ event, ...payload })
      if (typeof window.fbq === 'function') {
        window.fbq('trackCustom', event, payload)
      }
    }
    catch { /* аналитика не должна ломать UX */ }
  }

  return { track }
}
