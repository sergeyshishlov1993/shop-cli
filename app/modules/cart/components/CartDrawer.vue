<script setup lang="ts">
import { useCartStore } from '~/modules/cart/cartStore'
import CartItem from '~/modules/cart/components/CartItem.vue'
import { catalogApi } from '~/modules/catalog/catalogApi'
import ProductCard from '~/modules/catalog/components/ProductCard.vue'

interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const cartStore = useCartStore()

const close = () => emit('update:modelValue', false)

// Рекомендації як у Gepur: «з цим купують» + схожі до останнього доданого товару, добиваємо хітами; без того, що вже в кошику
const recommended = ref<ProductListItem[]>([])
watch(() => props.modelValue, async (open) => {
  const items = cartStore.cart?.items
  if (!open || !items?.length) return
  const inCart = new Set(items.map(item => item.product.id))
  const related = await catalogApi.getRelatedProducts(items.at(-1)!.product.slug).catch(() => null)
  const list = [...(related?.boughtTogether ?? []), ...(related?.similar ?? [])]
  if (list.length < 6) list.push(...(await catalogApi.getProducts({ isHit: true, limit: 8 }).catch(() => null))?.items ?? [])
  recommended.value = [...new Map(list.filter(p => !inCart.has(p.id)).map(p => [p.id, p])).values()].slice(0, 8)
})

// Щойно доданий з рекомендацій товар зникає зі стрічки
const visibleRecommended = computed(() => recommended.value.filter(p => !cartStore.cart?.items.some(item => item.product.id === p.id)))

// Перехід на товар з рекомендацій — шторку закриваємо
const route = useRoute()
watch(() => route.fullPath, close)
</script>

<template>
  <BDrawer
      :model-value="modelValue"
      side="right"
      title="Кошик"
      width="w-96"
      @update:model-value="emit('update:modelValue', $event)"
  >
    <div v-if="cartStore.isEmpty" class="flex flex-1 flex-col items-center justify-center gap-4 p-5 py-12">
      <Icon name="mdi:cart-outline" class="h-16 w-16 text-secondary-300" />
      <p class="text-sm text-secondary-500">Кошик порожній</p>
      <BBtn variant="outline" size="sm" @click="close">
        Продовжити покупки
      </BBtn>
    </div>

    <div v-else class="flex flex-col gap-4 p-5">
      <CartItem
          v-for="item in cartStore.cart?.items"
          :key="item.id"
          :item="item"
      />

    </div>

    <template v-if="!cartStore.isEmpty" #footer>
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-secondary-900">Разом {{ cartStore.itemsCount }} од.</span>
          <span class="text-sm font-semibold text-secondary-950">{{ formatPrice(cartStore.subtotal) }}</span>
        </div>
        <BBtn variant="primary" block to="/checkout" @click="close">Оформити замовлення</BBtn>
        <BBtn variant="outline" block to="/cart" @click="close">Переглянути кошик</BBtn>

        <!-- Рекомендації як у Gepur: горизонтальні міні-картки на сірому тлі, закріплені внизу -->
        <section v-if="visibleRecommended.length" class="-mx-5 -mb-5 mt-2 bg-secondary-50 px-5 py-3">
          <h3 class="mb-2 text-xs font-medium uppercase tracking-[0.12em] text-secondary-600">Вам може сподобатися</h3>
          <div v-drag-scroll class="-mx-5 flex gap-4 overflow-x-auto px-5 [scrollbar-width:none]">
            <div v-for="item in visibleRecommended" :key="item.id" class="w-[calc(50%-0.5rem)] shrink-0">
              <ProductCard :product="item" mini />
            </div>
          </div>
        </section>
      </div>
    </template>
  </BDrawer>
</template>