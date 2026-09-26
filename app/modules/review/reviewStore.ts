import { reviewApi } from '~/modules/review/reviewApi'

export const useReviewStore = defineStore('review', () => {
  const reviews = ref<Review[]>([])
  const totalCount = ref(0)
  const loading = ref(false)
  const submitting = ref(false)

  const sort = ref<ReviewSort>('newest')
  const filter = ref<ReviewFilter>('all')
  const averageRating = ref(0)
  const ratingDistribution = ref<Record<'1' | '2' | '3' | '4' | '5', number>>({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 })

  // page > 1 — дописує до вже завантажених (скрол-підвантаження)
  async function fetchByProduct(productId: number, query?: { page?: number; limit?: number }) {
    loading.value = true
    try {
      const response = await reviewApi.getByProduct(productId, { ...query, sort: sort.value, filter: filter.value })
      reviews.value = (query?.page ?? 1) > 1 ? [...reviews.value, ...response.items] : response.items
      totalCount.value = response.totalCount
      averageRating.value = response.averageRating
      ratingDistribution.value = response.ratingDistribution
    }
    finally {
      loading.value = false
    }
  }

  async function create(productId: number, dto: { rating: number; text: string; media?: File[] }) {
    submitting.value = true
    try {
      const review = await reviewApi.create(productId, dto)
      reviews.value.unshift(review)
      totalCount.value++
      return review
    }
    finally {
      submitting.value = false
    }
  }

  // Finds a review anywhere in the tree and returns its containing array
  function locate(id: number, list = reviews.value): [Review[], number] | null {
    for (const [i, item] of list.entries()) {
      if (item.id === id) return [list, i]
      const found = locate(id, item.replies)
      if (found) return found
    }
    return null
  }

  async function toggleLike(review: Review) {
    const { liked, likesCount } = await reviewApi.toggleLike(review.id)
    review.likedByMe = liked
    review.likesCount = likesCount
  }

  async function update(id: number, dto: { rating?: number; text: string; media?: File[]; removeMediaIds?: number[] }) {
    const updated = await reviewApi.update(id, dto)
    const found = locate(id)
    if (found) found[0][found[1]] = { ...updated, replies: found[0][found[1]]!.replies }
    return updated
  }

  async function remove(id: number) {
    await reviewApi.remove(id)
    const found = locate(id)
    if (!found) return
    found[0].splice(found[1], 1)
    if (found[0] === reviews.value) totalCount.value--
  }

  function reset() {
    reviews.value = []
    totalCount.value = 0
    filter.value = 'all'
  }

  return {
    reviews,
    totalCount,
    loading,
    submitting,
    fetchByProduct,
    sort,
    filter,
    averageRating,
    ratingDistribution,
    create,
    reply: reviewApi.reply,
    toggleLike,
    update,
    remove,
    reset,
  }
})
