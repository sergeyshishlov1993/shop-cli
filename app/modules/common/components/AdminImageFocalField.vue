<script setup lang="ts">
// Поле «фото + кадрування» для адмінки: файл завантажується одразу, id пишеться в form.imageFileId,
// нижче — BannerFocalEditor із пропорціями, як цей елемент виглядає на вітрині.
import { adminApi, getAdminError } from '~/modules/admin/adminApi'
import { useToast } from '~/modules/ui/composables/useToast'
import { useConfirm } from '~/modules/ui/composables/useConfirm'

type FocalImageForm = {
  imageFileId?: number | null
  focalX: number, focalY: number
  focalXTablet: number, focalYTablet: number
  focalXMobile: number, focalYMobile: number
}

const props = defineProps<{
  form: FocalImageForm
  currentUrl?: string
  label?: string
  ratios?: { desktop: number, tablet: number, mobile: number }
}>()

const toast = useToast()
const { confirm } = useConfirm()
const file = shallowRef<File | null>(null)
const uploading = ref(false)
const previewUrl = ref('')
const src = computed(() => previewUrl.value || props.currentUrl || '')

watch(file, async (value) => {
  if (!value) return
  uploading.value = true
  try {
    const uploaded = await adminApi.uploadFile(value)
    props.form.imageFileId = uploaded.id
    if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = URL.createObjectURL(value)
  }
  catch (error) {
    toast.error(getAdminError(error, 'Не вдалося завантажити фото'))
  }
  finally {
    uploading.value = false
  }
})

onBeforeUnmount(() => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
})

async function removeImage() {
  if (!(await confirm({ title: 'Прибрати фото?', message: 'Цю дію не можна скасувати.', variant: 'danger', confirmText: 'Прибрати' }))) return
  props.form.imageFileId = null
  file.value = null
  previewUrl.value = ''
}
</script>

<template>
  <div class="space-y-3">
    <BFile v-model="file" :label="label ?? 'Фото'" accept="image/jpeg,image/png,image/webp" :max-size="20 * 1024 * 1024" :disabled="uploading" />
    <template v-if="src && form.imageFileId">
      <div class="flex items-center justify-between">
        <p class="text-sm font-medium text-gray-700">Кадрування на екранах</p>
        <button type="button" class="text-xs text-danger underline" @click="removeImage">Прибрати фото</button>
      </div>
      <BannerFocalEditor :src="src" :form="form" :ratios="ratios" />
    </template>
  </div>
</template>
