import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockNuxtImport, registerEndpoint } from '@nuxt/test-utils/runtime'
import { setResponseStatus } from 'h3'
import { createPinia, setActivePinia } from 'pinia'
import type { RouteLocationNormalized } from 'vue-router'
import authMiddleware from '~/middleware/auth'
import adminMiddleware from '~/middleware/admin'
import { setAccessToken } from '~/plugins/api'

const { navigateToMock } = vi.hoisted(() => ({ navigateToMock: vi.fn((to: string) => to) }))
mockNuxtImport('navigateTo', () => navigateToMock)

let refreshOk = true
let role = 'ADMIN'
registerEndpoint('/auth/refresh', {
  method: 'POST',
  handler: (event) => {
    if (!refreshOk) {
      setResponseStatus(event, 401)
      return {}
    }
    return { accessToken: 'fresh' }
  },
})
registerEndpoint('/storefront/account/profile', () => ({ id: 1, role }))

const route = { path: '/x' } as RouteLocationNormalized
const run = (mw: typeof authMiddleware) => mw(route, route)

describe('route middleware', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    setAccessToken(null)
    navigateToMock.mockClear()
    refreshOk = true
    role = 'ADMIN'
  })

  describe('auth', () => {
    it('no token + refresh succeeds → no redirect', async () => {
      expect(await run(authMiddleware)).toBeUndefined()
      expect(navigateToMock).not.toHaveBeenCalled()
    })

    it('no token + refresh fails → /login', async () => {
      refreshOk = false
      await run(authMiddleware)
      expect(navigateToMock).toHaveBeenCalledWith('/login')
    })
  })

  describe('admin', () => {
    it('no token + refresh succeeds + admin profile → no redirect', async () => {
      expect(await run(adminMiddleware)).toBeUndefined()
      expect(navigateToMock).not.toHaveBeenCalled()
    })

    it('refresh fails → /login?redirect=/admin', async () => {
      refreshOk = false
      await run(adminMiddleware)
      expect(navigateToMock).toHaveBeenCalledWith('/login?redirect=/admin')
    })

    it('non-admin user → /login?redirect=/admin', async () => {
      role = 'CUSTOMER'
      await run(adminMiddleware)
      expect(navigateToMock).toHaveBeenCalledWith('/login?redirect=/admin')
    })
  })
})
