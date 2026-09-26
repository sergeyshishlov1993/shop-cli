import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mockNuxtImport, registerEndpoint } from '@nuxt/test-utils/runtime'
import { useProductList } from '~/modules/catalog/composables/useProductList'

const { route } = vi.hoisted(() => ({
  route: { params: {} as Record<string, unknown>, query: {} as Record<string, unknown> },
}))
mockNuxtImport('useRoute', () => () => route)
let replace: ReturnType<typeof vi.fn>

registerEndpoint('/storefront/products', () => ({ items: [], totalCount: 0, filters: null }))

function setRoute(query: Record<string, unknown>, params: Record<string, unknown> = {}) {
  route.query = query
  route.params = params
}

describe('useProductList', () => {
  beforeEach(() => {
    replace = vi.spyOn(useRouter(), 'replace').mockResolvedValue(undefined) as never
  })
  afterEach(() => vi.restoreAllMocks())

  it('parses URL query into params', () => {
    setRoute({
      color: '2, 11,,x',
      size: ['3', '4'],
      brand: 'a,b',
      productType: ' , ',
      priceMin: '100',
      isNew: 'true',
      isHit: 'false',
      page: '3',
      category: 'q',
    })
    const { params } = useProductList()
    expect(params.color).toEqual([2, 11])
    expect(params.size).toEqual([3, 4])
    expect(params.brand).toEqual(['a', 'b'])
    expect(params.productType).toBeUndefined()
    expect(params.priceMin).toBe(100)
    expect(params.priceMax).toBeUndefined()
    expect(params.isNew).toBe(true)
    expect(params.isHit).toBeUndefined()
    expect(params.page).toBe(3)
    expect(params.limit).toBe(24)
    expect(params.category).toBe('q')
  })

  it('route slug wins over ?category', () => {
    setRoute({ category: 'q' }, { slug: 'dresses' })
    expect(useProductList().params.category).toBe('dresses')
  })

  it('syncToUrl skips limit, empty values and route category; resets page', () => {
    setRoute({}, { slug: 'dresses' })
    const list = useProductList()
    list.setFilter('color', [2, 11])
    expect(replace).toHaveBeenLastCalledWith({ query: { color: '2,11', page: '1' } })

    list.setFilter('brand', [])
    list.setFilter('isNew', true)
    expect(replace).toHaveBeenLastCalledWith({ query: { color: '2,11', isNew: 'true', page: '1' } })
  })

  it('keeps non-route category in URL', () => {
    setRoute({ category: 'q' })
    useProductList().setPage(2)
    expect(replace).toHaveBeenLastCalledWith({ query: { category: 'q', page: '2' } })
  })

  it('resetFilters keeps only category and page', () => {
    setRoute({ category: 'q', color: '1', search: 'x', sort: 'price_asc' })
    useProductList().resetFilters()
    expect(replace).toHaveBeenLastCalledWith({ query: { category: 'q', page: '1' } })
  })
})
