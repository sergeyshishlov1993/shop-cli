import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { expect, test } from '@playwright/test'
import { ADMIN_STATE, inStockProducts, PNG, registerUser, uid } from './helpers'

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

test('admin product media: create with queued media, then edit', async ({ page }) => {
  const id = uid()
  const png = (name: string) => ({ name, mimeType: 'image/png', buffer: PNG })
  const picker = page.locator('input[type="file"][multiple]')
  const gallery = page.locator('article')

  await page.addInitScript(() => localStorage.setItem('cookie-consent', 'necessary')) // banner would cover the modal footer
  await page.goto('/admin/products')
  await page.getByRole('button', { name: 'Додати товар' }).click()
  const modal = page.locator('.admin-dialog')
  await modal.getByLabel('Назва').fill(`E2E медіа ${id}`)
  await modal.getByLabel('Slug').fill(`e2e-media-${id}`)
  await modal.getByLabel(/^Ціна\s*\*?$/).fill('123')
  await picker.setInputFiles([png('a.png'), png('b.png')])
  const instagram = modal.getByPlaceholder('https://www.instagram.com/reel/...')
  await instagram.fill(`https://www.instagram.com/reel/E2E${id}/`)
  await instagram.press('Enter')
  await expect(modal.getByText(`reel/E2E${id}`)).toBeVisible()
  const created = page.waitForResponse(r => r.request().method() === 'POST' && /\/admin\/products$/.test(r.url()))
  await modal.getByRole('button', { name: 'Зберегти' }).click()
  const productId = (await (await created).json()).id as number
  await expect(page.getByText('Товар створено')).toBeVisible({ timeout: 20_000 })

  const token = (await page.context().cookies()).find(c => c.name === 'shop_access_token')?.value
  try {
    await page.goto(`/admin/products/${productId}`)
    await expect(gallery).toHaveCount(3)
    await expect(gallery.getByText('★ Головне', { exact: true })).toHaveCount(1)
    await expect(gallery.first().getByText('★ Головне', { exact: true })).toBeVisible()
    await expect(gallery.first().locator('img')).toBeVisible()
    await expect(gallery.last().locator('iframe')).toHaveAttribute('src', /instagram\.com\/reel\/E2E/)

    await picker.setInputFiles(png('c.png'))
    await expect(page.getByText('Медіа додано')).toBeVisible()
    await expect(gallery).toHaveCount(4)
    const newest = gallery.filter({ has: page.getByAltText('c.png') })
    await newest.getByRole('button', { name: 'Зробити головним' }).click()
    await expect(newest.getByText('★ Головне', { exact: true })).toBeVisible()
    await expect(gallery.getByText('★ Головне', { exact: true })).toHaveCount(1)
    await newest.getByTitle('Видалити').click()
    await page.getByRole('button', { name: 'Видалити', exact: true }).last().click()
    await expect(gallery).toHaveCount(3)
    await expect(newest).toHaveCount(0)
  } finally {
    const res = await page.request.delete(`/api/admin/products/${productId}`, { headers: { Authorization: `Bearer ${token}` } })
    expect(res.ok(), `cleanup: ${res.status()} ${await res.text()}`).toBeTruthy()
  }
})
