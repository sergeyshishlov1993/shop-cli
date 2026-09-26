import type { CatalogQuery } from '../catalogApi'
import type { SortOption } from '../components/CatalogFiltersContent.vue'

const MIN_LOADING_MS = 300

type RouteQueryValue = string | null | (string | null)[] | undefined

/** Мультивыбор живёт в URL через запятую (?color=2,11), но повторы тоже принимаем. */
function toStringArray(value: RouteQueryValue): string[] | undefined {
  if (value === undefined || value === null) return undefined

  const raw = Array.isArray(value) ? value : String(value).split(',')
  const cleaned = raw.map(item => String(item ?? '').trim()).filter(Boolean)

  return cleaned.length ? cleaned : undefined
}

function toNumberArray(value: RouteQueryValue): number[] | undefined {
  const strings = toStringArray(value)
  if (!strings) return undefined

  const numbers = strings.map(Number).filter(item => Number.isInteger(item))

  return numbers.length ? numbers : undefined
}

export function useProductList() {
  const { $api } = useNuxtApp()
  const route = useRoute()
  const router = useRouter()

  const products = ref<ProductListItem[]>([])
  const filters = ref<ProductFilters | null>(null)
  const totalCount = ref(0)
  const loading = ref(false)
  let requestId = 0

  const routeCategory = computed(() => {
    const slug = route.params.slug
    return typeof slug === 'string' ? slug : undefined
  })

  const params = reactive<CatalogQuery>({
    category: routeCategory.value || (route.query.category as string) || undefined,
    productType: toStringArray(route.query.productType) as ProductType[] | undefined,
    size: toNumberArray(route.query.size),
    color: toNumberArray(route.query.color),
    brand: toStringArray(route.query.brand),
    season: toStringArray(route.query.season),
    material: toStringArray(route.query.material),
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
    const currentRequestId = ++requestId
    const startedAt = Date.now()
    loading.value = true
    try {
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([, value]) =>
          value !== undefined && value !== null && (!Array.isArray(value) || value.length > 0),
        ),
      )
      const response = await $api<ProductListResponse>('/storefront/products', {
        params: cleanParams,
      })

      if (currentRequestId !== requestId) return

      products.value = response.items
      totalCount.value = response.totalCount
      filters.value = response.filters
    } finally {
      if (currentRequestId === requestId) {
        const remainingLoadingMs = MIN_LOADING_MS - (Date.now() - startedAt)
        if (remainingLoadingMs > 0) {
          await new Promise(resolve => setTimeout(resolve, remainingLoadingMs))
        }

        loading.value = false
      }
    }
  }

  function syncToUrl() {
    const query: Record<string, string> = {}
    for (const [key, value] of Object.entries(params)) {
      if (key === 'limit' || value === undefined || value === null) continue
      if (key === 'category' && value === routeCategory.value) continue
      if (Array.isArray(value)) {
        if (value.length) query[key] = value.join(',')
        continue
      }
      if (value !== false) query[key] = String(value)
    }

    router.replace({ query })
  }

  function setFilter<K extends keyof CatalogQuery>(key: K, value: CatalogQuery[K]) {
    if (params[key] !== value || params.page !== 1) {
      loading.value = true
    }

    params[key] = value
    params.page = 1
    syncToUrl()
  }

  function setPage(page: number) {
    if (params.page !== page) {
      loading.value = true
    }

    params.page = page
    syncToUrl()
  }

  function setSort(sort: SortOption | undefined) {
    if (params.sort !== sort || params.page !== 1) {
      loading.value = true
    }

    params.sort = sort
    params.page = 1
    syncToUrl()
  }

  function resetFilters() {
    const keep = { page: 1, limit: params.limit, category: params.category }
    const nextParams = {
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
    }

    const hasChanges = Object.entries(nextParams).some(
      ([key, value]) => params[key as keyof CatalogQuery] !== value,
    )

    if (hasChanges) loading.value = true

    Object.assign(params, nextParams)
    syncToUrl()
  }

  watch(params, fetchProducts, { deep: true, immediate: true })
  // Пошук із шапки на сторінці каталогу змінює лише ?search= — підхоплюємо його
  watch(() => route.query.search, (value) => {
    const next = typeof value === 'string' && value ? value : undefined
    if (params.search !== next) {
      loading.value = true
      params.search = next
      params.page = 1
    }
  })

  watch(routeCategory, (category) => {
    if (params.category !== category) {
      loading.value = true
      params.category = category
      params.page = 1
    }
  })

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
