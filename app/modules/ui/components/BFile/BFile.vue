<script setup lang="ts">
interface Props {
  modelValue: File | null
  accept?: string
  label?: string
  error?: string
  disabled?: boolean
  maxSize?: number
  buttonText?: string
}

const props = withDefaults(defineProps<Props>(), {
  accept: '*',
  label: undefined,
  error: undefined,
  disabled: false,
  maxSize: 10 * 1024 * 1024,
  buttonText: 'Оберіть файл',
})

const emit = defineEmits<{
  'update:modelValue': [file: File | null]
}>()

const input = useTemplateRef<HTMLInputElement>('input')
const isDragging = ref(false)
const sizeError = ref('')

function applyFile(file: File | undefined) {
  if (!file) return

  if (props.maxSize && file.size > props.maxSize) {
    sizeError.value = `Файл більший за ${Math.round(props.maxSize / 1024 / 1024)} МБ`
    return
  }

  sizeError.value = ''
  emit('update:modelValue', file)
}

function onChange(event: Event) {
  applyFile((event.target as HTMLInputElement).files?.[0])
}

function onDrop(event: DragEvent) {
  isDragging.value = false
  if (props.disabled) return
  applyFile(event.dataTransfer?.files?.[0])
}

// Превʼю обраного зображення (object URL звільняємо при зміні/демонтажі)
const previewUrl = ref('')
watch(() => props.modelValue, (file) => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = file && import.meta.client && file.type.startsWith('image/') ? URL.createObjectURL(file) : ''
}, { immediate: true })
onBeforeUnmount(() => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
})

const fileSize = computed(() => {
  const size = props.modelValue?.size ?? 0
  return size > 1024 * 1024 ? `${(size / 1024 / 1024).toFixed(1)} МБ` : `${Math.round(size / 1024)} КБ`
})

function clear() {
  emit('update:modelValue', null)
  sizeError.value = ''
  if (input.value) input.value.value = ''
}
</script>

<template>
  <div class="b-field">
    <label v-if="label" class="b-field__label">
      {{ label }}
    </label>

    <!-- Уся зона — нативний label: клік відкриває вибір файлу без програмного .click() -->
    <label
      class="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-6 text-center transition-colors hover:border-primary-400"
      :class="[
        isDragging ? 'border-primary-500 bg-primary-50' : 'border-secondary-300',
        disabled ? 'pointer-events-none opacity-50' : '',
      ]"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="onDrop"
    >
      <input
        ref="input"
        type="file"
        class="sr-only"
        :accept="accept"
        :disabled="disabled"
        @change="onChange"
      >

      <Icon name="lucide:upload" class="size-5 text-secondary-400" />

      <span class="b-btn b-btn--outline b-btn--sm">
        {{ buttonText }}
      </span>

      <p class="text-xs text-secondary-400">
        або перетягніть файл сюди
      </p>
    </label>

    <div
      v-if="modelValue"
      class="mt-2 flex items-center gap-3 rounded-xl border border-secondary-200 bg-secondary-50 p-2 text-sm text-secondary-700"
    >
      <img v-if="previewUrl" :src="previewUrl" alt="" class="size-14 shrink-0 rounded-lg object-cover" />
      <Icon v-else name="lucide:file" class="size-5 shrink-0 text-secondary-500" />
      <span class="min-w-0 flex-1">
        <span class="block truncate">{{ modelValue.name }}</span>
        <span class="text-xs text-secondary-500">{{ fileSize }}</span>
      </span>
      <button
        type="button"
        class="text-secondary-400 transition-colors hover:text-danger"
        aria-label="Прибрати файл"
        @click="clear"
      >
        <Icon name="lucide:x" class="size-4" />
      </button>
    </div>

    <p v-if="error || sizeError" class="b-field__error">
      {{ error || sizeError }}
    </p>
  </div>
</template>
