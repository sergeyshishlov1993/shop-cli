<script setup lang="ts">
interface Props {
  src: string | null
  alt?: string
  size?: 'sm' | 'md' | 'lg'
  removable?: boolean
  rounded?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  alt: '',
  size: 'md',
  removable: false,
  rounded: false,
})

const emit = defineEmits<{
  remove: []
}>()

const isError = ref(false)
const isPreviewOpen = ref(false)

const sizeClasses = {
  sm: 'size-16',
  md: 'size-24',
  lg: 'size-36',
} as const

const iconSize = computed(() => {
  if (props.size === 'lg') return 'size-8'
  if (props.size === 'md') return 'size-6'
  return 'size-5'
})

watch(() => props.src, () => {
  isError.value = false
})
</script>

<template>
  <div
    class="group relative inline-flex shrink-0 items-center justify-center overflow-hidden border border-secondary-200 bg-secondary-100"
    :class="[sizeClasses[size], rounded ? 'rounded-full' : '']"
  >
    <button
      v-if="src && !isError"
      type="button"
      class="size-full"
      aria-label="Переглянути зображення"
      @click="isPreviewOpen = true"
    >
      <img
        :src="src"
        :alt="alt"
        class="size-full object-cover"
        @error="isError = true"
      >
    </button>

    <Icon
      v-else
      name="lucide:image"
      class="text-secondary-400"
      :class="iconSize"
    />

    <button
      v-if="removable"
      type="button"
      aria-label="Прибрати зображення"
      class="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-secondary-900/70 text-white opacity-0 transition-opacity hover:bg-danger group-hover:opacity-100"
      @click="emit('remove')"
    >
      <Icon name="lucide:trash-2" class="size-3" />
    </button>

    <Teleport to="body">
      <Transition name="b-fade">
        <div
          v-if="isPreviewOpen && src"
          class="fixed inset-0 z-[150] flex items-center justify-center p-6"
          @click="isPreviewOpen = false"
        >
          <div class="b-overlay" />
          <img
            :src="src"
            :alt="alt"
            class="relative max-h-[90dvh] max-w-[90vw] object-contain"
          >
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
