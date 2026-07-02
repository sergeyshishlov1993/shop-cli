let accessToken: string | null = null

export function getAccessToken(): string | null {
  return accessToken
}

export function setAccessToken(token: string | null): void {
  accessToken = token
}

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  let refreshPromise: Promise<string | null> | null = null

  async function refreshAccessToken(): Promise<string | null> {
    try {
      const response = await $fetch<{ accessToken: string }>('/auth/refresh', {
        baseURL: config.public.apiBase,
        method: 'POST',
        credentials: 'include',
      })

      accessToken = response.accessToken
      return accessToken
    }
    catch {
      accessToken = null
      return null
    }
  }

  const api = $fetch.create({
    baseURL: config.public.apiBase,
    credentials: 'include',

    onRequest({ options }) {
      if (!accessToken) {
        return
      }

      options.headers = {
        ...(options.headers as Record<string, string> | undefined),
        Authorization: `Bearer ${accessToken}`,
      }
    },

    async onResponseError(context) {
      const { response, request, options } = context

      if (response.status !== 401) {
        return
      }

      if (String(request).includes('/auth/refresh')) {
        const authStore = useAuthStore()
        authStore.clearAuth()
        await navigateTo('/login')
        return
      }

      refreshPromise ??= refreshAccessToken()
      const newToken = await refreshPromise
      refreshPromise = null

      if (newToken) {
        options.headers = {
          ...(options.headers as Record<string, string> | undefined),
          Authorization: `Bearer ${newToken}`,
        }

        return $fetch(request, options)
      }

      const authStore = useAuthStore()
      authStore.clearAuth()
      await navigateTo('/login')
    },
  })

  return {
    provide: {
      api,
    },
  }
})
