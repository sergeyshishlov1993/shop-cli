export const useOrderStore = defineStore('order', () => {
  const lastOrder = ref<Order | null>(null)
  const creating = ref(false)

  async function createOrder(dto: Parameters<typeof orderApi.create>[0], idempotencyKey?: string) {
    creating.value = true
    try {
      lastOrder.value = await orderApi.create(dto, idempotencyKey)
      return lastOrder.value
    }
    finally {
      creating.value = false
    }
  }

  return {
    lastOrder,
    creating,
    createOrder,
  }
})
