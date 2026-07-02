<script setup lang="ts">
type SpinnerSize = 'sm' | 'md' | 'lg'

interface Props {
  size?: SpinnerSize
  color?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  color: 'currentColor'
})

const spinnerSizeClass = computed(() => {
  if (props.size === 'sm') {
    return 'h-4 w-4'
  }

  if (props.size === 'lg') {
    return 'h-6 w-6'
  }

  return 'h-5 w-5'
})
</script>

<template>
  <svg
    :style="{ color: props.color }"
    class="animate-spin"
    :class="spinnerSizeClass"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      stroke-width="4"
      class="opacity-25"
    />
    <path
      d="M22 12a10 10 0 0 0-10-10"
      stroke="currentColor"
      stroke-width="4"
      stroke-linecap="round"
      class="opacity-90"
    />
  </svg>
</template>
