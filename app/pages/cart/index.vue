<script setup lang="ts">
import CartItem from '~/modules/cart/components/CartItem.vue'
import CartSummary from '~/modules/cart/components/CartSummary.vue'
import { useCartStore } from '~/modules/cart/cartStore'
import { catalogApi } from '~/modules/catalog/catalogApi'
import ProductCard from '~/modules/catalog/components/ProductCard.vue'

const cartStore = useCartStore()

// Рекомендації під кошиком на мобільному (як у Gepur) — беремо хіти.
const { data: recommended } = await useAsyncData('cart-recommended', async () => {
  const response = await catalogApi.getProducts({ isHit: true, limit: 8 }).catch(() => null)
  return response?.items ?? []
}, { default: () => [] })

useHead({
  title: 'Кошик',
})
</script>

<template>
  <div class="store-page store-container py-4 max-lg:pb-40 lg:py-8">
    <div class="max-lg:hidden"><BBreadcrumbs :items="[{ label: 'Головна', to: '/' }, { label: 'Кошик' }]" /></div>

    <h1 class="mb-4 text-xl font-medium text-secondary-900 lg:mt-4 lg:mb-6 lg:text-2xl lg:font-bold">Кошик</h1>

    <div v-if="cartStore.isEmpty" class="flex flex-col items-center justify-center gap-4 py-16">
      <Icon name="mdi:cart-outline" class="h-20 w-20 text-gray-300" />
      <p class="text-base text-gray-500">Кошик порожній</p>
      <BBtn variant="primary" size="md" to="/catalog">
        Перейти до каталогу
      </BBtn>
    </div>

    <div v-else class="flex gap-6 lg:gap-12">
      <div class="flex-1 min-w-0">
        <div class="flex flex-col">
          <div
              v-for="item in cartStore.cart?.items"
              :key="item.id"
              class="border-b border-secondary-200 py-4 first:pt-0 lg:py-6"
          >
            <CartItem :item="item" />
          </div>
        </div>
      </div>

      <aside class="hidden w-96 shrink-0 lg:block">
        <div class="sticky top-36">
          <CartSummary />
        </div>
      </aside>
    </div>

    <section v-if="!cartStore.isEmpty && recommended.length" class="mt-8 lg:mt-14">
      <h2 class="store-title mb-3 text-base lg:mb-6 lg:text-3xl"><NuxtLink to="/catalog?isHit=true" class="group inline-flex items-center gap-1 transition-colors hover:text-primary-700">Вам може сподобатись <Icon name="lucide:chevron-right" size="20" class="transition-transform group-hover:translate-x-0.5" /></NuxtLink></h2>
      <ProductRail>
        <ProductCard v-for="product in recommended" :key="product.id" :product="product" compact />
      </ProductRail>
    </section>

    <div
        v-if="!cartStore.isEmpty"
        class="glass fixed inset-x-0 bottom-0 z-30 rounded-t-2xl px-4 pb-4 pt-3 lg:hidden"
    >
      <div class="mb-3 flex items-center justify-between text-sm text-secondary-800">
        <span>Разом {{ cartStore.itemsCount }} од.</span>
        <span class="text-base font-semibold text-secondary-900">{{ formatPrice(cartStore.subtotal) }}</span>
      </div>
      <BBtn variant="primary" size="lg" block to="/checkout">Оформити замовлення</BBtn>
    </div>
  </div>
</template>
