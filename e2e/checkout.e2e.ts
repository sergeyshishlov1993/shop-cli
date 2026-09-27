import { expect, test } from '@playwright/test'
import { inStockProducts } from './helpers'

// Guest context: fresh cart every run.
test('add to cart and place a courier order', async ({ page, request }) => {
  const products = await inStockProducts(request)
  expect(products.length).toBeGreaterThan(0)

  await page.addInitScript(() => localStorage.setItem('cookie-consent', 'necessary')) // banner would cover the bottom buy bar
  const addBtn = page.getByRole('button', { name: 'Додати в кошик' }).first()
  let added = false
  for (const p of products.slice(0, 10)) {
    await page.goto(`/product/${p.slug}`)
    await expect(page.locator('h1').first()).toBeVisible()
    const sizeBtns = page.locator('button[aria-pressed]:not([aria-label]):enabled:not([aria-hidden="true"] *)') // size chips (colors have aria-label)
    const n = await sizeBtns.count()
    for (let i = 0; i < n && !(await addBtn.isEnabled()); i++) await sizeBtns.nth(i).click()
    if (await addBtn.isEnabled()) { added = true; break }
  }
  expect(added, 'no purchasable product found').toBe(true)

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2)) // buy bar shows after the gallery
  await addBtn.click()
  // Після додавання відкривається бокова шторка кошика
  const drawer = page.getByRole('dialog').filter({ hasText: 'Кошик' })
  await expect(drawer.getByRole('link', { name: 'Оформити замовлення' }).or(drawer.getByRole('button', { name: 'Оформити замовлення' })).first()).toBeVisible()
  await expect(drawer.getByText('Разом')).toBeVisible()
  await expect(page.getByTestId('product-toast')).toContainText('Товар додано в кошик')

  await page.goto('/cart')
  await expect(page.getByRole('link', { name: /Оформ/ }).or(page.getByRole('button', { name: /Оформ/ })).first()).toBeVisible()

  await page.goto('/checkout')
  await expect(page.getByRole('heading', { name: 'Оформлення замовлення' })).toBeVisible()
  const np = page.locator('label').filter({ hasText: 'Нова Пошта' })
  const courier = page.locator('label').filter({ hasText: 'Курʼєрська доставка' })
  await expect(np.locator('input[type="radio"]')).toBeChecked()
  await expect(page.getByRole('textbox', { name: /^Місто/ })).toBeVisible()

  await courier.click()
  await expect(courier.locator('input[type="radio"]')).toBeChecked()
  await expect(np.locator('input[type="radio"]')).not.toBeChecked()
  await expect(page.getByLabel('Адреса доставки')).toBeVisible()
  await np.click()
  await expect(np.locator('input[type="radio"]')).toBeChecked()
  await courier.click()

  await page.getByLabel('Імʼя та прізвище').fill('E2E Тестовий')
  await page.getByLabel('Телефон').pressSequentially('0501234567')
  await page.getByLabel('Адреса доставки').fill('м. Київ, вул. Тестова, 1')
  await page.getByRole('button', { name: 'Підтвердити замовлення' }).click()
  await expect(page.getByText('Замовлення оформлено')).toBeVisible({ timeout: 20_000 })
  await expect(page.getByText(/Номер замовлення: \S+/)).toBeVisible()
})

// Каталог: кнопка на картці → модалка з уже обраним розміром → тост, шторка не відкривається
test('quick add from catalog card shows toast', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('cookie-consent', 'necessary'))
  await page.goto('/catalog')
  await page.locator('.product-card').getByRole('button', { name: 'Додати в кошик' }).first().click()
  const modal = page.getByRole('dialog').filter({ hasText: 'Оберіть варіант' })
  const add = modal.getByRole('button', { name: 'Додати в кошик' })
  await expect(add).toBeEnabled()
  await add.click()
  await expect(page.getByTestId('product-toast')).toContainText('Товар додано в кошик')
  await expect(page.getByRole('dialog').filter({ hasText: 'Разом' })).toHaveCount(0)
})
