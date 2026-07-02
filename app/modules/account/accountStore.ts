export const useAccountStore = defineStore('account', () => {
  const profile = ref<UserProfile | null>(null)
  const orders = ref<Order[]>([])
  const ordersTotalCount = ref(0)
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
  }

  async function changePassword(dto: Parameters<typeof accountApi.changePassword>[0]) {
    await accountApi.changePassword(dto)
  }

  async function fetchOrders(query?: Parameters<typeof accountApi.getOrders>[0]) {
    loading.value = true
    try {
      const response = await accountApi.getOrders(query)
      orders.value = response.items
      ordersTotalCount.value = response.totalCount
    }
    finally {
      loading.value = false
    }
  }

  async function fetchDeliveryProfiles() {
    const profiles = await accountApi.getDeliveryProfiles()
    if (profile.value) {
      profile.value.deliveryProfiles = profiles
    }
  }

  async function createDeliveryProfile(dto: Parameters<typeof accountApi.createDeliveryProfile>[0]) {
    const created = await accountApi.createDeliveryProfile(dto)
    if (profile.value) {
      profile.value.deliveryProfiles.push(created)
    }
    return created
  }

  async function updateDeliveryProfile(profileId: number, dto: Parameters<typeof accountApi.updateDeliveryProfile>[1]) {
    const updated = await accountApi.updateDeliveryProfile(profileId, dto)
    if (profile.value) {
      const index = profile.value.deliveryProfiles.findIndex(item => item.id === profileId)
      if (index !== -1) profile.value.deliveryProfiles[index] = updated
    }
    return updated
  }

  async function deleteDeliveryProfile(profileId: number) {
    await accountApi.deleteDeliveryProfile(profileId)
    if (profile.value) {
      profile.value.deliveryProfiles = profile.value.deliveryProfiles.filter(item => item.id !== profileId)
    }
  }

  return {
    profile,
    orders,
    ordersTotalCount,
    loading,
    fetchProfile,
    updateProfile,
    changePassword,
    fetchOrders,
    fetchDeliveryProfiles,
    createDeliveryProfile,
    updateDeliveryProfile,
    deleteDeliveryProfile,
  }
})
