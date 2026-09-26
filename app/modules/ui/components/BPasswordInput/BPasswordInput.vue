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
  placeholder: '',
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
    mode="password"
    :placeholder="placeholder"
    :label="label"
    :error="error"
    :disabled="disabled"
    :required="required"
    :id="id"
    @update:modelValue="$emit('update:modelValue', $event)"
  />
</template>
