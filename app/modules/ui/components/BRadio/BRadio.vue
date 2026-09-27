<script setup lang="ts">
interface Props {
  modelValue?: string | number
  value: string | number
  name: string
  label?: string
  disabled?: boolean
  id?: string
  /** card — плитка з рамкою, підказкою та іконкою праворуч */
  variant?: 'default' | 'card'
  hint?: string
  icon?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  label: '',
  disabled: false,
  id: undefined,
  variant: 'default',
  hint: '',
  icon: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const generatedId = useId()
const radioId = computed(() => props.id || generatedId)
const isChecked = computed(() => props.modelValue === props.value)
</script>

<template>
  <label
    :for="radioId"
    class="items-center gap-2.5 text-sm text-secondary-900"
    :class="[
      disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
      variant === 'card'
        ? ['flex gap-3 rounded-xl border p-4 transition-colors', isChecked ? 'border-secondary-900' : 'border-secondary-200 hover:border-secondary-300']
        : 'inline-flex',
    ]"
  >
    <input
      :id="radioId"
      type="radio"
      class="peer sr-only"
      :name="name"
      :checked="isChecked"
      :disabled="disabled"
      @change="emit('update:modelValue', value)"
    >
    <span
      class="flex size-[1.125rem] shrink-0 items-center justify-center rounded-full border border-secondary-300 bg-white transition-colors peer-focus-visible:ring-1 peer-focus-visible:ring-secondary-900 peer-focus-visible:ring-offset-2"
      :class="isChecked ? 'border-secondary-900' : ''"
    >
      <span v-if="isChecked" class="size-2.5 rounded-full bg-secondary-900" />
    </span>
    <span v-if="variant === 'card'" class="min-w-0">
      <span class="block font-medium">{{ label }}</span>
      <span v-if="hint" class="block text-xs text-secondary-500">{{ hint }}</span>
    </span>
    <span v-else-if="label">{{ label }}</span>
    <Icon v-if="icon" :name="icon" size="20" class="ml-auto shrink-0 text-secondary-400" />
  </label>
</template>
