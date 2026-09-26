import { describe, expect, it } from 'vitest'
import { getFileUrl, getInstagramEmbedUrl } from '~/modules/common/helpers/fileUrl'
import { formatProductCount, pluralUk } from '~/modules/common/helpers/plural'

describe('getFileUrl', () => {
  const file = { s3Key: 'o.jpg', s3KeyThumb: 't.jpg', s3KeyMedium: 'm.jpg', s3KeyLarge: null }

  it('returns empty string for null/undefined', () => {
    expect(getFileUrl(null)).toBe('')
    expect(getFileUrl(undefined, 'thumb')).toBe('')
  })

  it('picks key by size and falls back to original', () => {
    const base = (useRuntimeConfig().public.s3BaseUrl as string).replace(/\/$/, '')
    expect(getFileUrl(file)).toBe(`${base}/o.jpg`)
    expect(getFileUrl(file, 'thumb')).toBe(`${base}/t.jpg`)
    expect(getFileUrl(file, 'medium')).toBe(`${base}/m.jpg`)
    expect(getFileUrl(file, 'large')).toBe(`${base}/o.jpg`)
    expect(getFileUrl({ s3Key: '/lead.jpg' })).toBe(`${base}/lead.jpg`)
  })

  it('maps seed and mock video keys to demo media', () => {
    expect(getFileUrl({ s3Key: 'seed/1/a.jpg' })).toBe('/demo-media/stella-silk.jpg')
    expect(getFileUrl({ s3Key: 'mock/products/vid-1.mp4' })).toBe('/demo-media/product-fashion-loop.mp4')
  })
})

describe('getInstagramEmbedUrl', () => {
  it.each([
    ['https://www.instagram.com/p/AbC_1-2/', 'https://www.instagram.com/p/AbC_1-2/embed'],
    ['https://instagram.com/tv/XYZ', 'https://www.instagram.com/p/XYZ/embed'],
    ['https://www.instagram.com/reel/R1/?igsh=1', 'https://www.instagram.com/reel/R1/embed'],
    ['https://www.instagram.com/reels/R2/', 'https://www.instagram.com/reel/R2/embed'],
  ])('%s → %s', (url, expected) => {
    expect(getInstagramEmbedUrl(url)).toBe(expected)
  })

  it.each([null, undefined, '', 'https://youtube.com/p/x', 'https://www.instagram.com/someuser/'])('%s → null', (url) => {
    expect(getInstagramEmbedUrl(url)).toBeNull()
  })
})

describe('pluralUk', () => {
  it.each([
    [1, 'товар'], [21, 'товар'], [101, 'товар'],
    [2, 'товари'], [4, 'товари'], [22, 'товари'],
    [0, 'товарів'], [5, 'товарів'], [11, 'товарів'], [12, 'товарів'], [14, 'товарів'], [111, 'товарів'],
    [-1, 'товар'],
  ])('%i → %s', (n, form) => {
    expect(pluralUk(n, 'товар', 'товари', 'товарів')).toBe(form)
  })

  it('formatProductCount handles null', () => {
    expect(formatProductCount(null)).toBe('0 товарів')
    expect(formatProductCount(3)).toBe('3 товари')
  })
})
