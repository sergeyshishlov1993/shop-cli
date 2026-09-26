<script setup lang="ts">
interface Props {
  modelValue: boolean
  label?: string
  disabled?: boolean
  size?: 'sm' | 'md'
}

const props = withDefaults(defineProps<Props>(), {
  label: undefined,
  disabled: false,
  size: 'md',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const toggleId = useId()
</script>

<template>
  <label
    :for="toggleId"
    class="inline-flex items-center gap-2.5"
    :class="disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'"
  >
    <input
      :id="toggleId"
      type="checkbox"
      class="peer sr-only"
      :checked="modelValue"
      :disabled="disabled"
      @change="emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
    >
    <span
      class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors peer-focus-visible:ring-1 peer-focus-visible:ring-primary-400 peer-focus-visible:ring-offset-2"
      :class="modelValue ? 'border-primary-500 bg-primary-500' : 'border-secondary-300 bg-secondary-200'"
    >
      <span
        class="absolute size-4 rounded-full bg-white transition-transform"
        :class="modelValue ? 'translate-x-[1.5rem]' : 'translate-x-[0.25rem]'"
      />
    </span>
    <span
      v-if="label"
      class="select-none text-secondary-800"
      :class="size === 'sm' ? 'text-sm' : 'text-base'"
    >
      {{ label }}
    </span>
  </label>
</template>
