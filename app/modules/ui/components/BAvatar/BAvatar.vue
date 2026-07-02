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
  if (props.fallback) {
    return props.fallback.slice(0, 2).toUpperCase()
  }

  if (props.alt) {
    return props.alt
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(word => word[0])
      .join('')
      .toUpperCase()
  }

  return '?'
})

const sizeClasses: Record<NonNullable<Props['size']>, string> = {
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-12 text-base',
  xl: 'size-16 text-lg',
}

const bgColors = [
  'bg-primary-200 text-primary-800',
  'bg-sky-200 text-sky-800',
  'bg-amber-200 text-amber-800',
  'bg-green-200 text-green-800',
  'bg-violet-200 text-violet-800',
  'bg-rose-200 text-rose-800',
]

const fallbackColor = computed(() => {
  const source = props.fallback || props.alt || ''
  let hash = 0
  for (let i = 0; i < source.length; i++) {
    hash = source.charCodeAt(i) + ((hash << 5) - hash)
  }
  return bgColors[Math.abs(hash) % bgColors.length]
})

watch(() => props.src, () => {
  hasError.value = false
})
</script>

<template>
  <span
    :class="[
      'inline-flex items-center justify-center rounded-full overflow-hidden shrink-0 font-medium select-none',
      sizeClasses[size],
      !showImage ? fallbackColor : '',
    ]"
  >
    <img
      v-if="showImage"
      :src="src!"
      :alt="alt"
      class="size-full object-cover"
      @error="hasError = true"
    >

    <span v-else>
      {{ initials }}
    </span>
  </span>
</template>
