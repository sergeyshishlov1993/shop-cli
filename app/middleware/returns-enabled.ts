// Якщо повернення вимкнені в налаштуваннях — сторінки повернень недоступні
export default defineNuxtRouteMiddleware(() => {
  if (!useReturnsEnabled().value) return navigateTo('/account')
})
