interface CreateOrderDto {
  customerName: string
  customerPhone: string
  customerEmail?: string
  deliveryProvider?: string
  city?: string
  warehouse?: string
  addressLine?: string
  postalCode?: string
  deliveryComment?: string
  deliveryProfileId?: number
}

export const orderApi = {
  create(dto: CreateOrderDto, idempotencyKey?: string) {
    const { $api } = useNuxtApp()
    return $api<Order>('/storefront/orders', {
      method: 'POST',
      body: dto,
      headers: idempotencyKey
        ? { 'x-idempotency-key': idempotencyKey }
        : undefined,
    })
  },

  getTracking(orderId: number) {
    const { $api } = useNuxtApp()
    return $api(`/storefront/orders/${orderId}/tracking`)
  },
}
