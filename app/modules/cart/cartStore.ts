import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { cartApi } from '~/modules/cart/cartApi'
import type { Cart, AddCartItemDto, UpdateCartItemDto } from '~/modules/cart/types/cart'

export const useCartStore = defineStore('cart', () => {
    const cart = ref<Cart | null>(null)
    const isLoading = ref(false)

    const itemsCount = computed(() => cart.value?.totalItems ?? 0)
    const subtotal = computed(() => cart.value?.subtotal ?? 0)
    const isEmpty = computed(() => (cart.value?.items.length ?? 0) === 0)

    async function fetchCart(): Promise<Cart> {
        isLoading.value = true
        try {
            const response = await cartApi.getCart()
            cart.value = response
            return response
        } finally {
            isLoading.value = false
        }
    }

    async function addToCart(variantId: number, quantity: number): Promise<Cart> {
        isLoading.value = true
        try {
            const response = await cartApi.addItem({ variantId, quantity })
            cart.value = response
            return response
        } finally {
            isLoading.value = false
        }
    }

    async function updateQuantity(itemId: number, quantity: number): Promise<Cart> {
        isLoading.value = true
        try {
            const response = await cartApi.updateItem(itemId, { quantity })
            cart.value = response
            return response
        } finally {
            isLoading.value = false
        }
    }

    async function removeFromCart(itemId: number): Promise<Cart> {
        isLoading.value = true
        try {
            const response = await cartApi.removeItem(itemId)
            cart.value = response
            return response
        } finally {
            isLoading.value = false
        }
    }

    function clearCart(): void {
        cart.value = null
    }

    return {
        cart,
        isLoading,
        itemsCount,
        subtotal,
        isEmpty,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
    }
})