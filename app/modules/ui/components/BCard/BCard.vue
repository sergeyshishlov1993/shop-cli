<script setup lang="ts">
interface Props {
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
  border?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  padding: 'md',
  hover: false,
  border: true,
})

const paddingClasses: Record<NonNullable<Props['padding']>, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-7',
}

const cardClasses = computed(() => [
  'b-card',
  paddingClasses[props.padding],
  props.border ? '' : 'border-transparent shadow-[0_10px_40px_-24px_rgba(16,16,16,0.45)]',
  props.hover ? 'transition-colors hover:border-secondary-400' : '',
])
</script>

<template>
  <div :class="cardClasses">
    <div v-if="$slots.header" class="mb-4">
      <slot name="header" />
    </div>

    <slot />

    <div v-if="$slots.footer" class="mt-4">
      <slot name="footer" />
    </div>
  </div>
</template>
