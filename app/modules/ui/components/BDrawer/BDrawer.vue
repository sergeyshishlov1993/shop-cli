<script setup lang="ts">
interface Props {
  modelValue: boolean
  title?: string
  position?: 'left' | 'right' | 'top' | 'bottom'
  side?: 'left' | 'right' | 'top' | 'bottom'
  width?: string
  closable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  position: undefined,
  side: undefined,
  width: 'w-[min(24rem,100vw)]',
  closable: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const drawerPosition = computed(() => props.position ?? props.side ?? 'right')

const positionClass = computed(() => {
  if (drawerPosition.value === 'left') return `inset-y-0 left-0 h-dvh ${props.width}`
  if (drawerPosition.value === 'right') return `inset-y-0 right-0 h-dvh ${props.width}`
  if (drawerPosition.value === 'top') return 'inset-x-0 top-0 max-h-[85dvh] w-full'
  return 'inset-x-0 bottom-0 max-h-[85dvh] w-full'
})

const transitionName = computed(() => `b-slide-${drawerPosition.value}`)

function close() {
  emit('update:modelValue', false)
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.modelValue) close()
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
    <div v-if="modelValue" class="fixed inset-0 z-[100]">
      <Transition name="b-fade" appear>
        <div v-if="modelValue" class="b-overlay" @click="close" />
      </Transition>

      <Transition :name="transitionName" appear>
        <aside
          v-if="modelValue"
          class="absolute flex flex-col glass glass--strong"
          :class="positionClass"
          role="dialog"
          aria-modal="true"
        >
          <div
            v-if="title || closable"
            class="flex items-center justify-between gap-4 border-b border-secondary-200 px-5 py-4"
          >
            <h2 class="store-title text-base">{{ title }}</h2>
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

          <div class="flex-1 overflow-y-auto">
            <slot />
          </div>

          <div v-if="$slots.footer" class="border-t border-secondary-200 p-5">
            <slot name="footer" />
          </div>
        </aside>
      </Transition>
    </div>
  </Teleport>
</template>
