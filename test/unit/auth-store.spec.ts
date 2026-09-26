import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockNuxtImport, registerEndpoint } from '@nuxt/test-utils/runtime'
import { setResponseStatus } from 'h3'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from '~/modules/auth/authStore'
import { getAccessToken, setAccessToken } from '~/plugins/api'

mockNuxtImport('navigateTo', () => vi.fn())

let profileStatus = 200
registerEndpoint('/storefront/account/profile', (event) => {
  if (profileStatus !== 200) {
    setResponseStatus(event, profileStatus)
    return { message: 'error' }
  }
  return { id: 1, email: 'a@b.c', role: 'ADMIN' }
})

describe('authStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    setAccessToken(null)
    profileStatus = 200
  })

  it('isAuthenticated becomes true once a token is set', () => {
    const store = useAuthStore()
    expect(store.isAuthenticated).toBe(false)
    store.setAccessToken('tok')
    expect(store.isAuthenticated).toBe(true)
  })

  // Regression: token is a ref, so isAuthenticated reacts to clearAuth/logout
  it('isAuthenticated becomes false after clearAuth', () => {
    const store = useAuthStore()
    store.setAccessToken('tok')
    expect(store.isAuthenticated).toBe(true)
    store.clearAuth()
    expect(store.isAuthenticated).toBe(false)
  })

  it('clearAuth resets user and token and marks initialized', () => {
    const store = useAuthStore()
    store.setAccessToken('tok')
    store.setUser({ id: 1 } as User)
    store.clearAuth()
    expect(store.user).toBeNull()
    expect(store.isInitialized).toBe(true)
    expect(getAccessToken()).toBeNull()
  })

  it('fetchProfile stores user and isAdmin', async () => {
    const store = useAuthStore()
    await store.fetchProfile()
    expect(store.user).toMatchObject({ role: 'ADMIN' })
    expect(store.isAdmin).toBe(true)
    expect(store.isLoading).toBe(false)
  })

  it('fetchProfile failure clears auth and returns null', async () => {
    profileStatus = 500
    const store = useAuthStore()
    store.setAccessToken('tok')
    store.setUser({ id: 1 } as User)
    await expect(store.fetchProfile()).resolves.toBeNull()
    expect(store.user).toBeNull()
    expect(getAccessToken()).toBeNull()
    expect(store.isLoading).toBe(false)
  })
})
