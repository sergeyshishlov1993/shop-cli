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
  page?: number
  limit?: number
}

interface AccountOrdersResponse {
  items: Order[]
  totalCount: number
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
