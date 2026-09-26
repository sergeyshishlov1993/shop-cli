import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useReviewStore } from '~/modules/review/reviewStore'
import { reviewApi } from '~/modules/review/reviewApi'

vi.mock('~/modules/review/reviewApi', () => ({
  reviewApi: { getByProduct: vi.fn(), toggleLike: vi.fn(), reply: vi.fn() },
}))

const r = (id: number) => ({ id, replies: [], likedByMe: false, likesCount: 0 }) as unknown as Review
const page = (ids: number[]) => ({
  items: ids.map(r),
  totalCount: 10,
  averageRating: 4.5,
  ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 1, 5: 1 },
})

describe('reviewStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('page 1 replaces, page > 1 appends', async () => {
    const store = useReviewStore()
    vi.mocked(reviewApi.getByProduct).mockResolvedValueOnce(page([1, 2]))
    await store.fetchByProduct(7)
    vi.mocked(reviewApi.getByProduct).mockResolvedValueOnce(page([3]))
    await store.fetchByProduct(7, { page: 2 })
    expect(store.reviews.map(x => x.id)).toEqual([1, 2, 3])
    vi.mocked(reviewApi.getByProduct).mockResolvedValueOnce(page([9]))
    await store.fetchByProduct(7, { page: 1 })
    expect(store.reviews.map(x => x.id)).toEqual([9])
    expect(store.totalCount).toBe(10)
    expect(store.averageRating).toBe(4.5)
    expect(store.loading).toBe(false)
  })

  it('passes sort and filter', async () => {
    const store = useReviewStore()
    vi.mocked(reviewApi.getByProduct).mockResolvedValue(page([]))
    store.sort = 'rating_desc'
    store.filter = 'with_media'
    await store.fetchByProduct(7, { page: 2, limit: 5 })
    expect(reviewApi.getByProduct).toHaveBeenCalledWith(7, { page: 2, limit: 5, sort: 'rating_desc', filter: 'with_media' })
  })

  it('toggleLike updates likedByMe and likesCount', async () => {
    const store = useReviewStore()
    const review = r(1)
    vi.mocked(reviewApi.toggleLike).mockResolvedValue({ liked: true, likesCount: 4 })
    await store.toggleLike(review)
    expect(reviewApi.toggleLike).toHaveBeenCalledWith(1)
    expect(review).toMatchObject({ likedByMe: true, likesCount: 4 })
  })
})
