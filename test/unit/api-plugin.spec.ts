import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mockNuxtImport, registerEndpoint } from '@nuxt/test-utils/runtime'
import { setResponseStatus } from 'h3'
import { setAccessToken, getAccessToken } from '~/plugins/api'

const { navigateToMock } = vi.hoisted(() => ({ navigateToMock: vi.fn() }))
mockNuxtImport('navigateTo', () => navigateToMock)

let refreshCalls = 0
let refreshOk = true

// test-utils' fetch shim drops headers passed as a Headers instance, so the
// endpoint decides by call order: the first `protectedFailures` calls get 401.
let protectedCalls = 0
let protectedFailures = 1
function protectedHandler(event: any) {
  protectedCalls++
  if (protectedCalls <= protectedFailures) {
    setResponseStatus(event, 401)
    return { message: 'unauthorized' }
  }
  return { ok: true }
}

registerEndpoint('/auth/refresh', {
  method: 'POST',
  handler: (event: any) => {
    refreshCalls++
    if (!refreshOk) {
      setResponseStatus(event, 401)
      return { message: 'no' }
    }
    return { accessToken: 'fresh' }
  },
})
registerEndpoint('/protected', protectedHandler)

describe('api plugin', () => {
  beforeEach(() => {
    refreshCalls = 0
    refreshOk = true
    protectedCalls = 0
    protectedFailures = 1
    navigateToMock.mockReset()
    setAccessToken('stale')
  })
  afterEach(() => setAccessToken(null))

  it('passes through successful responses without refresh', async () => {
    protectedFailures = 0
    await expect(useNuxtApp().$api('/protected')).resolves.toEqual({ ok: true })
    expect(refreshCalls).toBe(0)
  })

  it('on 401 refreshes token and retries', async () => {
    const result = await useNuxtApp().$api('/protected').catch(e => e)
    expect(refreshCalls).toBe(1)
    expect(getAccessToken()).toBe('fresh')
    expect(protectedCalls).toBe(2)
    expect(result).toEqual({ ok: true })
  })

  // Regression: retry result must reach the caller (ofetch ignores onResponseError's return value)
  it('resolves the original call with the retried response', async () => {
    await expect(useNuxtApp().$api('/protected')).resolves.toEqual({ ok: true })
  })

  it('refresh failure clears auth and redirects to /login', async () => {
    refreshOk = false
    await useNuxtApp().$api('/protected').catch(() => {})
    expect(refreshCalls).toBe(1)
    expect(getAccessToken()).toBeNull()
    expect(navigateToMock).toHaveBeenCalledWith('/login')
  })

  it('$refreshAccessToken dedupes concurrent calls', async () => {
    const { $refreshAccessToken } = useNuxtApp()
    const [a, b, c] = await Promise.all([$refreshAccessToken(), $refreshAccessToken(), $refreshAccessToken()])
    expect([a, b, c]).toEqual(['fresh', 'fresh', 'fresh'])
    expect(refreshCalls).toBe(1)
    await $refreshAccessToken()
    expect(refreshCalls).toBe(2)
  })

  it('$refreshAccessToken returns null and clears token on failure', async () => {
    refreshOk = false
    await expect(useNuxtApp().$refreshAccessToken()).resolves.toBeNull()
    expect(getAccessToken()).toBeNull()
  })
})
