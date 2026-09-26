<script setup lang="ts">
import type { CartItem } from '~/modules/cart/types/cart'
import {useCartStore} from '~/modules/cart/cartStore'
import { useConfirm } from '~/modules/ui/composables/useConfirm'

interface Props {
  item: CartItem
}

const props = defineProps<Props>()

const cartStore = useCartStore()
const { confirm } = useConfirm()

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
  if (!(await confirm({ title: 'Видалити товар з кошика?', message: 'Цю дію не можна скасувати.', variant: 'danger', confirmText: 'Видалити' }))) return
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
      <div class="h-[120px] w-20 overflow-hidden bg-secondary-100 lg:h-[180px] lg:w-[120px]">
        <img
            v-if="imageUrl"
            :src="imageUrl"
            :alt="item.product.name"
            class="h-full w-full object-cover"
            loading="lazy"
        />
      </div>
    </NuxtLink>

    <div class="flex min-w-0 flex-1 flex-col gap-1">
      <div class="flex items-start justify-between gap-2">
        <NuxtLink :to="productLink" class="min-w-0 truncate text-sm text-secondary-800 transition-colors hover:text-primary-700 lg:text-base">
          {{ item.product.name }}
        </NuxtLink>
        <button
            type="button"
            class="flex size-7 shrink-0 items-center justify-center text-secondary-400 transition-colors hover:text-secondary-800"
            aria-label="Видалити з кошика"
            :disabled="isRemoving"
            @click="remove"
        >
          <Icon name="lucide:trash-2" size="18" />
        </button>
      </div>

      <span class="text-sm font-semibold text-secondary-900">{{ formatPrice(item.currentUnitPrice) }}</span>

      <p class="truncate text-xs text-secondary-500">
        {{ [item.variant.color?.name, item.variant.size?.name, item.product.brand].filter(Boolean).join(' • ') }}
      </p>

      <div class="mt-auto flex items-center justify-between pt-1">
        <div class="flex items-center gap-1">
          <button
              type="button"
              class="flex size-8 items-center justify-center text-secondary-800 transition-opacity disabled:opacity-30"
              aria-label="Менше"
              :disabled="!canDecrease || isUpdating"
              @click="decrease"
          >
            <Icon name="lucide:minus" size="16" />
          </button>
          <span class="w-6 text-center text-sm text-secondary-900">{{ item.quantity }}</span>
          <button
              type="button"
              class="flex size-8 items-center justify-center text-secondary-800 transition-opacity disabled:opacity-30"
              aria-label="Більше"
              :disabled="!canIncrease || isUpdating"
              @click="increase"
          >
            <Icon name="lucide:plus" size="16" />
          </button>
        </div>
        <span v-if="item.quantity > 1" class="text-sm font-semibold text-secondary-900">
          {{ formatPrice(item.lineTotal) }}
        </span>
      </div>
    </div>
  </div>
</template>
