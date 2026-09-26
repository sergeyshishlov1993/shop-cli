import { expect, test, type Locator, type Page } from '@playwright/test'
import { CUSTOMER_STATE, PNG, inStockProducts, uid } from './helpers'

test.use({ storageState: CUSTOMER_STATE })
test.describe.configure({ mode: 'serial' })

const reviewText = `E2E відгук ${uid()}`
const replyText = `E2E відповідь ${uid()}`
let slug = ''

const myReview = (page: Page): Locator =>
  page.locator('#reviews article').filter({ has: page.getByText(reviewText, { exact: true }) }).first()

test.beforeAll(async ({ request }) => {
  // Newest-reviewed product is irrelevant: the fresh customer has no reviews anywhere.
  slug = (await inStockProducts(request))[0]!.slug
})

test('write a review with a photo; second attempt is rejected', async ({ page }) => {
  await page.goto(`/product/${slug}`)
  await page.getByRole('button', { name: 'Написати відгук' }).click()
  const modal = page.locator('[role=dialog][aria-modal=true]')
  await modal.getByRole('button', { name: 'Оцінка 5' }).click()
  await modal.getByLabel('Текст відгуку').fill(reviewText)
  await modal.locator('input[type="file"]').setInputFiles({ name: 'e2e.png', mimeType: 'image/png', buffer: PNG })
  await expect(modal.getByRole('img', { name: 'e2e.png' })).toBeVisible()
  await modal.getByRole('button', { name: 'Надіслати' }).click()
  await expect(page.getByText('Відгук опубліковано')).toBeVisible()

  const review = myReview(page)
  await expect(review).toBeVisible()
  await expect(review.locator('button > img')).toBeVisible()

  // second attempt
  await expect(modal).toBeHidden() // modal closes on success
  await page.getByRole('button', { name: 'Написати відгук' }).click()
  const modal2 = page.locator('[role=dialog][aria-modal=true]')
  await modal2.getByRole('button', { name: 'Оцінка 4' }).click()
  await modal2.getByLabel('Текст відгуку').fill(`${reviewText} ще раз`)
  await modal2.getByRole('button', { name: 'Надіслати' }).click()
  await expect(modal2.getByText(/Ви вже залишили відгук/)).toBeVisible()
})

test('reply to a review and toggle like', async ({ page }) => {
  await page.goto(`/product/${slug}`)
  const review = myReview(page)
  await review.getByRole('button', { name: 'Відповісти' }).first().click()
  await review.getByPlaceholder('Ваш текст').fill(replyText)
  await review.locator('form').getByRole('button', { name: 'Відповісти' }).click()
  await expect(page.getByText('Відповідь опубліковано')).toBeVisible()
  // nested (depth 1) article inside the root review
  await expect(review.locator('article').filter({ hasText: replyText })).toBeVisible()

  const like = review.locator(':scope > div').last().getByRole('button').last()
  const before = Number((await like.innerText()).trim())
  await like.click()
  await expect(like).toHaveText(String(before + 1))
  await expect(like).toHaveClass(/text-danger/)
  await like.click()
  await expect(like).toHaveText(String(before))
})

test('media viewer opens from a thumbnail and closes', async ({ page }) => {
  await page.goto(`/product/${slug}`)
  const thumb = myReview(page).locator('button:has(> img)').first()
  await thumb.click()
  const viewer = page.locator('[role=dialog][aria-modal=true]')
  await expect(viewer.getByText(/Відгук \d+ з \d+/)).toBeVisible()
  await expect(viewer.getByText(reviewText)).toBeVisible()
  await viewer.getByRole('button', { name: 'Закрити' }).click()
  await expect(viewer).toBeHidden()

  await thumb.click()
  await expect(page.getByText(/Відгук \d+ з \d+/)).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByText(/Відгук \d+ з \d+/)).toBeHidden()
})
