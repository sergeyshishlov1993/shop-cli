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

interface Emits {
  (event: 'update:modelValue', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '',
  label: '',
  error: '',
  disabled: false,
  required: false,
  rows: 4,
  id: undefined
})

const emit = defineEmits<Emits>()
const generatedId = useId()

const textareaId = computed(() => props.id || generatedId)

const textareaClass = computed(() => {
  const baseClass =
    'min-h-28 w-full rounded-xl border bg-white px-4 py-3 text-secondary-900 transition-colors duration-200 placeholder:text-secondary-400 focus:border-primary-400 disabled:cursor-not-allowed disabled:bg-secondary-100 resize-none'
  const stateClass = props.error ? 'border-danger' : 'border-secondary-200'

  return [baseClass, stateClass]
})

const onInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label
      v-if="props.label"
      :for="textareaId"
      class="text-sm font-medium text-secondary-800"
    >
      {{ props.label }}
      <span
        v-if="props.required"
        class="text-danger"
      >
        *
      </span>
    </label>

    <textarea
      :id="textareaId"
      :value="props.modelValue"
      :placeholder="props.placeholder"
      :disabled="props.disabled"
      :required="props.required"
      :rows="props.rows"
      :class="textareaClass"
      @input="onInput"
    />

    <p
      v-if="props.error"
      class="text-sm text-danger"
    >
      {{ props.error }}
    </p>
  </div>
</template>
