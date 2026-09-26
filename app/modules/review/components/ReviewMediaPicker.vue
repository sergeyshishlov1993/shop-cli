<script setup lang="ts">
interface Props {
  max: number
}

const props = defineProps<Props>()
const files = defineModel<File[]>({ required: true })
const emit = defineEmits<{ error: [message: string] }>()

const input = useTemplateRef<HTMLInputElement>('input')
const previews = computed(() => files.value.map(file => ({
  file,
  url: URL.createObjectURL(file),
  isVideo: file.type.startsWith('video/'),
})))

watch(previews, (_, old) => old?.forEach(p => URL.revokeObjectURL(p.url)))
onBeforeUnmount(() => previews.value.forEach(p => URL.revokeObjectURL(p.url)))

function onChange(event: Event) {
  const picked = Array.from((event.target as HTMLInputElement).files ?? [])
  const next = [...files.value, ...picked]
  if (next.length > props.max) emit('error', `Можна додати не більше ${props.max} файлів`)
  files.value = next.slice(0, props.max)
  if (input.value) input.value.value = ''
}

function remove(index: number) {
  files.value = files.value.filter((_, i) => i !== index)
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <span class="text-sm font-medium text-secondary-700">Фото або відео</span>
    <div class="flex flex-wrap gap-2">
      <div
        v-for="(item, index) in previews"
        :key="item.url"
        class="relative size-20 overflow-hidden rounded-xl border border-secondary-200 bg-secondary-100"
      >
        <video v-if="item.isVideo" :src="item.url" class="size-full object-cover" muted preload="metadata" />
        <img v-else :src="item.url" :alt="item.file.name" class="size-full object-cover">
        <Icon v-if="item.isVideo" name="lucide:play" class="absolute bottom-1 left-1 size-4 text-white drop-shadow" />
        <BBtn
          variant="icon"
          size="sm"
          class="absolute right-0.5 top-0.5 !size-6 !bg-white/85"
          aria-label="Прибрати файл"
          @click="remove(index)"
        >
          <Icon name="lucide:x" class="size-3.5" />
        </BBtn>
      </div>

      <button
        v-if="files.length < max"
        type="button"
        class="flex size-20 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-secondary-300 text-secondary-500 transition-colors hover:border-primary-400 hover:text-primary-600"
        @click="input?.click()"
      >
        <Icon name="lucide:image-plus" class="size-5" />
        <span class="text-[11px] leading-tight">Додати</span>
      </button>
    </div>
    <span class="text-xs text-secondary-400">JPG, PNG, WebP, MP4, MOV · до {{ max }} файлів</span>
    <input
      ref="input"
      type="file"
      accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime"
      multiple
      class="hidden"
      @change="onChange"
    >
  </div>
</template>
