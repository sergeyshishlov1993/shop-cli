interface UtmData {
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
  utmContent: string | null
  utmTerm: string | null
  referer: string | null
}

const UTM_STORAGE_KEY = 'utm-data'

export function useUtm() {
  function captureUtm() {
    if (import.meta.server || sessionStorage.getItem(UTM_STORAGE_KEY)) {
      return
    }

    const route = useRoute()

    const utmData: UtmData = {
      utmSource: getQueryValue(route.query.utm_source),
      utmMedium: getQueryValue(route.query.utm_medium),
      utmCampaign: getQueryValue(route.query.utm_campaign),
      utmContent: getQueryValue(route.query.utm_content),
      utmTerm: getQueryValue(route.query.utm_term),
      referer: document.referrer || null,
    }

    sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utmData))
  }

  function getUtmData(): UtmData {
    const storedValue = import.meta.server ? null : sessionStorage.getItem(UTM_STORAGE_KEY)

    if (storedValue) {
      try {
        return JSON.parse(storedValue) as UtmData
      }
      catch { /* битые данные — отдаём пустые */ }
    }

    return {
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      utmContent: null,
      utmTerm: null,
      referer: null,
    }
  }

  return {
    captureUtm,
    getUtmData,
  }
}

function getQueryValue(value: string | null | (string | null)[] | undefined): string | null {
  if (Array.isArray(value)) {
    return value[0] ?? null
  }

  return value ?? null
}
