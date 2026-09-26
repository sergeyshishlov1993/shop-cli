import { useAuthStore } from '~/modules/auth/authStore'

export default defineNuxtRouteMiddleware(async () => {
  const authStore = useAuthStore()
  if (!authStore.isAuthenticated) await useNuxtApp().$refreshAccessToken()

  if (authStore.isAuthenticated && !authStore.user) {
    await authStore.fetchProfile()
  }

  if (!authStore.isAdmin) {
    return navigateTo('/login?redirect=/admin')
  }
})
