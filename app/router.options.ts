import type { RouterConfig } from '@nuxt/schema'

// Прокрутка при навігації: «назад/вперед» — на збережену позицію, якір — до елемента,
// будь-яка інша зміна маршруту (зокрема лише ?page= чи фільтрів) — нагору сторінки.
// Між різними сторінками чекаємо кінця анімації переходу: інакше стара сторінка встигає
// прокрутитися нагору під час згасання, і видно шматок її верху перед новою.
export default <RouterConfig>{
  scrollBehavior(to, from, savedPosition) {
    const position = savedPosition
      ?? (to.hash ? { el: to.hash, behavior: 'smooth' as const, top: 96 }
        : to.path === from.path && to.query.page === from.query.page ? false
          : { top: 0 })
    if (!position || to.path === from.path || to.meta.pageTransition === false || from.meta.pageTransition === false) return position

    const { hooks } = useNuxtApp()
    return new Promise((resolve) => {
      // Запасний вихід, якщо подія переходу не прийде (напр. той самий компонент без переходу)
      const timer = setTimeout(() => resolve(position), 800)
      hooks.hookOnce('page:transition:finish', () => {
        clearTimeout(timer)
        resolve(position)
      })
    })
  },
}
