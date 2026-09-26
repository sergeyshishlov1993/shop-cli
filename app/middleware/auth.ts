import { useAuthStore } from '~/modules/auth/authStore'

export default defineNuxtRouteMiddleware(async () => {
  if (!useAuthStore().isAuthenticated && !(await useNuxtApp().$refreshAccessToken())) {
    return navigateTo('/login')
  }
})
