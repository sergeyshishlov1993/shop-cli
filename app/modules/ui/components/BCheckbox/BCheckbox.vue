<script setup lang="ts">
interface Props {
  modelValue?: boolean
  label?: string
  disabled?: boolean
  id?: string
  size?: 'sm' | 'md'
}

interface Emits {
  (event: 'update:modelValue', value: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  label: '',
  disabled: false,
  id: undefined,
  size: 'md',
})

const emit = defineEmits<Emits>()
const generatedId = useId()

const checkboxId = computed(() => props.id || generatedId)

const boxSize = computed(() =>
    props.size === 'sm' ? 'h-4 w-4' : 'h-5 w-5',
)

const iconSize = computed(() =>
    props.size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5',
)

const labelClass = computed(() => {
  const base = 'inline-flex items-center gap-2 text-secondary-900'
  const textSize = props.size === 'sm' ? 'text-xs' : 'text-sm'
  const cursor = props.disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
  return `${base} ${textSize} ${cursor}`
})

const boxClass = computed(() => {
  const base = `flex items-center justify-center rounded-md border transition-colors duration-200 ${boxSize.value}`
  return props.modelValue
      ? `${base} border-primary-500 bg-primary-500`
      : `${base} border-secondary-300 bg-white`
})

const onChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.checked)
}
</script>

<template>
  <label
      :for="checkboxId"
      :class="labelClass"
  >
    <span class="relative flex items-center justify-center" :class="boxSize">
      <input
          :id="checkboxId"
          type="checkbox"
          :checked="props.modelValue"
          :disabled="props.disabled"
          class="sr-only"
          @change="onChange"
      >
      <span :class="boxClass">
        <svg
            viewBox="0 0 20 20"
            class="text-white transition-transform duration-200"
            :class="[iconSize, props.modelValue ? 'scale-100' : 'scale-0']"
            fill="none"
            aria-hidden="true"
        >
          <path
              d="M4.5 10L8.5 14L15.5 6"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
          />
        </svg>
      </span>
    </span>

    <span v-if="props.label">
      {{ props.label }}
    </span>
  </label>
</template>