// v-drag-scroll: горизонтальні стрічки можна схопити мишею і потягнути (на тач-екранах працює нативний свайп).
// Якщо тягнули більше ніж на 5px — клік по картці/посиланню після відпускання скасовується.
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive<HTMLElement>('drag-scroll', {
    mounted(el) {
      let startX = 0
      let startScroll = 0
      let moved = false
      let pointerId: number | null = null

      el.addEventListener('pointerdown', (e) => {
        if (e.pointerType !== 'mouse' || e.button !== 0) return
        pointerId = e.pointerId
        startX = e.clientX
        startScroll = el.scrollLeft
        moved = false
      })

      el.addEventListener('pointermove', (e) => {
        if (pointerId !== e.pointerId) return
        const dx = e.clientX - startX
        if (!moved && Math.abs(dx) > 5) {
          moved = true
          el.setPointerCapture(e.pointerId)
          el.style.scrollSnapType = 'none'
          el.style.cursor = 'grabbing'
          el.style.userSelect = 'none'
          window.getSelection()?.removeAllRanges()
        }
        if (moved) el.scrollLeft = startScroll - dx
      })

      const end = (e: PointerEvent) => {
        if (pointerId !== e.pointerId) return
        pointerId = null
        el.style.scrollSnapType = ''
        el.style.cursor = ''
        el.style.userSelect = ''
        // Після перетягування браузер сам не «доводить» до слайда — докручуємо до найближчого (якщо стрічка зі snap)
        const step = (el.firstElementChild?.getBoundingClientRect().width ?? 0) + (parseFloat(getComputedStyle(el).columnGap) || 0)
        if (moved && step && getComputedStyle(el).scrollSnapType !== 'none') el.scrollTo({ left: Math.round(el.scrollLeft / step) * step, behavior: 'smooth' })
      }
      el.addEventListener('pointerup', end)
      el.addEventListener('pointercancel', end)

      el.addEventListener('click', (e) => {
        if (moved) {
          e.preventDefault()
          e.stopPropagation()
          moved = false
        }
      }, true)

      el.addEventListener('dragstart', e => e.preventDefault())
      el.style.cursor = 'grab'
    },
    getSSRProps: () => ({}),
  })
})
