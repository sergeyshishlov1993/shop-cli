<script setup lang="ts">
// На мобільному оформленні — спрощена шапка самої сторінки (як у Gepur), без меню і футера.
const route = useRoute()
const isCheckout = computed(() => route.path === '/checkout')
</script>

<template>
  <div class="storefront-shell flex min-h-screen flex-col text-[var(--store-text,#3a3230)]">
    <AppHeader :class="{ 'max-lg:hidden': isCheckout }" />
    <main class="flex-1">
      <slot />
    </main>
    <AppFooter :class="{ 'max-lg:hidden': isCheckout }" />
  </div>
</template>
