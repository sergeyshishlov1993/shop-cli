<script setup lang="ts">
import CartItem from '~/modules/cart/components/CartItem.vue'
import CartSummary from '~/modules/cart/components/CartSummary.vue'
import { useCartStore } from '~/modules/cart/cartStore'

const cartStore = useCartStore()

useHead({
  title: 'Кошик',
})
</script>

<template>
  <div class="container mx-auto px-4 py-6">
    <BBreadcrumbs :items="[{ label: 'Головна', to: '/' }, { label: 'Кошик' }]" />

    <h1 class="mt-4 mb-6 text-2xl font-bold text-gray-900">Кошик</h1>

    <div v-if="cartStore.isEmpty" class="flex flex-col items-center justify-center gap-4 py-16">
      <Icon name="mdi:cart-outline" class="h-20 w-20 text-gray-300" />
      <p class="text-base text-gray-500">Кошик порожній</p>
      <BBtn variant="primary" size="md" to="/catalog">
        Перейти до каталогу
      </BBtn>
    </div>

    <div v-else class="flex gap-6 pb-24 lg:pb-0">
      <div class="flex-1 min-w-0">
        <div class="flex flex-col gap-4">
          <div
              v-for="item in cartStore.cart?.items"
              :key="item.id"
              class="rounded-xl border border-gray-200 bg-white p-4"
          >
            <CartItem :item="item" />
          </div>
        </div>
      </div>

      <aside class="hidden lg:block w-80 shrink-0">
        <div class="sticky top-6">
          <CartSummary />
        </div>
      </aside>
    </div>

    <div
        v-if="!cartStore.isEmpty"
        class="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white p-4 shadow-[0_-2px_10px_rgba(0,0,0,0.08)] lg:hidden"
    >
      <CartSummary  compact />
    </div>
  </div>
</template>

<!--<template>-->
<!--  <div class="container mx-auto px-4 py-6">-->
<!--    <BBreadcrumbs :items="[{ label: 'Головна', to: '/' }, { label: 'Кошик' }]" />-->

<!--    <h1 class="mt-4 mb-6 text-2xl font-bold text-gray-900">Кошик</h1>-->

<!--    <div v-if="cartStore.isEmpty" class="flex flex-col items-center justify-center gap-4 py-16">-->
<!--      <Icon name="mdi:cart-outline" class="h-20 w-20 text-gray-300" />-->
<!--      <p class="text-base text-gray-500">Кошик порожній</p>-->
<!--      <BBtn variant="primary" size="md" to="/catalog">-->
<!--        Перейти до каталогу-->
<!--      </BBtn>-->
<!--    </div>-->

<!--    <div v-else class="flex gap-6">-->
<!--      <div class="flex-1 min-w-0">-->
<!--        <div class="flex flex-col gap-4">-->
<!--          <div-->
<!--              v-for="item in cartStore.cart?.items"-->
<!--              :key="item.id"-->
<!--              class="rounded-xl border border-gray-200 bg-white p-4"-->
<!--          >-->
<!--            <CartItem :item="item" />-->
<!--          </div>-->
<!--        </div>-->
<!--      </div>-->

<!--      <aside class="hidden lg:block w-80 shrink-0">-->
<!--        <div class="sticky top-6">-->
<!--          <CartSummary />-->
<!--        </div>-->
<!--      </aside>-->
<!--    </div>-->

<!--    <div v-if="!cartStore.isEmpty" class="mt-6 lg:hidden">-->
<!--      <CartSummary />-->
<!--    </div>-->
<!--  </div>-->
<!--</template>-->