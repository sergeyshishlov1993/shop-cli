<script setup lang="ts">
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface Props {
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit'
  block?: boolean
  to?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  type: 'button',
  block: false,
  to: undefined
})

const isDisabled = computed(() => props.disabled || props.loading)

const baseClass =
  'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 disabled:pointer-events-none disabled:opacity-60'

const variantClass = computed(() => {
  if (props.variant === 'secondary') {
    return 'bg-secondary-200 text-secondary-900 hover:bg-secondary-300'
  }

  if (props.variant === 'outline') {
    return 'border border-secondary-300 text-secondary-900 hover:bg-secondary-100'
  }

  if (props.variant === 'ghost') {
    return 'text-secondary-900 hover:bg-secondary-100'
  }

  if (props.variant === 'danger') {
    return 'bg-danger text-white hover:opacity-90'
  }

  return 'bg-primary-500 text-white hover:bg-primary-600'
})

const sizeClass = computed(() => {
  if (props.size === 'sm') {
    return 'min-h-9 px-3 text-sm'
  }

  if (props.size === 'lg') {
    return 'min-h-12 px-6 text-base'
  }

  return 'min-h-10 px-4 text-sm'
})

const blockClass = computed(() => (props.block ? 'w-full' : ''))
const disabledClass = computed(() =>
  isDisabled.value ? 'pointer-events-none opacity-60' : ''
)
const componentTag = computed(() => (props.to ? resolveComponent('NuxtLink') : 'button'))

const spinnerSize = computed(() => {
  if (props.size === 'sm') {
    return 'sm'
  }

  if (props.size === 'lg') {
    return 'lg'
  }

  return 'md'
})

const buttonClass = computed(() => [
  baseClass,
  variantClass.value,
  sizeClass.value,
  blockClass.value,
  disabledClass.value
])
</script>

<template>
  <component
    :is="componentTag"
    :to="isDisabled || !props.to ? undefined : props.to"
    :type="props.to ? undefined : props.type"
    :disabled="props.to ? undefined : isDisabled"
    :aria-disabled="props.to && isDisabled ? 'true' : undefined"
    :class="buttonClass"
  >
    <BSpinner
      v-if="props.loading"
      :size="spinnerSize"
    />
    <slot v-else />
  </component>
</template>
