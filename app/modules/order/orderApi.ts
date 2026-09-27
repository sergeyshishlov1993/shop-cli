interface CreateOrderDto {
  customerName: string
  customerPhone: string
  customerEmail?: string
  deliveryProvider?: string
  city?: string
  warehouse?: string
  addressLine?: string
  postalCode?: string
  comment?: string
  deliveryProfileId?: number
  utmSource?: string | null
  utmMedium?: string | null
  utmCampaign?: string | null
  utmContent?: string | null
  utmTerm?: string | null
  referer?: string | null
  couponCode?: string
}

export const orderApi = {
  create(dto: CreateOrderDto, idempotencyKey: string) {
    const { $api } = useNuxtApp()
    return $api<Order>('/storefront/orders', {
      method: 'POST',
      body: dto,
      headers: { 'x-idempotency-key': idempotencyKey },
    })
  },

  getTracking(orderId: number) {
    const { $api } = useNuxtApp()
    return $api(`/storefront/orders/${orderId}/tracking`)
  },
}
