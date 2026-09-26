<script setup lang="ts">
interface Props {
  src?: string | null
  alt?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  fallback?: string
}

const props = withDefaults(defineProps<Props>(), {
  src: null,
  alt: '',
  size: 'md',
  fallback: '',
})

const hasError = ref(false)
const showImage = computed(() => props.src && !hasError.value)

const initials = computed(() => {
  if (props.fallback) return props.fallback.slice(0, 2).toUpperCase()
  if (!props.alt) return '?'
  return props.alt.split(' ').filter(Boolean).slice(0, 2).map(word => word[0]).join('').toUpperCase()
})

const sizeClasses = {
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-14 text-base',
  xl: 'size-20 text-lg',
} as const

watch(() => props.src, () => {
  hasError.value = false
})
</script>

<template>
  <span
    class="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary-100 font-medium text-secondary-700"
    :class="sizeClasses[size]"
  >
    <img
      v-if="showImage"
      :src="src!"
      :alt="alt"
      class="size-full object-cover"
      @error="hasError = true"
    >
    <template v-else>{{ initials }}</template>
  </span>
</template>
