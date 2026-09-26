import { useAuthStore } from '~/modules/auth/authStore'

const ACCESS_TOKEN_COOKIE = 'shop_access_token'
let clientAccessToken: string | null = null
let clientAccessTokenCookie: ReturnType<typeof useAccessTokenCookie> | null = null

function useAccessTokenCookie() {
  return useCookie<string | null>(ACCESS_TOKEN_COOKIE, {
    default: () => null,
    maxAge: 15 * 60,
    path: '/',
    sameSite: 'lax',
    secure: import.meta.env.PROD,
  })
}

export function getAccessToken(): string | null {
  if (import.meta.client) {
    return clientAccessToken ?? clientAccessTokenCookie?.value ?? null
  }

  return useAccessTokenCookie().value
}

export function setAccessToken(token: string | null): void {
  if (import.meta.client) {
    clientAccessToken = token
    if (clientAccessTokenCookie) {
      clientAccessTokenCookie.value = token
    }
    return
  }

  useAccessTokenCookie().value = token
}

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const accessTokenCookie = useAccessTokenCookie()
  const apiBase = import.meta.dev ? '/api' : config.public.apiBase
  let refreshPromise: Promise<string | null> | null = null
  // На SSR $fetch не бачить cookie браузера — прокидуємо їх, інакше бек не впізнає сесію (кошик гостя тощо).
  const ssrCookie = import.meta.server ? useRequestHeaders(['cookie']).cookie : undefined

  if (import.meta.client) {
    clientAccessTokenCookie = accessTokenCookie
    clientAccessToken ??= accessTokenCookie.value
  }

  function readAccessToken(): string | null {
    return import.meta.client
      ? clientAccessToken ?? accessTokenCookie.value
      : accessTokenCookie.value
  }

  function writeAccessToken(token: string | null): void {
    if (import.meta.client) {
      clientAccessToken = token
    }
    accessTokenCookie.value = token
  }

  async function clearAuthAndRedirect(): Promise<void> {
    await nuxtApp.runWithContext(async () => {
      useAuthStore().clearAuth()
      await navigateTo('/login')
    })
  }

  async function refreshAccessToken(): Promise<string | null> {
    try {
      const response = await $fetch<{ accessToken: string }>('/auth/refresh', {
        baseURL: apiBase,
        method: 'POST',
        credentials: 'include',
      })

      writeAccessToken(response.accessToken)
      return response.accessToken
    }
    catch {
      writeAccessToken(null)
      return null
    }
  }

  const api = $fetch.create({
    baseURL: apiBase,
    credentials: 'include',

    onRequest({ options }) {
      const accessToken = readAccessToken()
      if (!accessToken && !ssrCookie) {
        return
      }

      const headers = new Headers(options.headers)
      if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`)
      if (ssrCookie && !headers.has('cookie')) headers.set('cookie', ssrCookie)
      options.headers = headers
    },

    async onResponseError(context) {
      const { response, request, options } = context

      if (response.status !== 401) {
        return
      }

      if (String(request).includes('/auth/refresh')) {
        await clearAuthAndRedirect()
        return
      }

      refreshPromise ??= refreshAccessToken()
      const newToken = await refreshPromise
      refreshPromise = null

      if (newToken) {
        const headers = new Headers(options.headers)
        headers.set('Authorization', `Bearer ${newToken}`)
        options.headers = headers

        return $fetch(String(request), options as Parameters<typeof $fetch>[1])
      }

      await clearAuthAndRedirect()
    },
  })

  return {
    provide: {
      api,
    },
  }
})
