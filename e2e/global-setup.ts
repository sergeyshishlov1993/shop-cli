import { existsSync, mkdirSync } from 'node:fs'
import { chromium, expect } from '@playwright/test'
import { ADMIN_STATE, AUTH_DIR, BASE_URL, CUSTOMER_STATE, adminCreds, registerUser, uiLogin } from './helpers'

// /api/auth/login is throttled to 5 req/min per IP, so:
// - admin: reuse the saved session while its refresh cookie is valid, UI-login otherwise;
// - customer: a fresh user per run, registered through the browser context (sets the refresh cookie).
export default async function globalSetup() {
  mkdirSync(AUTH_DIR, { recursive: true })
  const browser = await chromium.launch()

  const admin = await browser.newContext({ baseURL: BASE_URL, storageState: existsSync(ADMIN_STATE) ? ADMIN_STATE : undefined })
  const adminPage = await admin.newPage()
  await adminPage.goto('/admin')
  await adminPage.waitForLoadState('networkidle')
  if (!/\/admin/.test(adminPage.url())) {
    const { email, password } = adminCreds()
    await uiLogin(adminPage, email, password)
    await adminPage.goto('/admin')
    await expect(adminPage).toHaveURL(/\/admin/)
  }
  await admin.storageState({ path: ADMIN_STATE })
  await admin.close()

  const customer = await browser.newContext({ baseURL: BASE_URL })
  await registerUser(customer.request)
  const page = await customer.newPage()
  await page.goto('/account')
  await expect(page).toHaveURL(/\/account/)
  await expect.poll(async () => (await customer.cookies()).some(c => c.name === 'shop_access_token')).toBe(true)
  await customer.storageState({ path: CUSTOMER_STATE })
  await customer.close()

  await browser.close()
}
