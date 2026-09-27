<script setup lang="ts">
import { useCartStore } from '~/modules/cart/cartStore'
import CartDrawer from '~/modules/cart/components/CartDrawer.vue'
// На мобільному оформленні — спрощена шапка самої сторінки (як у Gepur), без меню і футера.
const route = useRoute()
const isCheckout = computed(() => route.path === '/checkout')
const cartStore = useCartStore()
</script>

<template>
  <div class="storefront-shell flex min-h-screen flex-col text-[var(--store-text,#3a3230)]">
    <AppHeader :class="{ 'max-lg:hidden': isCheckout }" />
    <main class="flex-1">
      <slot />
    </main>
    <AppFooter :class="{ 'max-lg:hidden': isCheckout }" />
    <CartDrawer v-model="cartStore.isDrawerOpen" />
  </div>
</template>
