export const useFavoritesStore = defineStore('favorites', () => {
  const items = ref<ProductListItem[]>([])
  const totalCount = ref(0)
  const favoriteIds = ref<Set<number>>(new Set())
  const loading = ref(false)

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
    if (!productIds.length) return
    const result = await favoritesApi.check(productIds)
    for (const id of productIds) {
      if (result[id]) {
        favoriteIds.value.add(id)
      }
      else {
        favoriteIds.value.delete(id)
      }
    }
  }

  function isFavorite(productId: number): boolean {
    return favoriteIds.value.has(productId)
  }

  async function toggle(productId: number) {
    if (favoriteIds.value.has(productId)) {
      await favoritesApi.remove(productId)
      favoriteIds.value.delete(productId)
      items.value = items.value.filter(item => item.id !== productId)
      totalCount.value--
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
  }

  return {
    items,
    totalCount,
    favoriteIds,
    loading,
    fetchAll,
    checkProducts,
    isFavorite,
    toggle,
    reset,
  }
})
