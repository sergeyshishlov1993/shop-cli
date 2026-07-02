<script setup lang="ts">
interface Props {
  modelValue: File | null
  accept?: string
  label?: string
  error?: string
  disabled?: boolean
  maxSize?: number
}

const props = withDefaults(defineProps<Props>(), {
  accept: '*',
  label: undefined,
  error: undefined,
  disabled: false,
  maxSize: 10 * 1024 * 1024,
})

const emit = defineEmits<{
  'update:modelValue': [file: File | null]
}>()

const inputRef = ref<HTMLInputElement>()
const isDragging = ref(false)

function handleFile(file: File) {
  if (props.disabled) return
  if (props.maxSize && file.size > props.maxSize) return
  emit('update:modelValue', file)
}

function onInputChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) handleFile(file)
  target.value = ''
}

function onDrop(event: DragEvent) {
  isDragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) handleFile(file)
}

function onDragOver() {
  if (!props.disabled) isDragging.value = true
}

function onDragLeave() {
  isDragging.value = false
}

function openPicker() {
  if (!props.disabled) inputRef.value?.click()
}

function clear() {
  emit('update:modelValue', null)
}
</script>

<template>
  <div>
    <label v-if="label" class="mb-1 block text-sm font-medium text-gray-700">
      {{ label }}
    </label>

    <div
      class="relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 transition-colors"
      :class="[
        isDragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300 bg-gray-50',
        disabled ? 'cursor-not-allowed opacity-50' : 'hover:border-primary-400 hover:bg-primary-50/50',
        error ? 'border-danger' : '',
      ]"
      @click="openPicker"
      @drop.prevent="onDrop"
      @dragover.prevent="onDragOver"
      @dragleave="onDragLeave"
    >
      <input
        ref="inputRef"
        type="file"
        class="hidden"
        :accept="accept"
        :disabled="disabled"
        @change="onInputChange"
      >

      <template v-if="modelValue">
        <div class="flex items-center gap-2">
          <BIcon name="file" :size="20" class="text-primary-600" />
          <span class="max-w-48 truncate text-sm text-gray-700">{{ modelValue.name }}</span>
          <button
            type="button"
            class="ml-1 rounded p-0.5 text-gray-400 transition-colors hover:text-danger"
            @click.stop="clear"
          >
            <BIcon name="close" :size="16" />
          </button>
        </div>
      </template>

      <template v-else>
        <BIcon name="upload" :size="32" class="mb-2 text-gray-400" />
        <p class="text-sm text-gray-600">
          Перетягніть файл або <span class="font-medium text-primary-600">оберіть</span>
        </p>
      </template>
    </div>

    <p v-if="error" class="mt-1 text-sm text-danger">{{ error }}</p>
  </div>
</template>
