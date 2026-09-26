<script setup lang="ts">
import AccountNav from '~/modules/account/components/AccountNav.vue'
</script>

<template>
  <div class="storefront-shell flex min-h-screen flex-col text-[var(--store-text,#3a3230)]">
    <AppHeader />
    <main class="flex-1">
      <div class="store-container pt-6 lg:pt-10">
        <AccountNav />
      </div>
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
