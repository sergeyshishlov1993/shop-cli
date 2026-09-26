<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary'
  type?: 'filled' | 'text'
  size?: 'sm' | 'md'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  type: 'filled',
  size: 'md',
})

const classes = computed(() => [
  'b-badge',
  `b-badge--${props.variant}`,
  props.type === 'text' ? 'b-badge--text' : '',
  props.size === 'sm' ? 'text-[0.625rem] px-2 py-0.5' : 'text-[0.6875rem] px-2.5 py-1',
])
</script>

<template>
  <span :class="classes">
    <slot />
  </span>
</template>
