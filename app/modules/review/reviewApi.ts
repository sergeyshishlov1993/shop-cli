interface ReviewFormDto {
  rating?: number
  text: string
  media?: File[]
  removeMediaIds?: number[]
}

interface ReviewsQuery {
  page?: number
  limit?: number
  sort?: ReviewSort
  filter?: ReviewFilter
}

interface ReviewsResponse {
  items: Review[]
  totalCount: number
  averageRating: number
  ratingDistribution: Record<'1' | '2' | '3' | '4' | '5', number>
}

function toFormData(dto: ReviewFormDto) {
  const form = new FormData()
  if (dto.rating) form.append('rating', String(dto.rating))
  form.append('text', dto.text)
  dto.media?.forEach(file => form.append('media', file))
  dto.removeMediaIds?.forEach(id => form.append('removeMediaIds', String(id)))
  return form
}

export const reviewApi = {
  getByProduct(productId: number, query?: ReviewsQuery) {
    const { $api } = useNuxtApp()
    return $api<ReviewsResponse>(`/storefront/products/${productId}/reviews`, {
      params: query,
    })
  },

  create(productId: number, dto: ReviewFormDto) {
    const { $api } = useNuxtApp()
    return $api<Review>(`/storefront/products/${productId}/reviews`, {
      method: 'POST',
      body: toFormData(dto),
    })
  },

  reply(id: number, dto: ReviewFormDto) {
    const { $api } = useNuxtApp()
    return $api<Review>(`/storefront/reviews/${id}/replies`, { method: 'POST', body: toFormData(dto) })
  },

  update(id: number, dto: ReviewFormDto) {
    const { $api } = useNuxtApp()
    return $api<Review>(`/storefront/reviews/${id}`, { method: 'PATCH', body: toFormData(dto) })
  },

  remove(id: number) {
    const { $api } = useNuxtApp()
    return $api(`/storefront/reviews/${id}`, { method: 'DELETE' })
  },

  toggleLike(id: number) {
    const { $api } = useNuxtApp()
    return $api<{ liked: boolean, likesCount: number }>(`/storefront/reviews/${id}/like`, { method: 'POST' })
  },
}
