import type { SortOption } from './components/CatalogFiltersContent.vue'

export interface CatalogQuery {
  category?: string
  productType?: ProductType
  size?: number
  color?: number
  brand?: string
  season?: string
  material?: string
  priceMin?: number
  priceMax?: number
  isNew?: boolean
  isHit?: boolean
  isSeasonal?: boolean
  search?: string
  sort?: SortOption
  page?: number
  limit?: number
}

export const catalogApi = {
  getProducts(query: CatalogQuery) {
    const { $api } = useNuxtApp()
    return $api<ProductListResponse>('/storefront/products', {
      params: query,
    })
  },

  getProductBySlug(slug: string) {
    const { $api } = useNuxtApp()
    return $api<ProductDetail>(`/storefront/products/${slug}`)
  },

  getRelatedProducts(slug: string) {
    const { $api } = useNuxtApp()
    return $api<RelatedProducts>(`/storefront/products/${slug}/related`)
  },

  getCategories() {
    const { $api } = useNuxtApp()
    return $api<Category[]>('/storefront/categories')
  },
}
