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

const filledClasses: Record<NonNullable<Props['variant']>, string> = {
  primary: 'bg-primary-500 text-white',
  success: 'bg-emerald-500 text-white',
  warning: 'bg-amber-500 text-white',
  danger: 'bg-red-400 text-white',
  info: 'bg-sky-500 text-white',
  secondary: 'bg-secondary-500 text-white',
}

const textClasses: Record<NonNullable<Props['variant']>, string> = {
  primary: 'text-primary-500',
  success: 'text-emerald-500',
  warning: 'text-amber-500',
  danger: 'text-red-400',
  info: 'text-sky-500',
  secondary: 'text-secondary-500',
}

const sizeClasses: Record<NonNullable<Props['size']>, string> = {
  sm: 'text-xs',
  md: 'text-sm',
}

const filledSizeClasses: Record<NonNullable<Props['size']>, string> = {
  sm: 'px-2 py-0.5',
  md: 'px-3 py-1',
}

const badgeClasses = computed(() => {
  const base = ['inline-flex items-center font-medium whitespace-nowrap', sizeClasses[props.size]]

  if (props.type === 'filled') {
    return [...base, 'rounded-full', filledSizeClasses[props.size], filledClasses[props.variant]]
  }

  return [...base, textClasses[props.variant]]
})
</script>

<template>
  <span :class="badgeClasses">
    <slot />
  </span>
</template>
