<script setup lang="ts">
interface Props {
  modelValue?: string | number
  value: string | number
  name: string
  label?: string
  disabled?: boolean
  id?: string
}

interface Emits {
  (event: 'update:modelValue', value: string | number): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  label: '',
  disabled: false,
  id: undefined
})

const emit = defineEmits<Emits>()
const generatedId = useId()

const radioId = computed(() => props.id || generatedId)
const isChecked = computed(() => props.modelValue === props.value)

const dotClass = computed(() =>
  isChecked.value ? 'scale-100' : 'scale-0'
)

const onChange = () => {
  emit('update:modelValue', props.value)
}
</script>

<template>
  <label
    :for="radioId"
    class="inline-flex items-center gap-3 text-sm text-secondary-900"
    :class="props.disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'"
  >
    <span class="relative flex h-5 w-5 items-center justify-center">
      <input
        :id="radioId"
        :name="props.name"
        type="radio"
        :checked="isChecked"
        :disabled="props.disabled"
        class="sr-only"
        @change="onChange"
      >
      <span
        class="flex h-5 w-5 items-center justify-center rounded-full border border-secondary-300 bg-white transition-colors duration-200"
        :class="isChecked ? 'border-primary-500' : ''"
      >
        <span
          class="h-2.5 w-2.5 rounded-full bg-primary-500 transition-transform duration-200"
          :class="dotClass"
        />
      </span>
    </span>

    <span v-if="props.label">
      {{ props.label }}
    </span>
  </label>
</template>
