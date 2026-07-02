<script setup lang="ts">
interface SelectOption {
  label: string
  value: string | number
}

interface Props {
  modelValue?: string | number
  options: SelectOption[]
  placeholder?: string
  label?: string
  error?: string
  disabled?: boolean
  required?: boolean
  id?: string
}

interface Emits {
  (event: 'update:modelValue', value: string | number): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '',
  label: '',
  error: '',
  disabled: false,
  required: false,
  id: undefined
})

const emit = defineEmits<Emits>()
const generatedId = useId()

const selectId = computed(() => props.id || generatedId)
const isOpen = ref(false)
const containerRef = ref<HTMLElement | null>(null)
const optionsRef = ref<HTMLElement | null>(null)
const focusedIndex = ref(-1)

const selectedLabel = computed(() => {
  const found = props.options.find((option) => option.value === props.modelValue)
  return found?.label ?? ''
})

const hasValue = computed(() => `${props.modelValue}` !== '')

const triggerClass = computed(() => {
  const base =
      'flex h-11 w-full items-center rounded-xl border bg-white px-4 pr-10 text-left transition-colors duration-200'
  const state = props.error ? 'border-red-500' : isOpen.value ? 'border-gray-400' : 'border-gray-300'
  const text = hasValue.value ? 'text-gray-900' : 'text-gray-400'
  const disabled = props.disabled ? 'cursor-not-allowed bg-gray-100' : 'cursor-pointer'

  return [base, state, text, disabled]
})

const toggle = () => {
  if (props.disabled) return
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    focusedIndex.value = props.options.findIndex((option) => option.value === props.modelValue)
  }
}

const close = () => {
  isOpen.value = false
  focusedIndex.value = -1
}

const selectOption = (option: SelectOption) => {
  emit('update:modelValue', option.value)
  close()
}

const onKeydown = (event: KeyboardEvent) => {
  if (!isOpen.value) {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
      event.preventDefault()
      isOpen.value = true
      focusedIndex.value = Math.max(0, props.options.findIndex((o) => o.value === props.modelValue))
      return
    }
    return
  }

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      focusedIndex.value = Math.min(focusedIndex.value + 1, props.options.length - 1)
      break
    case 'ArrowUp':
      event.preventDefault()
      focusedIndex.value = Math.max(focusedIndex.value - 1, 0)
      break
    case 'Enter':
    case ' ':
      event.preventDefault()
      if (focusedIndex.value >= 0) {
        selectOption(props.options[focusedIndex.value])
      }
      break
    case 'Escape':
      event.preventDefault()
      close()
      break
  }
}

onClickOutside(containerRef, close)

watch(isOpen, (opened) => {
  if (opened) {
    nextTick(() => {
      const activeElement = optionsRef.value?.querySelector('[data-focused="true"]') as HTMLElement
      activeElement?.scrollIntoView({ block: 'nearest' })
    })
  }
})

watch(focusedIndex, () => {
  nextTick(() => {
    const activeElement = optionsRef.value?.querySelector('[data-focused="true"]') as HTMLElement
    activeElement?.scrollIntoView({ block: 'nearest' })
  })
})
</script>

<template>
  <div
      ref="containerRef"
      class="relative flex flex-col gap-1.5"
  >
    <label
        v-if="props.label"
        :id="`${selectId}-label`"
        class="text-sm font-medium text-gray-900"
    >
      {{ props.label }}
      <span
          v-if="props.required"
          class="text-red-500"
      >
        *
      </span>
    </label>

    <div class="relative">
      <button
          :id="selectId"
          type="button"
          role="combobox"
          :aria-expanded="isOpen"
          :aria-labelledby="props.label ? `${selectId}-label` : undefined"
          :aria-haspopup="true"
          :disabled="props.disabled"
          :class="triggerClass"
          @click="toggle"
          @keydown="onKeydown"
      >
        <span class="truncate">
          {{ hasValue ? selectedLabel : props.placeholder }}
        </span>
      </button>

      <span class="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-500">
        <svg
            viewBox="0 0 20 20"
            class="h-4 w-4 transition-transform duration-200"
            :class="{ 'rotate-180': isOpen }"
            fill="none"
            aria-hidden="true"
        >
          <path
              d="M5 7.5L10 12.5L15 7.5"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
          />
        </svg>
      </span>

      <Transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="scale-95 opacity-0"
          enter-to-class="scale-100 opacity-100"
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="scale-100 opacity-100"
          leave-to-class="scale-95 opacity-0"
      >
        <div
            v-if="isOpen"
            ref="optionsRef"
            role="listbox"
            class="absolute left-0 top-full z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg"
        >
          <div
              v-for="(option, index) in props.options"
              :key="option.value"
              role="option"
              :aria-selected="option.value === props.modelValue"
              :data-focused="index === focusedIndex"
              class="flex cursor-pointer items-center px-4 py-2.5 text-sm text-gray-900 transition-colors"
              :class="{
              'bg-gray-100': index === focusedIndex,
              'font-medium text-gray-900': option.value === props.modelValue,
            }"
              @click="selectOption(option)"
              @mouseenter="focusedIndex = index"
          >
            {{ option.label }}
          </div>
        </div>
      </Transition>
    </div>

    <p
        v-if="props.error"
        class="text-sm text-red-500"
    >
      {{ props.error }}
    </p>
  </div>
</template>