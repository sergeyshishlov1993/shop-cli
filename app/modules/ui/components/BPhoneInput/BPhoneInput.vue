<script setup lang="ts">
interface Props {
  modelValue?: string | number
  placeholder?: string
  label?: string
  error?: string
  disabled?: boolean
  required?: boolean
  id?: string
}

withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '+380',
  label: '',
  error: '',
  disabled: false,
  required: false,
  id: undefined,
})

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <BInput
    :model-value="modelValue"
    mode="phone"
    :placeholder="placeholder"
    :label="label"
    :error="error"
    :disabled="disabled"
    :required="required"
    :id="id"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>
