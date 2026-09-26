<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'

interface Props {
  modelValue?: string | number
  type?: string
  mode?: 'text' | 'password' | 'phone' | 'search'
  placeholder?: string
  label?: string
  error?: string
  disabled?: boolean
  required?: boolean
  id?: string
  debounce?: number
  clearable?: boolean
  autocomplete?: string
}

interface Emits {
  (event: 'update:modelValue', value: string): void
  (event: 'search', value: string): void
  (event: 'enter', value: string): void
  (event: 'focus', payload: FocusEvent): void
  (event: 'blur', payload: FocusEvent): void
  (event: 'clear'): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  type: 'text',
  mode: 'text',
  placeholder: '',
  label: '',
  error: '',
  disabled: false,
  required: false,
  id: undefined,
  debounce: 0,
  clearable: true,
  autocomplete: undefined,
})

const emit = defineEmits<Emits>()

const generatedId = useId()
const inputId = computed(() => props.id || generatedId)
const phoneMask = usePhoneMask()
const isPasswordVisible = ref(false)

const stringValue = computed(() => String(props.modelValue ?? ''))
const hasValue = computed(() => stringValue.value.length > 0)

const inputType = computed(() => {
  if (props.mode === 'password') return isPasswordVisible.value ? 'text' : 'password'
  if (props.mode === 'phone') return 'tel'
  if (props.mode === 'search') return 'search'
  return props.type
})

const inputPlaceholder = computed(() => {
  if (props.mode === 'phone' && !props.placeholder) return '+380'
  return props.placeholder
})

const showClear = computed(() => props.clearable && props.mode === 'search' && hasValue.value && !props.disabled)

const paddingClass = computed(() => {
  if (props.mode === 'search') return showClear.value ? 'pl-11 pr-11' : 'pl-11 pr-4'
  if (props.mode === 'password') return 'pr-11'
  return ''
})

const debouncedSearch = useDebounceFn((value: string) => emit('search', value), props.debounce)

function onInput(value: string | undefined) {
  const nextValue = props.mode === 'phone' ? phoneMask.format(value ?? '') : value ?? ''
  emit('update:modelValue', nextValue)

  if (props.mode !== 'search') return
  if (props.debounce > 0) debouncedSearch(nextValue)
  else emit('search', nextValue)
}

const onNativeInput = (event: Event) => onInput((event.target as HTMLInputElement).value)

function clear() {
  emit('update:modelValue', '')
  emit('clear')
  if (props.mode === 'search') emit('search', '')
}

function onKeydown(event: KeyboardEvent) {
  if (props.mode === 'phone') phoneMask.onKeydown(event)
  if (event.key === 'Enter') emit('enter', stringValue.value)
}
</script>

<template>
  <div class="b-field">
    <label
      v-if="label"
      :for="inputId"
      class="b-field__label"
    >
      {{ label }}
      <span v-if="required" class="b-field__required">*</span>
    </label>

    <div class="relative flex w-full items-center">
      <span
        v-if="mode === 'search'"
        class="pointer-events-none absolute left-4 flex items-center text-secondary-400"
      >
        <Icon name="lucide:search" class="size-4" />
      </span>

      <input
        :id="inputId"
        :value="stringValue"
        :type="inputType"
        :placeholder="inputPlaceholder"
        :disabled="disabled"
        :required="required"
        :aria-invalid="Boolean(error)"
        :inputmode="mode === 'phone' ? 'numeric' : undefined"
        :autocomplete="autocomplete ?? (mode === 'phone' ? 'tel' : mode === 'password' ? 'current-password' : undefined)"
        :maxlength="mode === 'phone' ? 17 : undefined"
        :class="['b-input', paddingClass, error ? 'b-input--invalid' : '', mode === 'search' ? 'b-input--search' : '']"
        @input="onNativeInput"
        @keydown="onKeydown"
        @focus="emit('focus', $event)"
        @blur="emit('blur', $event)"
      >

      <button
        v-if="mode === 'password'"
        type="button"
        class="absolute right-3 flex items-center text-secondary-400 transition-colors hover:text-secondary-900"
        :aria-label="isPasswordVisible ? 'Приховати пароль' : 'Показати пароль'"
        @click="isPasswordVisible = !isPasswordVisible"
      >
        <Icon :name="isPasswordVisible ? 'lucide:eye-off' : 'lucide:eye'" class="size-4" />
      </button>

      <button
        v-else-if="showClear"
        type="button"
        class="absolute right-3 flex items-center text-secondary-400 transition-colors hover:text-secondary-900"
        aria-label="Очистити"
        @click="clear"
      >
        <Icon name="lucide:x" class="size-4" />
      </button>
    </div>

    <p v-if="error" class="b-field__error">
      {{ error }}
    </p>
  </div>
</template>
