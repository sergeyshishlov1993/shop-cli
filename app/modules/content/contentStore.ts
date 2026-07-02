export const useContentStore = defineStore('content', () => {
  const heroSlides = ref<HeroSlide[]>([])
  const promoBlocks = ref<PromoBlock[]>([])
  const currentPage = ref<PageContent | null>(null)
  const loading = ref(false)

  async function fetchHeroSlides() {
    if (heroSlides.value.length) return
    heroSlides.value = await contentApi.getHeroSlides()
  }

  async function fetchPromoBlocks(type?: PromoBlockType) {
    loading.value = true
    try {
      promoBlocks.value = await contentApi.getPromoBlocks(type)
    }
    finally {
      loading.value = false
    }
  }

  async function fetchPage(slug: string) {
    loading.value = true
    try {
      currentPage.value = await contentApi.getPage(slug)
    }
    finally {
      loading.value = false
    }
  }

  return {
    heroSlides,
    promoBlocks,
    currentPage,
    loading,
    fetchHeroSlides,
    fetchPromoBlocks,
    fetchPage,
  }
})
