import { useAuthStore } from '~/modules/auth/authStore'

export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore()

  if (!authStore.isAdmin) {
    return navigateTo('/')
  }
})
