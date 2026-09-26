interface FavoritesQuery {
  page?: number
  limit?: number
}

interface FavoriteProductDto {
  id: number
  name: string
  slug: string
  productType?: ProductType
  brand: string | null
  basePrice: number
  oldPrice?: number | null
  effectivePrice: number
  availabilityStatus: Exclude<AvailabilityStatus, 'OUT_OF_STOCK'>
  isNew: boolean
  isHit: boolean
  isSeasonal: boolean
  mainImage?: ProductCardImage | null
  hoverImage?: ProductCardImage | null
  mainMedia?: {
    id: number
    url: string
    alt: string
  } | null
  averageRating?: number | null
  reviewCount?: number
}

interface FavoriteItemDto {
  favoriteId: number
  product: FavoriteProductDto
}

interface FavoritesResponse {
  items: FavoriteItemDto[]
  totalCount: number
}

interface FavoriteCheckDto {
  productId: number
  isFavorite: boolean
}

function normalizeProduct(product: FavoriteProductDto): ProductListItem {
  const mainImage = product.mainImage ?? (product.mainMedia
    ? {
        id: product.mainMedia.id,
        s3Key: product.mainMedia.url,
        s3KeyThumb: null,
        s3KeyMedium: null,
        s3KeyLarge: null,
      }
    : null)

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    productType: product.productType ?? 'CLOTHING',
    brand: product.brand,
    basePrice: product.basePrice,
    oldPrice: product.oldPrice ?? null,
    effectivePrice: product.effectivePrice,
    availabilityStatus: product.availabilityStatus,
    isNew: product.isNew,
    isHit: product.isHit,
    isSeasonal: product.isSeasonal,
    mainImage,
    hoverImage: product.hoverImage ?? null,
    averageRating: product.averageRating ?? null,
    reviewCount: product.reviewCount ?? 0,
  }
}

export const favoritesApi = {
  async getAll(query?: FavoritesQuery) {
    const { $api } = useNuxtApp()
    const response = await $api<FavoritesResponse>('/storefront/favorites', {
      params: query,
    })

    return {
      items: response.items.map(item => normalizeProduct(item.product)),
      totalCount: response.totalCount,
    }
  },

  async check(productIds: number[]) {
    const { $api } = useNuxtApp()
    const response = await $api<FavoriteCheckDto[]>('/storefront/favorites/check', {
      params: { productIds: productIds.join(',') },
    })

    return Object.fromEntries(response.map(item => [item.productId, item.isFavorite])) as Record<number, boolean>
  },

  async getRecommendations() {
    const { $api } = useNuxtApp()
    const response = await $api<FavoriteProductDto[]>('/storefront/favorites/recommendations')
    return response.map(normalizeProduct)
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
