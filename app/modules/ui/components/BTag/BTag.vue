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

const classes = computed(() => [
  'b-tag',
  `b-tag--${props.variant}`,
  props.type === 'text' ? 'b-tag--text' : '',
  props.size === 'sm' ? 'text-[0.625rem] px-2 py-1' : 'text-[0.6875rem] px-3 py-1.5',
])
</script>

<template>
  <span :class="classes">
    <slot />
    <button
      v-if="closable"
      type="button"
      class="inline-flex size-3.5 items-center justify-center transition-opacity hover:opacity-60"
      aria-label="Прибрати"
      @click.stop="emit('close')"
    >
      <Icon name="lucide:x" class="size-3" />
    </button>
  </span>
</template>
