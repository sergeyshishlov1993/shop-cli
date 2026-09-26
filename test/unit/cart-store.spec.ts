import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useCartStore } from '~/modules/cart/cartStore'
import { cartApi } from '~/modules/cart/cartApi'
import type { Cart } from '~/modules/cart/types/cart'

vi.mock('~/modules/cart/cartApi', () => ({
  cartApi: { getCart: vi.fn(), addItem: vi.fn(), updateItem: vi.fn(), removeItem: vi.fn() },
}))

const cart = (totalItems: number) => ({ items: [{}], totalItems, subtotal: 100 }) as unknown as Cart

function deferred<T>() {
  let resolve!: (v: T) => void
  const promise = new Promise<T>(r => (resolve = r))
  return { promise, resolve }
}

describe('cartStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('addToCart sets loading, then cart', async () => {
    const d = deferred<Cart>()
    vi.mocked(cartApi.addItem).mockReturnValue(d.promise)
    const store = useCartStore()
    const p = store.addToCart(5, 2)
    expect(store.isLoading).toBe(true)
    expect(cartApi.addItem).toHaveBeenCalledWith({ variantId: 5, quantity: 2 })
    d.resolve(cart(2))
    await p
    expect(store.isLoading).toBe(false)
    expect(store.itemsCount).toBe(2)
  })

  it('updateQuantity updates cart', async () => {
    vi.mocked(cartApi.updateItem).mockResolvedValue(cart(7))
    const store = useCartStore()
    await store.updateQuantity(3, 7)
    expect(cartApi.updateItem).toHaveBeenCalledWith(3, { quantity: 7 })
    expect(store.cart?.totalItems).toBe(7)
    expect(store.isLoading).toBe(false)
  })

  it('removeFromCart updates cart', async () => {
    vi.mocked(cartApi.removeItem).mockResolvedValue(cart(0))
    const store = useCartStore()
    await store.removeFromCart(3)
    expect(cartApi.removeItem).toHaveBeenCalledWith(3)
    expect(store.itemsCount).toBe(0)
  })

  it('resets isLoading on failure and keeps previous cart', async () => {
    vi.mocked(cartApi.updateItem).mockRejectedValue(new Error('x'))
    const store = useCartStore()
    store.cart = cart(1)
    await expect(store.updateQuantity(1, 2)).rejects.toThrow('x')
    expect(store.isLoading).toBe(false)
    expect(store.itemsCount).toBe(1)
  })
})
