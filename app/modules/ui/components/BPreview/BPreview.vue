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

const sizeClasses: Record<string, string> = {
  sm: 'h-16 w-16',
  md: 'h-24 w-24',
  lg: 'h-36 w-36',
}

const removeBtnClasses: Record<string, string> = {
  sm: 'h-5 w-5',
  md: 'h-6 w-6',
  lg: 'h-7 w-7',
}

const removeIconSize: Record<string, string> = {
  sm: '12',
  md: '14',
  lg: '16',
}

const fallbackIconSize: Record<string, string> = {
  sm: '20',
  md: '28',
  lg: '36',
}

watch(() => props.src, () => {
  isError.value = false
})
</script>

<template>
  <div
      class="group relative inline-flex shrink-0 items-center justify-center overflow-hidden border border-gray-200 bg-gray-100"
      :class="[sizeClasses[size], rounded ? 'rounded-full' : 'rounded-lg']"
  >
    <img
        v-if="src && !isError"
        :src="src"
        :alt="alt"
        class="h-full w-full object-cover"
        @error="isError = true"
    >

    <Icon
        v-else
        name="heroicons:photo"
        :size="fallbackIconSize[size]"
        class="text-gray-400"
    />

    <button
        v-if="removable"
        type="button"
        class="absolute right-1 top-1 flex items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity hover:bg-danger group-hover:opacity-100"
        :class="removeBtnClasses[size]"
        @click="emit('remove')"
    >
      <Icon name="heroicons:trash" :size="removeIconSize[size]" />
    </button>
  </div>
</template>