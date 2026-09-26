import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { expect, test } from '@playwright/test'
import { ADMIN_STATE, inStockProducts, registerUser, uid } from './helpers'

test.use({ storageState: ADMIN_STATE })

test('admin reviews: hide/show, reply, product link', async ({ page, request }) => {
  const products = await inStockProducts(request)
  const product = products[products.length - 1]!
  const user = await registerUser(request)
  const text = `E2E admin відгук ${uid()}`
  const res = await request.post(`/api/storefront/products/${product.id}/reviews`, {
    headers: { Authorization: `Bearer ${user.token}` },
    multipart: { rating: '4', text },
  })
  expect(res.ok(), `create review: ${res.status()}`).toBeTruthy()

  await page.goto('/admin/reviews')
  const card = page.locator('article').filter({ hasText: text })
  await expect(card).toBeVisible()
  await expect(card.getByRole('link').first()).toHaveAttribute('href', `/product/${product.slug}#reviews`)

  await card.getByRole('button', { name: 'Приховати' }).click()
  await expect(page.getByText('Відгук приховано')).toBeVisible()
  await expect(card.getByText('Приховано', { exact: true })).toBeVisible()
  await expect(card.getByRole('button', { name: 'Відповісти' })).toBeDisabled()

  await card.getByRole('button', { name: 'Показати' }).click()
  await expect(page.getByText('Відгук опубліковано')).toBeVisible()
  await expect(card.getByText('Опубліковано', { exact: true })).toBeVisible()

  const replyText = `E2E відповідь магазину ${uid()}`
  await card.getByRole('button', { name: 'Відповісти' }).click()
  const modal = page.locator('[role=dialog][aria-modal=true]')
  await modal.getByPlaceholder('Ваш текст').fill(replyText)
  await modal.getByRole('button', { name: 'Опублікувати' }).click()
  await expect(page.getByText('Відповідь опубліковано')).toBeVisible()
  await expect(page.locator('article').filter({ hasText: replyText })).toContainText(text)
})

test('admin YML import shows created/updated counts', async ({ page }) => {
  await page.goto('/admin/import')
  const section = page.locator('h2', { hasText: 'Імпорт товарів з YML' }).locator('xpath=..')
  await page.locator('input[type="file"][accept=".yml,.xml"]').setInputFiles({
    name: 'import.yml',
    mimeType: 'application/xml',
    buffer: readFileSync(resolve('e2e/fixtures/import.yml')),
  })
  await section.getByRole('button', { name: 'Імпортувати' }).click()
  const result = section.getByText(/Створено варіантів: \d+, оновлено: \d+/)
  await expect(result).toBeVisible({ timeout: 20_000 })
  const [, created, updated] = (await result.innerText()).match(/(\d+), оновлено: (\d+)/)!
  expect(Number(created) + Number(updated)).toBe(1)
})
