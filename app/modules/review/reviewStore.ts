export const useReviewStore = defineStore('review', () => {
  const reviews = ref<Review[]>([])
  const totalCount = ref(0)
  const loading = ref(false)
  const submitting = ref(false)

  async function fetchByProduct(productId: number, query?: { page?: number; limit?: number }) {
    loading.value = true
    try {
      const response = await reviewApi.getByProduct(productId, query)
      reviews.value = response.items
      totalCount.value = response.totalCount
    }
    finally {
      loading.value = false
    }
  }

  async function create(productId: number, dto: { rating: number; text: string }) {
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

  function reset() {
    reviews.value = []
    totalCount.value = 0
  }

  return {
    reviews,
    totalCount,
    loading,
    submitting,
    fetchByProduct,
    create,
    reset,
  }
})
