export function usePagination(initialPage = 1, initialLimit = 12) {
  const page = ref(initialPage)
  const limit = ref(initialLimit)
  const totalCount = ref(0)

  const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / limit.value)))
  const hasNextPage = computed(() => page.value < totalPages.value)
  const hasPrevPage = computed(() => page.value > 1)

  function nextPage() {
    if (hasNextPage.value) {
      page.value += 1
    }
  }

  function prevPage() {
    if (hasPrevPage.value) {
      page.value -= 1
    }
  }

  function goToPage(nextPageValue: number) {
    page.value = Math.min(Math.max(1, nextPageValue), totalPages.value)
  }

  function reset() {
    page.value = initialPage
    limit.value = initialLimit
    totalCount.value = 0
  }

  return {
    page,
    limit,
    totalCount,
    totalPages,
    hasNextPage,
    hasPrevPage,
    nextPage,
    prevPage,
    goToPage,
    reset,
  }
}
