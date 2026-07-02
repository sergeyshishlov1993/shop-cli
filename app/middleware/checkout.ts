import { useCartStore } from '~/modules/cart/cartStore'

export default defineNuxtRouteMiddleware(() => {
  const cartStore = useCartStore()

  if (cartStore.isEmpty) {
    return navigateTo('/cart')
  }
})
