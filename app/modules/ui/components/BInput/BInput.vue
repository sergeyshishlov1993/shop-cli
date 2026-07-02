<script setup lang="ts">
import {usePhoneMask} from "~/modules/ui/composables/usePhoneMask";

type InputType = 'text' | 'email' | 'number' | 'tel' | 'password'
type InputMode = 'default' | 'password' | 'phone' | 'search'

interface Props {
  modelValue?: string | number
  type?: InputType
  mode?: InputMode
  placeholder?: string
  label?: string
  error?: string
  disabled?: boolean
  required?: boolean
  id?: string
  debounce?: number
}

interface Emits {
  (event: 'update:modelValue', value: string): void
  (event: 'search', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  type: 'text',
  mode: 'default',
  placeholder: '',
  label: '',
  error: '',
  disabled: false,
  required: false,
  id: undefined,
  debounce: 300,
})

const emit = defineEmits<Emits>()
const slots = useSlots()
const generatedId = useId()

const passwordVisible = ref(false)
const phoneMask = props.mode === 'phone' ? usePhoneMask() : null
let debounceTimer: ReturnType<typeof setTimeout> | null = null

const inputId = computed(() => props.id || generatedId)

const resolvedType = computed(() => {
  if (props.mode === 'password') {
    return passwordVisible.value ? 'text' : 'password'
  }
  if (props.mode === 'phone') return 'tel'
  if (props.mode === 'search') return 'text'
  return props.type
})

const resolvedPlaceholder = computed(() => {
  if (props.placeholder) return props.placeholder
  if (props.mode === 'phone') return '+38 (0__) ___-__-__'
  if (props.mode === 'search') return 'Пошук...'
  return ''
})

const hasPrefix = computed(() => props.mode === 'search' || Boolean(slots.prefix))
const hasSuffix = computed(() => {
  if (props.mode === 'password') return true
  if (props.mode === 'search' && String(props.modelValue).length > 0) return true
  return Boolean(slots.suffix)
})

const inputClass = computed(() => {
  const baseClass =
    'h-11 w-full rounded-xl border bg-white text-secondary-900 transition-colors duration-200 placeholder:text-secondary-400 focus:border-primary-400 disabled:cursor-not-allowed disabled:bg-secondary-100'
  const stateClass = props.error ? 'border-danger' : 'border-secondary-200'
  const paddingLeftClass = hasPrefix.value ? 'pl-11' : 'pl-4'
  const paddingRightClass = hasSuffix.value ? 'pr-11' : 'pr-4'

  return [baseClass, stateClass, paddingLeftClass, paddingRightClass]
})

function onInput(event: Event) {
  if (props.mode === 'phone' && phoneMask) {
    const formatted = phoneMask.onInput(event)
    emit('update:modelValue', formatted)
    return
  }

  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)

  if (props.mode === 'search') {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      emit('search', target.value)
    }, props.debounce)
  }
}

function onKeydown(event: KeyboardEvent) {
  if (props.mode === 'phone' && phoneMask) {
    phoneMask.onKeydown(event)
  }
}

function togglePassword() {
  passwordVisible.value = !passwordVisible.value
}

function clearSearch() {
  emit('update:modelValue', '')
  emit('search', '')
}

onBeforeUnmount(() => {
  if (debounceTimer) clearTimeout(debounceTimer)
})
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label
      v-if="props.label"
      :for="inputId"
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

    <div class="relative">
      <div
        v-if="hasPrefix"
        class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-secondary-500"
      >
        <slot name="prefix">
          <svg
            v-if="mode === 'search'"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            class="size-5"
          >
            <path
              fill-rule="evenodd"
              d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
              clip-rule="evenodd"
            />
          </svg>
        </slot>
      </div>

      <input
        :id="inputId"
        :type="resolvedType"
        :value="props.modelValue"
        :placeholder="resolvedPlaceholder"
        :disabled="props.disabled"
        :required="props.required"
        :class="inputClass"
        @input="onInput"
        @keydown="onKeydown"
      >

      <div
        v-if="hasSuffix"
        class="absolute inset-y-0 right-0 flex items-center pr-4 text-secondary-500"
      >
        <slot name="suffix">
          <button
            v-if="mode === 'password'"
            type="button"
            tabindex="-1"
            class="transition-colors hover:text-secondary-700"
            @click="togglePassword"
          >
            <svg
              v-if="!passwordVisible"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              class="size-5"
            >
              <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
              <path
                fill-rule="evenodd"
                d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
                clip-rule="evenodd"
              />
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              class="size-5"
            >
              <path
                fill-rule="evenodd"
                d="M3.28 2.22a.75.75 0 0 0-1.06 1.06l14.5 14.5a.75.75 0 1 0 1.06-1.06l-1.745-1.745a10.029 10.029 0 0 0 3.3-4.38 1.651 1.651 0 0 0 0-1.185A10.004 10.004 0 0 0 9.999 3a9.956 9.956 0 0 0-4.744 1.194L3.28 2.22ZM7.752 6.69l1.092 1.092a2.5 2.5 0 0 1 3.374 3.373l1.092 1.092a4 4 0 0 0-5.558-5.558Z"
                clip-rule="evenodd"
              />
              <path d="M10.748 13.93l2.523 2.523A9.987 9.987 0 0 1 10 17a10.004 10.004 0 0 1-9.336-6.41 1.651 1.651 0 0 1 0-1.186 10.007 10.007 0 0 1 2.223-3.591L5.49 8.418a4.006 4.006 0 0 0 5.258 5.512Z" />
            </svg>
          </button>

          <button
            v-if="mode === 'search' && String(modelValue).length > 0"
            type="button"
            tabindex="-1"
            class="transition-colors hover:text-secondary-700"
            @click="clearSearch"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              class="size-5"
            >
              <path
                d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"
              />
            </svg>
          </button>
        </slot>
      </div>
    </div>

    <p
      v-if="props.error"
      class="text-sm text-danger"
    >
      {{ props.error }}
    </p>
  </div>
</template>
