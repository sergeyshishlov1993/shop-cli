import { useAuthStore } from '~/modules/auth/authStore'

export default defineNuxtRouteMiddleware(async (to) => {
  // Перемикання розділів адмінки — через розмиття (стилі .admin-blur-* у main.css)
  to.meta.pageTransition = { name: 'admin-blur', mode: 'out-in' }

  const authStore = useAuthStore()
  if (!authStore.isAuthenticated) await useNuxtApp().$refreshAccessToken()

  if (authStore.isAuthenticated && !authStore.user) {
    await authStore.fetchProfile()
  }

  if (!authStore.isAdmin) {
    // Гість — на вхід; авторизований без ролі адміна — 403, а не нескінченний редирект
    if (authStore.isAuthenticated) return abortNavigation(createError({ statusCode: 403, statusMessage: 'Forbidden' }))
    return navigateTo('/login?redirect=/admin')
  }
})
