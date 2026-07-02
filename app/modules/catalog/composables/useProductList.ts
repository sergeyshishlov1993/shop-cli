import type { CatalogQuery } from '../catalogApi'
import type { SortOption } from '../components/CatalogFiltersContent.vue'

export function useProductList() {
  const { $api } = useNuxtApp()
  const route = useRoute()
  const router = useRouter()

  const products = ref<ProductListItem[]>([])
  const filters = ref<ProductFilters | null>(null)
  const totalCount = ref(0)
  const loading = ref(false)

  const params = reactive<CatalogQuery>({
    category: (route.query.category as string) || undefined,
    productType: (route.query.productType as ProductType) || undefined,
    size: route.query.size ? Number(route.query.size) : undefined,
    color: route.query.color ? Number(route.query.color) : undefined,
    brand: (route.query.brand as string) || undefined,
    season: (route.query.season as string) || undefined,
    material: (route.query.material as string) || undefined,
    priceMin: route.query.priceMin ? Number(route.query.priceMin) : undefined,
    priceMax: route.query.priceMax ? Number(route.query.priceMax) : undefined,
    isNew: route.query.isNew === 'true' || undefined,
    isHit: route.query.isHit === 'true' || undefined,
    isSeasonal: route.query.isSeasonal === 'true' || undefined,
    search: (route.query.search as string) || undefined,
    sort: (route.query.sort as SortOption) || undefined,
    page: route.query.page ? Number(route.query.page) : 1,
    limit: 24,
  })

  const totalPages = computed(() => Math.ceil(totalCount.value / (params.limit ?? 24)))

  async function fetchProducts() {
    loading.value = true
    try {
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== undefined && value !== null),
      )
      const response = await $api<ProductListResponse>('/storefront/products', {
        params: cleanParams,
      })

      products.value = response.items
      totalCount.value = response.totalCount
      filters.value = response.filters
    } finally {
      loading.value = false
    }
  }

  function syncToUrl() {
    const query: Record<string, string> = {}
    const skipKeys = new Set(['limit'])

    for (const [key, value] of Object.entries(params)) {
      if (skipKeys.has(key) || value === undefined || value === null) continue
      if (value !== false) {
        query[key] = String(value)
      }
    }

    router.replace({ query })
  }

  function setFilter<K extends keyof CatalogQuery>(key: K, value: CatalogQuery[K]) {
    params[key] = value
    params.page = 1
    syncToUrl()
  }

  function setPage(page: number) {
    params.page = page
    syncToUrl()
  }

  function setSort(sort: SortOption) {
    params.sort = sort
    params.page = 1
    syncToUrl()
  }

  function resetFilters() {
    const keep = { page: 1, limit: params.limit, category: params.category }
    Object.assign(params, {
      productType: undefined,
      size: undefined,
      color: undefined,
      brand: undefined,
      season: undefined,
      material: undefined,
      priceMin: undefined,
      priceMax: undefined,
      isNew: undefined,
      isHit: undefined,
      isSeasonal: undefined,
      search: undefined,
      sort: undefined,
      ...keep,
    })
    syncToUrl()
  }

  watch(params, fetchProducts, { deep: true, immediate: true })

  return {
    products,
    filters,
    totalCount,
    totalPages,
    loading,
    params,
    setFilter,
    setPage,
    setSort,
    resetFilters,
    fetchProducts,
  }
}
