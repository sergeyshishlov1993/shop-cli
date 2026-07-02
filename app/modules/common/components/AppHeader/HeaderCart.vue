
<script setup lang="ts">
import { computed } from 'vue'
import {useCartStore} from "~/modules/cart/cartStore";

const cartStore = useCartStore()

const itemsCount = computed(() => cartStore.itemsCount)
</script>

<template>
  <NuxtLink to="/cart" class="relative transition hover:opacity-70" aria-label="Кошик">
    <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
      <path d="M6 7H18L17 20H7L6 7Z" />
      <path d="M9 7V5.5C9 3.57 10.57 2 12.5 2C14.43 2 16 3.57 16 5.5V7" />
    </svg>
    <span
        class="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#f7d9d3] px-1 text-[10px] leading-none text-black"
    >
      {{ itemsCount }}
    </span>
  </NuxtLink>
</template>