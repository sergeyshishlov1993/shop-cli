<script setup lang="ts">
import { watch, onUnmounted } from 'vue'

interface Props {
  modelValue: boolean
  side?: 'left' | 'right'
  title?: string
  width?: string
}

const props = withDefaults(defineProps<Props>(), {
  side: 'right',
  title: '',
  width: 'w-80',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

function close() {
  emit('update:modelValue', false)
}

function onOverlayClick() {
  close()
}

function onEscape(event: KeyboardEvent) {
  if (event.key === 'Escape') close()
}

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onEscape)
  } else {
    document.body.style.overflow = ''
    document.removeEventListener('keydown', onEscape)
  }
})

onUnmounted(() => {
  document.body.style.overflow = ''
  document.removeEventListener('keydown', onEscape)
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[60] bg-black/40"
        @click.self="onOverlayClick"
      >
        <Transition
          :enter-active-class="'transition duration-300 ease-out'"
          :enter-from-class="side === 'right' ? 'translate-x-full' : '-translate-x-full'"
          enter-to-class="translate-x-0"
          :leave-active-class="'transition duration-200 ease-in'"
          leave-from-class="translate-x-0"
          :leave-to-class="side === 'right' ? 'translate-x-full' : '-translate-x-full'"
        >
          <div
            v-if="modelValue"
            class="fixed inset-y-0 z-[60] flex h-full flex-col bg-white shadow-xl"
            :class="[
              width,
              side === 'right' ? 'right-0' : 'left-0',
            ]"
          >
            <div class="flex items-center justify-between border-b border-secondary-200 px-4 py-3">
              <h2 class="text-base font-semibold text-secondary-800">
                {{ title }}
              </h2>

              <button
                class="flex h-8 w-8 items-center justify-center rounded-lg text-secondary-400 transition-colors hover:bg-secondary-100 hover:text-secondary-600"
                @click="close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  class="h-5 w-5"
                >
                  <path
                    d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"
                  />
                </svg>
              </button>
            </div>

            <div class="flex-1 overflow-y-auto px-4 py-4">
              <slot />
            </div>

            <div
              v-if="$slots.footer"
              class="border-t border-secondary-200 px-4 py-3"
            >
              <slot name="footer" />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
