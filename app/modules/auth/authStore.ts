import { getAccessToken, setAccessToken as setApiAccessToken } from '~/plugins/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const isInitialized = ref(false)

  const isAuthenticated = computed(() => Boolean(getAccessToken()))
  const isAdmin = computed(() => user.value?.role === 'ADMIN')

  function setUser(nextUser: User | null) {
    user.value = nextUser
  }

  function setAccessToken(token: string | null) {
    setApiAccessToken(token)
  }

  function clearAuth() {
    user.value = null
    isInitialized.value = true
    setAccessToken(null)
  }

  async function fetchProfile() {
    isLoading.value = true
    try {
      const { $api } = useNuxtApp()
      const profile = await $api<User>('/storefront/account/profile')
      user.value = profile
      isInitialized.value = true
      return profile
    }
    catch {
      clearAuth()
      return null
    }
    finally {
      isLoading.value = false
    }
  }

  async function onAuthSuccess(accessToken: string) {
    setAccessToken(accessToken)
    const cartStore = useCartStore()
    await Promise.all([
      fetchProfile(),
      cartStore.fetchCart(),
    ])
  }

  async function login(email: string, password: string) {
    isLoading.value = true
    try {
      const response = await authApi.login({ email, password })
      await onAuthSuccess(response.accessToken)
    }
    finally {
      isLoading.value = false
    }
  }

  async function register(dto: { email: string; password: string; firstName?: string; lastName?: string }) {
    isLoading.value = true
    try {
      const response = await authApi.register(dto)
      await onAuthSuccess(response.accessToken)
    }
    finally {
      isLoading.value = false
    }
  }

  async function handleGoogleCallback(code: string) {
    isLoading.value = true
    try {
      const response = await authApi.googleCallback(code)
      await onAuthSuccess(response.accessToken)
    }
    finally {
      isLoading.value = false
    }
  }

  async function logout() {
    isLoading.value = true
    try {
      await authApi.logout()
    }
    finally {
      clearAuth()
      isLoading.value = false
      await navigateTo('/login')
    }
  }

  return {
    user,
    isLoading,
    isInitialized,
    isAuthenticated,
    isAdmin,
    setUser,
    setAccessToken,
    clearAuth,
    fetchProfile,
    login,
    register,
    handleGoogleCallback,
    logout,
  }
})
