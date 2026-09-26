<script setup lang="ts">
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'icon'
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
  to: undefined,
})

const isDisabled = computed(() => props.disabled || props.loading)

const classes = computed(() => [
  'b-btn',
  `b-btn--${props.variant}`,
  `b-btn--${props.size}`,
  props.block ? 'b-btn--block' : '',
  isDisabled.value ? 'b-btn--disabled' : '',
])
</script>

<template>
  <NuxtLink
    v-if="to"
    :to="isDisabled ? undefined : to"
    :aria-disabled="isDisabled ? 'true' : undefined"
    :class="classes"
  >
    <BSpinner v-if="loading" size="sm" />
    <slot v-else />
  </NuxtLink>

  <button
    v-else
    :type="type"
    :disabled="isDisabled"
    :class="classes"
  >
    <BSpinner v-if="loading" size="sm" />
    <slot v-else />
  </button>
</template>
