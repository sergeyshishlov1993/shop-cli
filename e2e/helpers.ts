import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { expect, request, type APIRequestContext, type Page } from '@playwright/test'

export const BASE_URL = 'http://localhost:3001'
export const AUTH_DIR = resolve('e2e/.auth')
export const ADMIN_STATE = resolve(AUTH_DIR, 'admin.json')
export const CUSTOMER_STATE = resolve(AUTH_DIR, 'customer.json')

export const uid = () => `${Date.now()}${Math.floor(Math.random() * 1e4)}`

/** Admin creds from shop-api/.env — read at runtime, never logged. */
export function adminCreds() {
  const env = readFileSync(resolve('../shop-api/.env'), 'utf-8')
  const get = (k: string) => {
    const m = env.match(new RegExp(`^${k}=(.*)$`, 'm'))
    if (!m) throw new Error(`${k} missing in shop-api/.env`)
    return m[1].trim().replace(/^['"]|['"]$/g, '')
  }
  return { email: get('ADMIN_EMAIL'), password: get('ADMIN_PASSWORD') }
}

export interface User { email: string, password: string, token: string }

/** Registers a fresh customer through the API; returns creds + access token. */
export async function registerUser(api?: APIRequestContext): Promise<User> {
  const ctx = api ?? await request.newContext({ baseURL: BASE_URL })
  const email = `e2e-${uid()}@example.test`
  const password = `Pw-${uid()}`
  const res = await ctx.post('/api/auth/register', { data: { email, password, firstName: 'E2E', lastName: 'Tester' } })
  expect(res.ok(), `register: ${res.status()}`).toBeTruthy()
  const { accessToken } = await res.json()
  if (!api) await ctx.dispose()
  return { email, password, token: accessToken }
}

export async function uiLogin(page: Page, email: string, password: string) {
  await page.goto('/login', { waitUntil: 'networkidle' })
  await page.getByLabel('Email').fill(email)
  await page.getByPlaceholder('Введіть пароль').fill(password)
  await page.getByRole('button', { name: 'Увійти', exact: true }).click()
  await expect(page).not.toHaveURL(/\/login/, { timeout: 15_000 })
}

export async function inStockProducts(api: APIRequestContext) {
  const res = await api.get('/api/storefront/products?limit=40')
  expect(res.ok()).toBeTruthy()
  const { items } = await res.json() as { items: { id: number, slug: string, availabilityStatus: string }[] }
  return items.filter(p => p.availabilityStatus === 'IN_STOCK')
}

/** 1x1 PNG */
export const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64')
