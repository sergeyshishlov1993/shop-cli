interface UpdateProfileDto {
  firstName?: string
  lastName?: string
  phone?: string
}

interface ChangePasswordDto {
  currentPassword: string
  newPassword: string
}

interface AccountOrdersQuery {
  status?: OrderStatus
  orderNumber?: string
  date?: string
  page?: number
  limit?: number
}

interface AccountOrderDetail {
  id: number
  orderNumber: string
  status: OrderStatus
  totalAmount: number
  subtotal: number
  discountAmount: number
  deliveryAmount: number
  deliveryProvider: string | null
  city: string | null
  warehouse: string | null
  addressLine: string | null
  trackingNumber: string | null
  createdAt: string
  items: Array<{ id: number, productName: string, sku: string, sizeName: string | null, colorName: string | null, salePrice: number, quantity: number, lineRevenue: number, image?: FileRecord | null }>
  statusHistory: Array<{ id: number, oldStatus: OrderStatus | null, newStatus: OrderStatus, note: string | null, createdAt: string }>
}

interface AccountTrackingInfo {
  ttn: string
  statusCode: string
  statusDescription: string
  citySender?: string
  cityRecipient?: string
  warehouseRecipient?: string
  dateCreated?: string
  scheduledDeliveryDate?: string
  actualDeliveryDate?: string
  orderStatus?: OrderStatus
  statusChanged?: boolean
}

interface AccountOrdersResponse {
  items: AccountOrderSummary[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface CreateDeliveryProfileDto {
  title: string
  recipientFirstName: string
  recipientLastName: string
  recipientPhone: string
  deliveryProvider: string
  city: string
  warehouse?: string
  addressLine?: string
  postalCode?: string
  comment?: string
  isDefault?: boolean
}

type UpdateDeliveryProfileDto = Partial<CreateDeliveryProfileDto>

export const accountApi = {
  getProfile() {
    const { $api } = useNuxtApp()
    return $api<UserProfile>('/storefront/account/profile')
  },

  updateProfile(dto: UpdateProfileDto) {
    const { $api } = useNuxtApp()
    return $api<UserProfile>('/storefront/account/profile', {
      method: 'PATCH',
      body: dto,
    })
  },

  uploadAvatar(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    return useNuxtApp().$api<UserProfile>('/storefront/account/avatar', {
      method: 'POST',
      body: formData,
    })
  },

  deleteAvatar() {
    return useNuxtApp().$api<UserProfile>('/storefront/account/avatar', {
      method: 'DELETE',
    })
  },

  changePassword(dto: ChangePasswordDto) {
    const { $api } = useNuxtApp()
    return $api('/storefront/account/password', {
      method: 'PATCH',
      body: dto,
    })
  },

  getOrders(query?: AccountOrdersQuery) {
    const { $api } = useNuxtApp()
    return $api<AccountOrdersResponse>('/storefront/account/orders', {
      params: query,
    })
  },

  getOrder(orderId: number) {
    return useNuxtApp().$api<AccountOrderDetail>(`/storefront/account/orders/${orderId}`)
  },

  getOrderTracking(orderId: number) {
    return useNuxtApp().$api<AccountTrackingInfo | null>(`/storefront/orders/${orderId}/tracking`)
  },

  reorder(orderId: number) {
    return useNuxtApp().$api<{ added: unknown[], skipped: unknown[] }>(`/storefront/account/orders/${orderId}/reorder`, { method: 'POST' })
  },

  getDeliveryProfiles() {
    const { $api } = useNuxtApp()
    return $api<DeliveryProfile[]>('/storefront/account/delivery-profiles')
  },

  createDeliveryProfile(dto: CreateDeliveryProfileDto) {
    const { $api } = useNuxtApp()
    return $api<DeliveryProfile>('/storefront/account/delivery-profiles', {
      method: 'POST',
      body: dto,
    })
  },

  updateDeliveryProfile(profileId: number, dto: UpdateDeliveryProfileDto) {
    const { $api } = useNuxtApp()
    return $api<DeliveryProfile>(`/storefront/account/delivery-profiles/${profileId}`, {
      method: 'PATCH',
      body: dto,
    })
  },

  deleteDeliveryProfile(profileId: number) {
    const { $api } = useNuxtApp()
    return $api(`/storefront/account/delivery-profiles/${profileId}`, {
      method: 'DELETE',
    })
  },
}
