import { useCartStore } from '~/modules/cart/cartStore'

export default defineNuxtRouteMiddleware(async () => {
  const cartStore = useCartStore()

  if (!cartStore.cart) {
    try {
      await cartStore.fetchCart()
    }
    catch {
      return navigateTo('/cart')
    }
  }

  if (cartStore.isEmpty) {
    return navigateTo('/cart')
  }
})
