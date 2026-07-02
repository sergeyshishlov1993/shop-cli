import { catalogApi } from './catalogApi'

export const useCatalogStore = defineStore('catalog', () => {
  const products = ref<ProductListItem[]>([])
  const totalCount = ref(0)
  const filters = ref<ProductFilters | null>(null)
  const categories = ref<Category[]>([])
  const currentProduct = ref<ProductDetail | null>(null)
  const relatedProducts = ref<RelatedProducts | null>(null)
  const loading = ref(false)

  const searchResults = ref<ProductListItem[]>([])
  const searchLoading = ref(false)

  async function fetchProducts(query: Parameters<typeof catalogApi.getProducts>[0]) {
    loading.value = true
    try {
      const response = await catalogApi.getProducts(query)
      products.value = response.items
      totalCount.value = response.totalCount
      filters.value = response.filters
    }
    finally {
      loading.value = false
    }
  }

  async function fetchProductBySlug(slug: string) {
    loading.value = true
    try {
      currentProduct.value = await catalogApi.getProductBySlug(slug)
    }
    finally {
      loading.value = false
    }
  }

  async function fetchRelated(slug: string) {
    relatedProducts.value = await catalogApi.getRelatedProducts(slug)
  }

  async function fetchCategories() {
    if (categories.value.length) return
    categories.value = await catalogApi.getCategories()
  }

  async function searchProducts(search: string) {
    searchLoading.value = true
    try {
      const response = await catalogApi.getProducts({ search, limit: 8 })
      searchResults.value = response.items
    }
    finally {
      searchLoading.value = false
    }
  }

  function clearSearch() {
    searchResults.value = []
  }

  return {
    products,
    totalCount,
    filters,
    categories,
    currentProduct,
    relatedProducts,
    loading,
    searchResults,
    searchLoading,
    fetchProducts,
    fetchProductBySlug,
    fetchRelated,
    fetchCategories,
    searchProducts,
    clearSearch,
  }
})
