interface FavoritesQuery {
  page?: number
  limit?: number
}

interface FavoritesResponse {
  items: ProductListItem[]
  totalCount: number
}

export const favoritesApi = {
  getAll(query?: FavoritesQuery) {
    const { $api } = useNuxtApp()
    return $api<FavoritesResponse>('/storefront/favorites', {
      params: query,
    })
  },

  check(productIds: number[]) {
    const { $api } = useNuxtApp()
    return $api<Record<number, boolean>>('/storefront/favorites/check', {
      params: { productIds: productIds.join(',') },
    })
  },

  getRecommendations() {
    const { $api } = useNuxtApp()
    return $api<ProductListItem[]>('/storefront/favorites/recommendations')
  },

  add(productId: number) {
    const { $api } = useNuxtApp()
    return $api(`/storefront/favorites/${productId}`, {
      method: 'POST',
    })
  },

  remove(productId: number) {
    const { $api } = useNuxtApp()
    return $api(`/storefront/favorites/${productId}`, {
      method: 'DELETE',
    })
  },
}
