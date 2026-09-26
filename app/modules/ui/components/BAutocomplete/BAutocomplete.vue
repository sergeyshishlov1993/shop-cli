<script setup lang="ts">
interface AutocompleteOption {
  value: string | number
  label: string
}

interface Props {
  modelValue?: string | number | null
  options?: AutocompleteOption[]
  placeholder?: string
  label?: string
  error?: string
  disabled?: boolean
  required?: boolean
  loading?: boolean
  id?: string
  minChars?: number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  options: () => [],
  placeholder: '',
  label: '',
  error: '',
  disabled: false,
  required: false,
  loading: false,
  id: undefined,
  minChars: 1,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | null]
  search: [query: string]
}>()

const generatedId = useId()
const inputId = computed(() => props.id || generatedId)
const root = useTemplateRef<HTMLElement>('root')

const selectedOption = computed(() => props.options.find(option => option.value === props.modelValue) ?? null)
const query = ref(selectedOption.value?.label ?? '')
const isOpen = ref(false)

watch(selectedOption, (option) => {
  if (option) query.value = option.label
})

function onInput(value: string) {
  query.value = value
  isOpen.value = true

  if (props.modelValue !== null) emit('update:modelValue', null)
  if (value.length >= props.minChars) emit('search', value)
}

function select(option: AutocompleteOption) {
  query.value = option.label
  isOpen.value = false
  emit('update:modelValue', option.value)
}

onClickOutside(root, () => {
  isOpen.value = false
  query.value = selectedOption.value?.label ?? ''
})
</script>

<template>
  <div ref="root" class="b-field relative">
    <label
      v-if="label"
      :for="inputId"
      class="b-field__label"
    >
      {{ label }}
      <span v-if="required" class="b-field__required">*</span>
    </label>

    <div class="relative">
      <input
        :id="inputId"
        :value="query"
        type="text"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :aria-invalid="Boolean(error)"
        autocomplete="off"
        :class="['b-input pr-10', error ? 'b-input--invalid' : '']"
        @input="onInput(($event.target as HTMLInputElement).value)"
        @focus="isOpen = true"
      >

      <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400">
        <BSpinner v-if="loading" size="sm" />
        <Icon v-else name="lucide:chevron-down" class="size-4" />
      </span>

      <Transition name="b-zoom">
        <ul
          v-if="isOpen && options.length"
          class="absolute left-0 top-full z-30 mt-1 max-h-64 w-full overflow-y-auto glass glass--strong rounded-xl py-1"
        >
          <li
            v-for="option in options"
            :key="option.value"
            class="cursor-pointer px-4 py-2.5 text-sm text-secondary-800 transition-colors hover:bg-secondary-100"
            @click="select(option)"
          >
            {{ option.label }}
          </li>
        </ul>
      </Transition>
    </div>

    <p v-if="error" class="b-field__error">
      {{ error }}
    </p>
  </div>
</template>
