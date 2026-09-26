import type { RouterConfig } from '@nuxt/schema'

// Прокрутка при навігації: «назад/вперед» — на збережену позицію, якір — до елемента,
// будь-яка інша зміна маршруту (зокрема лише ?page= чи фільтрів) — нагору сторінки.
export default <RouterConfig>{
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth', top: 96 }
    if (to.path === from.path && to.query.page === from.query.page) return false
    return { top: 0 }
  },
}
