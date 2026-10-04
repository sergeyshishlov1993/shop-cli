// v-reveal: блок плавно проявляється (opacity + легкий підйом), коли доскролили до нього.
// Те, що вже видно на першому екрані, не чіпаємо — без блимання після гідрації. Спрацьовує один раз.
// v-reveal="150" — затримка в мс (для каскаду карток).
export default defineNuxtPlugin((nuxtApp) => {
  let observer: IntersectionObserver | null = null

  const show = (el: HTMLElement) => {
    el.classList.add('reveal--in')
    // Після появи прибираємо службові класи, щоб не заважали hover-ефектам самого елемента
    setTimeout(() => {
      el.classList.remove('reveal', 'reveal--in')
      el.style.transitionDelay = ''
    }, 900)
  }

  nuxtApp.vueApp.directive<HTMLElement, number | undefined>('reveal', {
    mounted(el, binding) {
      if (el.getBoundingClientRect().top < window.innerHeight) return
      observer ??= new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          observer!.unobserve(entry.target)
          show(entry.target as HTMLElement)
        }
      }, { rootMargin: '0px 0px -8% 0px' })
      el.classList.add('reveal')
      if (binding.value) el.style.transitionDelay = `${binding.value}ms`
      observer.observe(el)
    },
    unmounted(el) {
      observer?.unobserve(el)
    },
    getSSRProps: () => ({}),
  })
})
