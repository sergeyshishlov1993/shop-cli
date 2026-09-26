import { accountApi } from '~/modules/account/accountApi'
import { useAuthStore } from '~/modules/auth/authStore'

export const useAccountStore = defineStore('account', () => {
  const profile = ref<UserProfile | null>(null)
  const orders = ref<AccountOrderSummary[]>([])
  const ordersTotalCount = ref(0)
  const deliveryProfiles = ref<DeliveryProfile[]>([])
  const loading = ref(false)

  async function fetchProfile() {
    loading.value = true
    try {
      profile.value = await accountApi.getProfile()
    }
    finally {
      loading.value = false
    }
  }

  async function updateProfile(dto: Parameters<typeof accountApi.updateProfile>[0]) {
    profile.value = await accountApi.updateProfile(dto)
    useAuthStore().setUser(profile.value)
  }

  async function uploadAvatar(file: File) {
    profile.value = await accountApi.uploadAvatar(file)
    useAuthStore().setUser(profile.value)
  }

  async function deleteAvatar() {
    profile.value = await accountApi.deleteAvatar()
    useAuthStore().setUser(profile.value)
  }

  async function changePassword(dto: Parameters<typeof accountApi.changePassword>[0]) {
    await accountApi.changePassword(dto)
  }

  async function fetchOrders(query?: Parameters<typeof accountApi.getOrders>[0]) {
    loading.value = true
    try {
      const response = await accountApi.getOrders(query)
      orders.value = response.items
      ordersTotalCount.value = response.meta.total
    }
    finally {
      loading.value = false
    }
  }

  async function fetchDeliveryProfiles() {
    deliveryProfiles.value = await accountApi.getDeliveryProfiles()
  }

  async function createDeliveryProfile(dto: Parameters<typeof accountApi.createDeliveryProfile>[0]) {
    const created = await accountApi.createDeliveryProfile(dto)
    deliveryProfiles.value.push(created)
    return created
  }

  async function updateDeliveryProfile(profileId: number, dto: Parameters<typeof accountApi.updateDeliveryProfile>[1]) {
    const updated = await accountApi.updateDeliveryProfile(profileId, dto)
    const index = deliveryProfiles.value.findIndex(item => item.id === profileId)
    if (index !== -1) deliveryProfiles.value[index] = updated
    return updated
  }

  async function deleteDeliveryProfile(profileId: number) {
    await accountApi.deleteDeliveryProfile(profileId)
    deliveryProfiles.value = deliveryProfiles.value.filter(item => item.id !== profileId)
  }

  return {
    profile,
    orders,
    ordersTotalCount,
    deliveryProfiles,
    loading,
    fetchProfile,
    updateProfile,
    uploadAvatar,
    deleteAvatar,
    changePassword,
    fetchOrders,
    fetchDeliveryProfiles,
    createDeliveryProfile,
    updateDeliveryProfile,
    deleteDeliveryProfile,
  }
})
