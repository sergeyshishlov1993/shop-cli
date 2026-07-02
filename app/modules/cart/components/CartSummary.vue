<script setup lang="ts">
import { useCartStore } from '~/modules/cart/cartStore'

interface Props {
  compact?: boolean
}

withDefaults(defineProps<Props>(), {
  compact: false,
})

const cartStore = useCartStore()
</script>

<template>
  <div
      v-if="compact"
      class="flex items-center gap-3"
  >
    <div class="flex flex-1 flex-col">
      <span class="text-xs text-gray-500">{{ cartStore.itemsCount }} товарів</span>
      <span class="text-base font-bold text-gray-900">{{ formatPrice(cartStore.subtotal) }}</span>
    </div>
    <BBtn
        variant="primary"
        size="md"
        to="/checkout"
        :disabled="cartStore.isEmpty"
    >
      Оформити
    </BBtn>
  </div>

  <div
      v-else
      class="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5"
  >
    <h3 class="text-base font-semibold text-gray-900">Разом</h3>

    <div class="flex flex-col gap-2 text-sm">
      <div class="flex items-center justify-between text-gray-600">
        <span>Товари ({{ cartStore.itemsCount }})</span>
        <span>{{ formatPrice(cartStore.subtotal) }}</span>
      </div>
    </div>

    <div class="border-t border-gray-200 pt-3">
      <div class="flex items-center justify-between">
        <span class="text-base font-semibold text-gray-900">До сплати</span>
        <span class="text-lg font-bold text-gray-900">{{ formatPrice(cartStore.subtotal) }}</span>
      </div>
    </div>

    <BBtn
        variant="primary"
        size="lg"
        block
        to="/checkout"
        :disabled="cartStore.isEmpty"
    >
      Оформити замовлення
    </BBtn>
  </div>
</template>