export const contentApi = {
  getHeroSlides() {
    const { $api } = useNuxtApp()
    return $api<HeroSlide[]>('/storefront/hero-slides')
  },

  getPromoBlocks(type?: PromoBlockType) {
    const { $api } = useNuxtApp()
    return $api<PromoBlock[]>('/storefront/promo-blocks', {
      params: type ? { type } : undefined,
    })
  },

  getPage(slug: string) {
    const { $api } = useNuxtApp()
    return $api<PageContent>(`/storefront/pages/${slug}`)
  },
}
