<script setup lang="ts">
interface BToggleProps {
  modelValue: boolean
  label?: string
  disabled?: boolean
  size?: 'sm' | 'md'
}

const props = withDefaults(defineProps<BToggleProps>(), {
  label: undefined,
  disabled: false,
  size: 'md',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const toggleId = useId()

const trackSize = computed(() => {
  return props.size === 'sm' ? 'w-9 h-5' : 'w-11 h-6'
})

const thumbSize = computed(() => {
  return props.size === 'sm' ? 'size-3.5' : 'size-4'
})

const thumbTranslate = computed(() => {
  if (props.modelValue) {
    return props.size === 'sm' ? 'translate-x-4.5' : 'translate-x-5.5'
  }
  return 'translate-x-0.5'
})

function toggle() {
  if (props.disabled) return
  emit('update:modelValue', !props.modelValue)
}
</script>

<template>
  <label
    :for="toggleId"
    class="inline-flex items-center gap-2.5"
    :class="[disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer']"
  >
    <button
      :id="toggleId"
      type="button"
      role="switch"
      :aria-checked="modelValue"
      :disabled="disabled"
      class="relative inline-flex shrink-0 items-center rounded-full transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
      :class="[
        trackSize,
        modelValue ? 'bg-primary-500' : 'bg-secondary-300',
      ]"
      @click="toggle"
    >
      <span
        class="rounded-full bg-white shadow-sm transition-transform duration-200"
        :class="[thumbSize, thumbTranslate]"
      />
    </button>
    <span
      v-if="label"
      class="text-secondary-800 select-none"
      :class="[size === 'sm' ? 'text-sm' : 'text-base']"
    >
      {{ label }}
    </span>
  </label>
</template>
