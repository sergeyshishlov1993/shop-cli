
<script setup lang="ts">
import { computed } from 'vue'
import {useCartStore} from "~/modules/cart/cartStore";

const cartStore = useCartStore()

const itemsCount = computed(() => cartStore.itemsCount)
</script>

<template>
  <NuxtLink to="/cart" class="store-header__icon store-header__cart relative" aria-label="Кошик">
    <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
      <path d="M6 7H18L17 20H7L6 7Z" />
      <path d="M9 7V5.5C9 3.57 10.57 2 12.5 2C14.43 2 16 3.57 16 5.5V7" />
    </svg>
    <span
        class="store-header__cart-count absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] leading-none"
    >
      {{ itemsCount }}
    </span>
  </NuxtLink>
</template>
