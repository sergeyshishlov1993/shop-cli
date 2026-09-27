<script setup lang="ts">
interface Props {
  modelValue?: boolean
  label?: string
  disabled?: boolean
  id?: string
  size?: 'sm' | 'md'
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  label: '',
  disabled: false,
  id: undefined,
  size: 'md',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const generatedId = useId()
const checkboxId = computed(() => props.id || generatedId)
const boxSize = computed(() => props.size === 'sm' ? 'size-4' : 'size-[1.125rem]')
</script>

<template>
  <label
    :for="checkboxId"
    class="inline-flex items-center gap-2.5 text-secondary-900"
    :class="[disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer', size === 'sm' ? 'text-xs' : 'text-sm']"
  >
    <input
      :id="checkboxId"
      type="checkbox"
      class="peer sr-only"
      :checked="modelValue"
      :disabled="disabled"
      @change="emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
    >
    <span
      class="flex shrink-0 items-center justify-center rounded-[4px] border border-secondary-300 bg-white text-white transition-colors peer-focus-visible:ring-1 peer-focus-visible:ring-primary-400 peer-focus-visible:ring-offset-2"
      :class="[boxSize, modelValue ? '!border-secondary-900 !bg-secondary-900' : '']"
    >
      <Icon v-if="modelValue" name="lucide:check" class="size-3" />
    </span>
    <span v-if="label">{{ label }}</span>
  </label>
</template>
