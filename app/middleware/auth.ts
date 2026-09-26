import { useAuthStore } from '~/modules/auth/authStore'

export default defineNuxtRouteMiddleware(() => {
  if (!useAuthStore().isAuthenticated) {
    return navigateTo('/login')
  }
})
