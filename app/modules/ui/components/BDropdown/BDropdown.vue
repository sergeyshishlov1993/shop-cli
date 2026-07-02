<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'

interface Props {
  align?: 'left' | 'right'
  width?: string
}

withDefaults(defineProps<Props>(), {
  align: 'left',
  width: 'w-48',
})

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

function toggle() {
  isOpen.value = !isOpen.value
}

function close() {
  isOpen.value = false
}

onClickOutside(dropdownRef, close)
</script>

<template>
  <div ref="dropdownRef" class="relative inline-block">
    <div @click="toggle">
      <slot name="trigger" />
    </div>

    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="scale-95 opacity-0"
      enter-to-class="scale-100 opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="scale-100 opacity-100"
      leave-to-class="scale-95 opacity-0"
    >
      <div
        v-if="isOpen"
        class="absolute z-50 mt-2 rounded-xl border border-secondary-200 bg-white py-1 shadow-lg"
        :class="[
          width,
          align === 'right' ? 'right-0' : 'left-0',
        ]"
        @click="close"
      >
        <slot />
      </div>
    </Transition>
  </div>
</template>
