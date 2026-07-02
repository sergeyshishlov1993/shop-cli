<script setup lang="ts">
import { useCartStore } from '~/modules/cart/cartStore'

interface Props {
  modelValue: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const cartStore = useCartStore()

function close() {
  emit('update:modelValue', false)
}
</script>

<template>
  <BDrawer
      :model-value="modelValue"
      side="right"
      title="Кошик"
      width="w-96"
      @update:model-value="emit('update:modelValue', $event)"
  >
    <div v-if="cartStore.isEmpty" class="flex flex-1 flex-col items-center justify-center gap-4 py-12">
      <Icon name="mdi:cart-outline" class="h-16 w-16 text-gray-300" />
      <p class="text-sm text-gray-500">Кошик порожній</p>
      <BBtn variant="outline" size="sm" @click="close">
        Продовжити покупки
      </BBtn>
    </div>

    <div v-else class="flex flex-col gap-4">
      <CartItem
          v-for="item in cartStore.cart?.items"
          :key="item.id"
          :item="item"
      />
    </div>

    <template v-if="!cartStore.isEmpty" #footer>
      <div class="flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600">Разом ({{ cartStore.itemsCount }})</span>
          <span class="text-base font-bold text-gray-900">{{ formatPrice(cartStore.subtotal) }}</span>
        </div>

        <BBtn
            variant="primary"
            size="lg"
            block
            to="/checkout"
            @click="close"
        >
          Оформити замовлення
        </BBtn>
      </div>
    </template>
  </BDrawer>
</template>