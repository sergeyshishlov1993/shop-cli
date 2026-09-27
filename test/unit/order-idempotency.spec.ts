import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clearOrderIdempotencyKey, getOrderIdempotencyKey } from '~/modules/order/idempotency'

describe('order idempotency key', () => {
  beforeEach(() => {
    clearOrderIdempotencyKey()
    sessionStorage.clear()
  })

  it('reuses a key for the same payload and cart after a retry', async () => {
    const createKey = vi.fn(() => 'attempt-1')
    const payload = { customerName: 'Ada' }
    const cart = [{ variant: { id: 4 }, quantity: 2 }]

    expect(await getOrderIdempotencyKey(payload, cart, createKey)).toBe('attempt-1')
    expect(await getOrderIdempotencyKey(payload, cart, createKey)).toBe('attempt-1')
    expect(createKey).toHaveBeenCalledOnce()
    expect(sessionStorage.getItem('shop-pending-order-attempt')).not.toContain('Ada')
  })

  it('starts a new key when the payload or cart changes', async () => {
    const createKey = vi.fn().mockReturnValueOnce('attempt-1').mockReturnValueOnce('attempt-2')
    const cart = [{ variant: { id: 4 }, quantity: 2 }]

    expect(await getOrderIdempotencyKey({ customerName: 'Ada' }, cart, createKey)).toBe('attempt-1')
    expect(await getOrderIdempotencyKey({ customerName: 'Grace' }, cart, createKey)).toBe('attempt-2')
  })

  it('clears the pending key after a successful order', async () => {
    const createKey = vi.fn().mockReturnValueOnce('attempt-1').mockReturnValueOnce('attempt-2')
    const payload = { customerName: 'Ada' }
    const cart = [{ variant: { id: 4 }, quantity: 2 }]

    expect(await getOrderIdempotencyKey(payload, cart, createKey)).toBe('attempt-1')
    clearOrderIdempotencyKey()
    expect(await getOrderIdempotencyKey(payload, cart, createKey)).toBe('attempt-2')
  })
})
