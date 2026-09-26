<script setup lang="ts">
interface SelectOption {
  label: string
  value: string | number
  [key: string]: unknown
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

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '',
  label: '',
  error: '',
  disabled: false,
  required: false,
  id: undefined,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const generatedId = useId()
const selectId = computed(() => props.id || generatedId)
const root = useTemplateRef<HTMLElement>('root')
const isOpen = ref(false)

const selectedOption = computed(() => props.options.find(option => option.value === props.modelValue) ?? null)

function toggle() {
  if (props.disabled) return
  isOpen.value = !isOpen.value
}

function select(option: SelectOption) {
  emit('update:modelValue', option.value)
  isOpen.value = false
}

function onKeydown(event: KeyboardEvent) {
  if (props.disabled) return

  if (event.key === 'Escape') {
    isOpen.value = false
    return
  }

  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    toggle()
    return
  }

  if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return

  event.preventDefault()

  if (!isOpen.value) {
    isOpen.value = true
    return
  }

  const currentIndex = props.options.findIndex(option => option.value === props.modelValue)
  const nextIndex = event.key === 'ArrowDown'
    ? Math.min(currentIndex + 1, props.options.length - 1)
    : Math.max(currentIndex - 1, 0)
  const nextOption = props.options[nextIndex < 0 ? 0 : nextIndex]

  if (nextOption) emit('update:modelValue', nextOption.value)
}

onClickOutside(root, () => {
  isOpen.value = false
})
</script>

<template>
  <div ref="root" class="b-field">
    <label
      v-if="label"
      :for="selectId"
      class="b-field__label"
    >
      {{ label }}
      <span v-if="required" class="b-field__required">*</span>
    </label>

    <div class="relative">
      <button
        :id="selectId"
        type="button"
        role="combobox"
        :aria-expanded="isOpen"
        :aria-invalid="Boolean(error)"
        :disabled="disabled"
        :class="[
          'b-select flex items-center justify-between gap-3 text-left',
          error ? 'b-select--invalid' : '',
          isOpen ? 'border-secondary-900' : '',
        ]"
        style="background-image: none"
        @click="toggle"
        @keydown="onKeydown"
      >
        <span class="min-w-0 flex-1 truncate">
          <slot name="value" :value="selectedOption">
            <span v-if="selectedOption">{{ selectedOption.label }}</span>
            <span v-else class="text-secondary-400">{{ placeholder }}</span>
          </slot>
        </span>

        <slot name="dropdownicon">
          <Icon
            name="lucide:chevron-down"
            class="size-4 shrink-0 text-secondary-500 transition-transform"
            :class="isOpen ? 'rotate-180' : ''"
          />
        </slot>
      </button>

      <Transition name="b-zoom">
        <ul
          v-if="isOpen"
          class="absolute left-0 top-full z-30 mt-1 max-h-64 w-full overflow-y-auto glass glass--strong rounded-xl py-1"
          role="listbox"
        >
          <li
            v-for="option in options"
            :key="option.value"
            role="option"
            :aria-selected="option.value === modelValue"
            class="cursor-pointer px-4 py-2.5 text-sm transition-colors"
            :class="option.value === modelValue
              ? 'bg-secondary-900 text-white'
              : 'text-secondary-800 hover:bg-secondary-100'"
            @click="select(option)"
          >
            <slot name="option" :option="option">
              {{ option.label }}
            </slot>
          </li>

          <li v-if="!options.length" class="px-4 py-2.5 text-sm text-secondary-400">
            Немає варіантів
          </li>
        </ul>
      </Transition>
    </div>

    <p v-if="error" class="b-field__error">
      {{ error }}
    </p>
  </div>
</template>
