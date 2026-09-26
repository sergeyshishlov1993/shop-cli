import { expect, test } from '@playwright/test'
import { registerUser } from './helpers'

test('session survives access-token loss; logout ends it', async ({ page, context }) => {
  // Own user/session (logout revokes it). Registering through the context's request stores the
  // httpOnly refresh cookie in the browser without spending the 5/min /auth/login throttle budget.
  const hasAccessCookie = async () => (await context.cookies()).some(c => c.name === 'shop_access_token')
  await registerUser(context.request)
  await page.goto('/account')
  await expect(page).toHaveURL(/\/account$/)

  await context.clearCookies({ name: 'shop_access_token' })
  expect(await hasAccessCookie()).toBe(false)

  await page.goto('/favorites')
  await expect(page).toHaveURL(/\/favorites/)
  await expect(page.getByRole('navigation', { name: 'Особистий кабінет' })).toBeVisible()
  // session restored from the refresh cookie → a new access token is written back
  await expect.poll(hasAccessCookie).toBe(true)
  await context.clearCookies({ name: 'shop_access_token' })
  await page.goto('/account')
  await expect(page).toHaveURL(/\/account$/)
  const nav = page.getByRole('navigation', { name: 'Особистий кабінет' })
  await expect(nav).toBeVisible()

  await nav.getByRole('button', { name: 'Вийти' }).click()
  await page.locator('[role=dialog][aria-modal=true]').getByRole('button', { name: 'Вийти' }).click()
  await expect(page).not.toHaveURL(/\/account/)

  await page.goto('/account')
  await expect(page).toHaveURL(/\/login/)
})
