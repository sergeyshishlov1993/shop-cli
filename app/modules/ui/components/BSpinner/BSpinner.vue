<script setup lang="ts">
type SpinnerSize = 'sm' | 'md' | 'lg'

interface Props {
  size?: SpinnerSize
  color?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  color: 'currentColor',
})

const sizeClass = computed(() => {
  if (props.size === 'sm') return 'size-4'
  if (props.size === 'lg') return 'size-7'
  return 'size-5'
})
</script>

<template>
  <span
    class="b-spinner"
    :class="sizeClass"
    :style="{ color }"
    role="status"
    aria-label="Завантаження"
  />
</template>
