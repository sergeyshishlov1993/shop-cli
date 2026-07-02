import type { Cart, AddCartItemDto, UpdateCartItemDto } from '~/modules/cart/types/cart'

export const cartApi = {
    getCart() {
        const { $api } = useNuxtApp()
        return $api<Cart>('/storefront/cart')
    },

    addItem(dto: AddCartItemDto) {
        const { $api } = useNuxtApp()
        return $api<Cart>('/storefront/cart/items', {
            method: 'POST',
            body: dto,
        })
    },

    updateItem(itemId: number, dto: UpdateCartItemDto) {
        const { $api } = useNuxtApp()
        return $api<Cart>(`/storefront/cart/items/${itemId}`, {
            method: 'PATCH',
            body: dto,
        })
    },

    removeItem(itemId: number) {
        const { $api } = useNuxtApp()
        return $api<Cart>(`/storefront/cart/items/${itemId}`, {
            method: 'DELETE',
        })
    },
}