import { useAuthStore } from '~/modules/auth/authStore'

const ACCESS_TOKEN_COOKIE = 'shop_access_token'
// ref, а не змінна: authStore.isAuthenticated має реагувати на вихід/оновлення токена
const clientAccessToken = ref<string | null>(null)
// Маркер «була сесія»: refresh-cookie httpOnly, тож без нього не знаємо, чи варто пробувати refresh при старті
const SESSION_HINT_KEY = 'shop_has_session'
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
    return clientAccessToken.value ?? clientAccessTokenCookie?.value ?? null
  }

  return useAccessTokenCookie().value
}

export function setAccessToken(token: string | null): void {
  if (import.meta.client) {
    clientAccessToken.value = token
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
    clientAccessToken.value ??= accessTokenCookie.value
  }

  function readAccessToken(): string | null {
    return import.meta.client
      ? clientAccessToken.value ?? accessTokenCookie.value
      : accessTokenCookie.value
  }

  function writeAccessToken(token: string | null): void {
    if (import.meta.client) {
      clientAccessToken.value = token
      try { token ? localStorage.setItem(SESSION_HINT_KEY, '1') : localStorage.removeItem(SESSION_HINT_KEY) } catch { /* storage недоступний */ }
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

  // Один refresh на всі паралельні запити
  const refresh = () => (refreshPromise ??= refreshAccessToken().finally(() => (refreshPromise = null)))

  const baseApi = $fetch.create({
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
  })

  // Повтор після 401 робимо тут, а не в onResponseError: ofetch ігнорує значення, яке повертає хук,
  // і все одно кидає початкову помилку — тоді сторінка отримувала 401 навіть після вдалого refresh.
  const api = (async (request, options) => {
    try {
      return await baseApi(request, options)
    }
    catch (error) {
      if ((error as { status?: number }).status !== 401) throw error
      if (await refresh()) return baseApi(request, options)
      await clearAuthAndRedirect()
      throw error
    }
  }) as typeof baseApi

  // Сесія протухла, поки вкладка була закрита: тихо відновлюємо за refresh-cookie і на публічних сторінках
  if (import.meta.client && !readAccessToken()) {
    let hadSession = false
    try { hadSession = localStorage.getItem(SESSION_HINT_KEY) === '1' } catch { /* storage недоступний */ }
    if (hadSession) nuxtApp.hook('app:mounted', () => { refresh() })
  }

  return {
    provide: {
      api,
      // Для middleware: відновити сесію за refresh-cookie, коли access-токен уже протух
      refreshAccessToken: refresh,
    },
  }
})
