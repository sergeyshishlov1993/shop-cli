export const deliveryApi = {
  searchCities(search: string) {
    const { $api } = useNuxtApp()
    return $api<DeliveryCity[]>('/delivery/cities', {
      params: { search },
    })
  },

  searchWarehouses(city: string, search?: string) {
    const { $api } = useNuxtApp()
    return $api<DeliveryWarehouse[]>('/delivery/warehouses', {
      params: { city, search },
    })
  },
}
