<script setup lang="ts">
import type { CartItem } from '~/modules/cart/types/cart'
import {useCartStore} from '~/modules/cart/cartStore'

interface Props {
  item: CartItem
}

const props = defineProps<Props>()

const cartStore = useCartStore()

const imageUrl = computed(() => getFileUrl(props.item.variant.mainImage, 'thumb'))

const productLink = computed(() => `/product/${props.item.product.slug}`)

const isUpdating = ref(false)
const isRemoving = ref(false)

const canIncrease = computed(() => props.item.quantity < props.item.availableQty)
const canDecrease = computed(() => props.item.quantity > 1)

async function increase() {
  isUpdating.value = true
  try {
    await cartStore.updateQuantity(props.item.id, props.item.quantity + 1)
  } finally {
    isUpdating.value = false
  }
}

async function decrease() {
  isUpdating.value = true
  try {
    await cartStore.updateQuantity(props.item.id, props.item.quantity - 1)
  } finally {
    isUpdating.value = false
  }
}

async function remove() {
  isRemoving.value = true
  try {
    await cartStore.removeFromCart(props.item.id)
  } finally {
    isRemoving.value = false
  }
}
</script>

<template>
  <div class="flex gap-3">
    <NuxtLink :to="productLink" class="shrink-0">
      <div class="h-20 w-16 overflow-hidden rounded-lg bg-gray-100">
        <img
            v-if="imageUrl"
            :src="imageUrl"
            :alt="item.product.name"
            class="h-full w-full object-cover"
            loading="lazy"
        />
      </div>
    </NuxtLink>

    <div class="flex flex-1 flex-col gap-1.5">
      <div class="flex items-start justify-between gap-2">
        <NuxtLink :to="productLink" class="text-sm font-medium text-gray-900 line-clamp-2 hover:text-primary-600 transition-colors">
          {{ item.product.name }}
        </NuxtLink>

        <button
            class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            :disabled="isRemoving"
            @click="remove"
        >
          <Icon name="mdi:close" class="h-4 w-4" />
        </button>
      </div>

      <div class="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500">
        <span v-if="item.variant.color">{{ item.variant.color.name }}</span>
        <span v-if="item.variant.size">{{ item.variant.size.name }}</span>
        <span v-if="item.product.brand">{{ item.product.brand }}</span>
      </div>

      <div class="mt-auto flex items-center justify-between">
        <div class="flex items-center gap-1.5">
          <button
              class="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-40"
              :disabled="!canDecrease || isUpdating"
              @click="decrease"
          >
            <Icon name="mdi:minus" class="h-3.5 w-3.5" />
          </button>

          <span class="w-6 text-center text-sm font-medium text-gray-900">
            {{ item.quantity }}
          </span>

          <button
              class="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-40"
              :disabled="!canIncrease || isUpdating"
              @click="increase"
          >
            <Icon name="mdi:plus" class="h-3.5 w-3.5" />
          </button>
        </div>

        <span class="text-sm font-semibold text-gray-900">
          {{ formatPrice(item.lineTotal) }}
        </span>
      </div>
    </div>
  </div>
</template>