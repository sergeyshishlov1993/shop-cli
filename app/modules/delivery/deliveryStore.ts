export const useDeliveryStore = defineStore('delivery', () => {
  const cities = ref<DeliveryCity[]>([])
  const warehouses = ref<DeliveryWarehouse[]>([])
  const citiesLoading = ref(false)
  const warehousesLoading = ref(false)

  async function searchCities(search: string) {
    citiesLoading.value = true
    try {
      cities.value = await deliveryApi.searchCities(search)
    }
    finally {
      citiesLoading.value = false
    }
  }

  async function searchWarehouses(city: string, search?: string) {
    warehousesLoading.value = true
    try {
      warehouses.value = await deliveryApi.searchWarehouses(city, search)
    }
    finally {
      warehousesLoading.value = false
    }
  }

  function resetWarehouses() {
    warehouses.value = []
  }

  return {
    cities,
    warehouses,
    citiesLoading,
    warehousesLoading,
    searchCities,
    searchWarehouses,
    resetWarehouses,
  }
})
