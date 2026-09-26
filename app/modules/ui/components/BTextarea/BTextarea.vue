<script setup lang="ts">
interface Props {
  modelValue?: string
  placeholder?: string
  label?: string
  error?: string
  disabled?: boolean
  required?: boolean
  rows?: number
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '',
  label: '',
  error: '',
  disabled: false,
  required: false,
  rows: 4,
  id: undefined,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const generatedId = useId()
const textareaId = computed(() => props.id || generatedId)
</script>

<template>
  <div class="b-field">
    <label
      v-if="label"
      :for="textareaId"
      class="b-field__label"
    >
      {{ label }}
      <span v-if="required" class="b-field__required">*</span>
    </label>

    <textarea
      :id="textareaId"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :rows="rows"
      :aria-invalid="Boolean(error)"
      :class="['b-textarea', error ? 'b-textarea--invalid' : '']"
      @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />

    <p v-if="error" class="b-field__error">
      {{ error }}
    </p>
  </div>
</template>
