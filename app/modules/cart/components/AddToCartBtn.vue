<script setup lang="ts">
import { useCartStore } from '~/modules/cart/cartStore'

interface Props {
  variantId: number | null
  disabled?: boolean
  compact?: boolean // без посилання «Продовжити покупки» (нижня панель)
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  compact: false,
})

const cartStore = useCartStore()
const toast = useToast()
const isAdding = ref(false)
const isDisabled = computed(() => props.disabled || !props.variantId || isAdding.value)
// Цей варіант уже в кошику — замість «Додати» пропонуємо перейти до оформлення
const isInCart = computed(() => Boolean(props.variantId && cartStore.cart?.items.some(item => item.variant.id === props.variantId)))

async function handleAdd() {
  if (!props.variantId) return

  isAdding.value = true
  try {
    await cartStore.addToCart(props.variantId, 1)
    cartStore.isDrawerOpen = true
  } catch {
    toast.error('Не вдалося додати товар у кошик')
  } finally {
    isAdding.value = false
  }
}
</script>

<template>
  <div v-if="isInCart" class="flex w-full flex-col items-center gap-1.5">
    <BBtn variant="primary" size="md" block to="/cart">
      <Icon name="lucide:check" size="16" />
      У кошику — оформити
    </BBtn>
    <NuxtLink v-if="!compact" to="/catalog" class="text-xs text-secondary-500 underline-offset-4 hover:text-primary-700 hover:underline">
      Продовжити покупки
    </NuxtLink>
  </div>
  <BBtn
    v-else
    variant="primary"
    size="md"
    block
    :loading="isAdding"
    :disabled="isDisabled"
    @click="handleAdd"
  >
    Додати в кошик
  </BBtn>
</template>
