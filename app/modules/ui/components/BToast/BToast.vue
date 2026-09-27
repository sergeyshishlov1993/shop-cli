<script setup lang="ts">
import { useToast } from '~/modules/ui/composables/useToast'
import { useCartStore } from '~/modules/cart/cartStore'

const { toasts, remove } = useToast()
const cartStore = useCartStore()

function openCart(id: number) {
  remove(id)
  cartStore.isDrawerOpen = true
}

const timers = new Map<number, ReturnType<typeof setTimeout>>()

const iconMap = {
  success: 'lucide:smile',
  error: 'lucide:frown',
  warning: 'lucide:alert-triangle',
  info: 'lucide:info',
} as const

// Заливка на весь тост — зелений / жовтий / червоний, щоб було помітно
const colorMap = {
  success: 'bg-emerald-600 text-white',
  error: 'bg-red-600 text-white',
  warning: 'bg-amber-400 text-secondary-900',
  info: 'bg-sky-600 text-white',
} as const

watch(
  toasts,
  (items) => {
    if (!import.meta.client) return

    for (const toast of items) {
      if (timers.has(toast.id)) continue

      timers.set(toast.id, setTimeout(() => {
        timers.delete(toast.id)
        remove(toast.id)
      }, toast.duration))
    }
  },
  { deep: true, immediate: true },
)

onBeforeUnmount(() => {
  for (const timer of timers.values()) clearTimeout(timer)
  timers.clear()
})
</script>

<template>
  <Teleport to="body">
    <div class="pointer-events-none fixed right-4 top-4 z-[200] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2">
      <TransitionGroup name="b-toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="toast.product ? 'pointer-events-auto' : ''"
        >
        <div
          v-if="toast.product"
          class="flex gap-3 rounded-2xl border border-secondary-100 bg-white/95 p-3 text-secondary-900 shadow-2xl backdrop-blur"
          role="status"
          data-testid="product-toast"
        >
          <img v-if="toast.product.image" :src="toast.product.image" :alt="toast.product.name" class="h-16 w-12 shrink-0 rounded-lg bg-secondary-100 object-cover">
          <div class="flex min-w-0 flex-1 flex-col gap-0.5">
            <p class="flex items-center gap-1.5 text-sm font-semibold">
              <Icon name="lucide:circle-check" class="size-4 shrink-0 text-emerald-600" />
              {{ toast.product.title }}
            </p>
            <p class="truncate text-xs text-secondary-700">{{ toast.product.name }}</p>
            <p class="text-xs text-secondary-500">
              <span v-if="toast.product.meta">{{ toast.product.meta }}</span>
              <span v-if="toast.product.meta && toast.product.price != null"> · </span>
              <span v-if="toast.product.price != null" class="font-semibold text-secondary-900">{{ toast.product.price }} ₴</span>
            </p>
            <button type="button" class="mt-1 w-fit text-xs font-medium underline underline-offset-4 hover:text-secondary-600" @click="openCart(toast.id)">
              До кошика
            </button>
          </div>
          <button type="button" class="self-start text-secondary-400 transition-colors hover:text-secondary-900" aria-label="Закрити" @click="remove(toast.id)">
            <Icon name="lucide:x" class="size-4" />
          </button>
        </div>
        <div
          v-else
          class="pointer-events-auto flex items-center gap-3 rounded-xl px-4 py-3.5 shadow-xl"
          :class="colorMap[toast.variant]"
          role="status"
        >
          <Icon :name="iconMap[toast.variant]" class="size-6 shrink-0" />
          <p class="min-w-0 flex-1 text-sm font-medium">{{ toast.message }}</p>
          <button
            type="button"
            class="shrink-0 opacity-70 transition-opacity hover:opacity-100"
            aria-label="Закрити"
            @click="remove(toast.id)"
          >
            <Icon name="lucide:x" class="size-4" />
          </button>
        </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
/* Плавний виїзд праворуч; move — щоб інші тости м'яко зсувались */
.b-toast-enter-active {
  transition: opacity 0.45s cubic-bezier(0.22, 1, 0.36, 1), transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
}
.b-toast-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.b-toast-move {
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}
.b-toast-enter-from {
  opacity: 0;
  transform: translateX(1.5rem) scale(0.96);
}
.b-toast-leave-to {
  opacity: 0;
  transform: translateX(1.5rem);
}
@media (prefers-reduced-motion: reduce) {
  .b-toast-enter-active, .b-toast-leave-active, .b-toast-move { transition: opacity 0.2s ease; }
  .b-toast-enter-from, .b-toast-leave-to { transform: none; }
}
</style>
