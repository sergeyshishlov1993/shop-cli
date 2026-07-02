<script setup lang="ts">
import {useCartStore} from '~/modules/cart/cartStore'
interface Props {
  variantId: number
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
})

const cartStore = useCartStore()
const isAdding = ref(false)

async function handleAdd() {
  isAdding.value = true
  try {
    await cartStore.addToCart(props.variantId, 1)
  } finally {
    isAdding.value = false
  }
}
</script>



<template>
  <BBtn
      variant="primary"
      size="md"
      block
      :loading="isAdding"
      :disabled="disabled"
      @click="handleAdd"
  >
    Додати в кошик
  </BBtn>
</template>