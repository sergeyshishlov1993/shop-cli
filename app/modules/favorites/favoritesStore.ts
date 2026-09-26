import { favoritesApi } from '~/modules/favorites/favoritesApi'

export const useFavoritesStore = defineStore('favorites', () => {
  const items = ref<ProductListItem[]>([])
  const totalCount = ref(0)
  const favoriteIds = ref<Set<number>>(new Set())
  const checkedIds = ref<Set<number>>(new Set())
  const loading = ref(false)
  const recommendations = ref<ProductListItem[]>([])

  async function fetchAll(query?: { page?: number; limit?: number }) {
    loading.value = true
    try {
      const response = await favoritesApi.getAll(query)
      items.value = response.items
      totalCount.value = response.totalCount
    }
    finally {
      loading.value = false
    }
  }

  async function checkProducts(productIds: number[]) {
    const uncheckedIds = productIds.filter(id => !checkedIds.value.has(id))
    if (!uncheckedIds.length) return

    uncheckedIds.forEach(id => checkedIds.value.add(id))
    try {
      const result = await favoritesApi.check(uncheckedIds)
      for (const id of uncheckedIds) {
        if (result[id]) {
          favoriteIds.value.add(id)
        }
        else {
          favoriteIds.value.delete(id)
        }
      }
    }
    catch (error) {
      uncheckedIds.forEach(id => checkedIds.value.delete(id))
      throw error
    }
  }

  async function fetchRecommendations() {
    recommendations.value = await favoritesApi.getRecommendations()
  }

  function isFavorite(productId: number): boolean {
    return favoriteIds.value.has(productId)
  }

  async function toggle(productId: number) {
    if (favoriteIds.value.has(productId)) {
      await favoritesApi.remove(productId)
      favoriteIds.value.delete(productId)
      items.value = items.value.filter(item => item.id !== productId)
      totalCount.value = Math.max(0, totalCount.value - 1)
    }
    else {
      await favoritesApi.add(productId)
      favoriteIds.value.add(productId)
      totalCount.value++
    }
  }

  function reset() {
    items.value = []
    totalCount.value = 0
    favoriteIds.value.clear()
    checkedIds.value.clear()
    recommendations.value = []
  }

  return {
    items,
    totalCount,
    favoriteIds,
    loading,
    recommendations,
    fetchAll,
    fetchRecommendations,
    checkProducts,
    isFavorite,
    toggle,
    reset,
  }
})
