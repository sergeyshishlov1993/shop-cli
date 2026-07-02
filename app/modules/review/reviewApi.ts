interface CreateReviewDto {
  rating: number
  text: string
}

interface ReviewsQuery {
  page?: number
  limit?: number
}

interface ReviewsResponse {
  items: Review[]
  totalCount: number
}

export const reviewApi = {
  getByProduct(productId: number, query?: ReviewsQuery) {
    const { $api } = useNuxtApp()
    return $api<ReviewsResponse>(`/storefront/products/${productId}/reviews`, {
      params: query,
    })
  },

  create(productId: number, dto: CreateReviewDto) {
    const { $api } = useNuxtApp()
    return $api<Review>(`/storefront/products/${productId}/reviews`, {
      method: 'POST',
      body: dto,
    })
  },
}
