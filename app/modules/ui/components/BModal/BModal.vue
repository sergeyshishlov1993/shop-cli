<script setup lang="ts">
interface Props {
  modelValue: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  persistent?: boolean
  closable?: boolean
  fullscreen?: boolean
  /** Без шапки: заголовок і × рендерить сам вміст */
  headless?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  size: 'md',
  persistent: false,
  closable: true,
  fullscreen: false,
  headless: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const widthClass = computed(() => {
  if (props.fullscreen) return 'h-dvh w-screen max-w-none'
  if (props.size === 'sm') return 'w-[min(26rem,calc(100vw-2rem))]'
  if (props.size === 'xl') return 'h-[min(52rem,calc(100dvh-2rem))] w-[min(90rem,calc(100vw-2rem))]'
  if (props.size === 'lg') return 'w-[min(54rem,calc(100vw-2rem))]'
  return 'w-[min(36rem,calc(100vw-2rem))]'
})

function close() {
  if (!props.closable) return
  emit('update:modelValue', false)
}

const onMaskClick = () => { if (!props.persistent) close() }

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.modelValue && !props.persistent) close()
}

watch(() => props.modelValue, (isOpen) => {
  if (!import.meta.client) return
  document.body.style.overflow = isOpen ? 'hidden' : ''
})

onMounted(() => document.addEventListener('keydown', onKeydown))

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  if (import.meta.client) document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="b-fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
      >
        <div class="b-overlay" @click="onMaskClick" />

        <Transition name="b-zoom" appear>
          <div
            v-if="modelValue"
            class="relative flex max-h-[calc(100dvh-2rem)] flex-col glass glass--strong rounded-xl overflow-hidden"
            :class="widthClass"
          >
            <div
              v-if="!headless && (title || closable)"
              class="flex items-center justify-between gap-4 border-b border-secondary-200 px-5 py-4 sm:px-6"
            >
              <h2 class="store-title text-base sm:text-lg">{{ title }}</h2>
              <button
                v-if="closable"
                type="button"
                class="flex size-8 shrink-0 items-center justify-center text-secondary-500 transition-colors hover:text-secondary-900"
                aria-label="Закрити"
                @click="close"
              >
                <Icon name="lucide:x" class="size-5" />
              </button>
            </div>

            <div class="flex-1 overflow-y-auto" :class="size === 'xl' ? 'min-h-0' : 'px-5 py-5 sm:px-6'">
              <slot />
            </div>

            <div
              v-if="$slots.footer"
              class="border-t border-secondary-200 px-5 py-4 sm:px-6"
            >
              <slot name="footer" />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
