<script setup lang="ts">
interface Props {
  modelValue?: number
  value?: number
  readonly?: boolean
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  value: undefined,
  readonly: false,
  disabled: false,
  size: 'md',
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const currentValue = computed(() => props.modelValue ?? props.value ?? 0)
const isInteractive = computed(() => !props.readonly && !props.disabled)
const hovered = ref(0)

const sizeClass = computed(() => {
  if (props.size === 'sm') return 'size-3.5'
  if (props.size === 'lg') return 'size-6'
  return 'size-4'
})

function isFilled(star: number) {
  return star <= (hovered.value || currentValue.value)
}

function select(star: number) {
  if (!isInteractive.value) return
  emit('update:modelValue', star)
}
</script>

<template>
  <div
    class="inline-flex items-center gap-1"
    :class="disabled ? 'opacity-50' : ''"
    @mouseleave="hovered = 0"
  >
    <component
      :is="isInteractive ? 'button' : 'span'"
      v-for="star in 5"
      :key="star"
      :type="isInteractive ? 'button' : undefined"
      :aria-label="isInteractive ? `Оцінка ${star}` : undefined"
      class="inline-flex"
      :class="isInteractive ? 'cursor-pointer' : ''"
      @click="select(star)"
      @mouseenter="isInteractive && (hovered = star)"
    >
      <Icon
        :name="isFilled(star) ? 'mdi:star' : 'mdi:star-outline'"
        :class="[sizeClass, isFilled(star) ? 'text-secondary-900' : 'text-secondary-300']"
      />
    </component>
  </div>
</template>
