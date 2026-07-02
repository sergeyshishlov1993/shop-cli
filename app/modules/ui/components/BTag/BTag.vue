<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary'
  type?: 'filled' | 'text'
  size?: 'sm' | 'md'
  closable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  type: 'filled',
  size: 'md',
  closable: false,
})

const emit = defineEmits<{
  close: []
}>()

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

const closeFilledClasses: Record<NonNullable<Props['variant']>, string> = {
  primary: 'hover:bg-primary-600',
  success: 'hover:bg-emerald-600',
  warning: 'hover:bg-amber-600',
  danger: 'hover:bg-red-500',
  info: 'hover:bg-sky-600',
  secondary: 'hover:bg-secondary-600',
}

const closeTextClasses: Record<NonNullable<Props['variant']>, string> = {
  primary: 'hover:text-primary-700',
  success: 'hover:text-emerald-700',
  warning: 'hover:text-amber-700',
  danger: 'hover:text-red-600',
  info: 'hover:text-sky-700',
  secondary: 'hover:text-secondary-700',
}

const sizeClasses: Record<NonNullable<Props['size']>, string> = {
  sm: 'text-xs gap-1',
  md: 'text-sm gap-1.5',
}

const filledSizeClasses: Record<NonNullable<Props['size']>, string> = {
  sm: 'px-2 py-0.5',
  md: 'px-3 py-1',
}

const closeSizeClasses: Record<NonNullable<Props['size']>, string> = {
  sm: 'size-3.5',
  md: 'size-4',
}

const tagClasses = computed(() => {
  const base = ['inline-flex items-center font-medium whitespace-nowrap', sizeClasses[props.size]]

  if (props.type === 'filled') {
    return [...base, 'rounded-full', filledSizeClasses[props.size], filledClasses[props.variant]]
  }

  return [...base, textClasses[props.variant]]
})

const closeClasses = computed(() => {
  if (props.type === 'filled') {
    return closeFilledClasses[props.variant]
  }
  return closeTextClasses[props.variant]
})
</script>

<template>
  <span :class="tagClasses">
    <slot />

    <button
      v-if="closable"
      type="button"
      :class="[
        'inline-flex items-center justify-center rounded-full transition-colors',
        closeSizeClasses[size],
        closeClasses,
      ]"
      @click.stop="emit('close')"
    >
      <svg
        :class="closeSizeClasses[size]"
        viewBox="0 0 16 16"
        fill="currentColor"
      >
        <path
          d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z"
        />
      </svg>
    </button>
  </span>
</template>
