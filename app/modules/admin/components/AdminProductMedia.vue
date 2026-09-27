<script setup lang="ts">
import { adminApi, getAdminError, type AdminProductMedia } from '~/modules/admin/adminApi'
import { getFileUrl, getInstagramEmbedUrl } from '~/modules/common/helpers/fileUrl'
import ReviewMediaPicker from '~/modules/review/components/ReviewMediaPicker.vue'
import { useConfirm } from '~/modules/ui/composables/useConfirm'
import { useToast } from '~/modules/ui/composables/useToast'

const props = defineProps<{ productId: number | null }>()

const toast = useToast()
const { confirm } = useConfirm()
const media = ref<AdminProductMedia[]>([])
const files = ref<File[]>([])
// Яке з вибраних (ще не завантажених) фото зробити головним — для нового товару
const pendingMainIndex = ref<number | null>(null)
const instagramUrl = ref('')
const pendingLinks = ref<string[]>([])
const busy = ref(false)
const progress = ref('')
// Відео, що грає при наведенні на картку товару в каталозі (Product.hoverVideoFileId)
const cardVideoFileId = ref<number | null>(null)

const reload = async (id = props.productId) => {
  media.value = id ? await adminApi.productMedia(id) : []
  cardVideoFileId.value = id ? (await adminApi.product(id)).hoverVideoFileId ?? null : null
}
watch(() => props.productId, id => reload(id).catch(error => toast.error(getAdminError(error))), { immediate: true })

async function uploadPending(id: number) {
  busy.value = true
  let failed = 0
  try {
    await reload(id)
    let hasMain = media.value.some(item => item.isMain)
    let sortOrder = media.value.length
    const queue = [...files.value]
    for (const [index, file] of queue.entries()) {
      progress.value = `${index + 1}/${queue.length}`
      try {
        const uploaded = await adminApi.uploadFile(file)
        const isMain = pendingMainIndex.value === null ? !hasMain && uploaded.fileType === 'IMAGE' : index === pendingMainIndex.value
        await adminApi.addProductMedia(id, { fileId: uploaded.id, mediaType: uploaded.fileType, isMain, sortOrder: sortOrder++ })
        hasMain ||= isMain
        files.value = files.value.filter(item => item !== file)
      } catch (error) { failed++; toast.error(getAdminError(error, `Не вдалося завантажити ${file.name}`)) }
    }
    for (const url of [...pendingLinks.value]) {
      try {
        await adminApi.addProductInstagramMedia(id, { url, sortOrder: sortOrder++ })
        pendingLinks.value = pendingLinks.value.filter(item => item !== url)
      } catch (error) { failed++; toast.error(getAdminError(error, `Не вдалося додати ${url}`)) }
    }
    pendingMainIndex.value = null
    await reload(id)
    if (queue.length && !failed) toast.success('Медіа додано')
  } finally { busy.value = false; progress.value = '' }
  return !failed
}

async function addInstagram() {
  const url = instagramUrl.value.trim()
  if (!url) return
  if (!getInstagramEmbedUrl(url)) return toast.error('Некоректне посилання Instagram')
  instagramUrl.value = ''
  pendingLinks.value.push(url)
  if (props.productId && await uploadPending(props.productId)) toast.success('Відео додано')
}

async function run(action: () => Promise<unknown>) {
  if (!props.productId) return
  busy.value = true
  try { await action(); await reload() } catch (error) { toast.error(getAdminError(error)) } finally { busy.value = false }
}

const setMain = (id: number) => run(() => adminApi.setMainProductMedia(props.productId!, id))
const toggleCardVideo = (fileId: number) => run(() => adminApi.updateProduct(props.productId!, { hoverVideoFileId: cardVideoFileId.value === fileId ? null : fileId }))

async function remove(id: number) {
  if (await confirm({ title: 'Видалити медіа з товару?', message: 'Цю дію не можна скасувати.', variant: 'danger', confirmText: 'Видалити' })) await run(() => adminApi.deleteProductMedia(props.productId!, id))
}

function move(index: number, direction: -1 | 1) {
  const list = [...media.value]
  ;[list[index], list[index + direction]] = [list[index + direction]!, list[index]!]
  return run(() => adminApi.reorderProductMedia(props.productId!, list.map((item, sortOrder) => ({ id: item.id, sortOrder }))))
}

// У редагуванні вантажимо одразу після вибору — окремого кроку «Завантажити» немає
watch(() => files.value.length, count => { if (count && props.productId && !busy.value) uploadPending(props.productId) })

defineExpose({ uploadPending, hasPending: () => files.value.length > 0 || pendingLinks.value.length > 0 })
</script>

<template>
  <div class="space-y-4">
    <div v-if="media.length" class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      <article v-for="(item, index) in media" :key="item.id" class="overflow-hidden rounded-xl border border-secondary-200 bg-white">
        <div class="relative aspect-[4/5] bg-secondary-100">
          <iframe v-if="item.externalUrl" :src="getInstagramEmbedUrl(item.externalUrl) ?? undefined" class="size-full border-0" loading="lazy" title="Instagram" />
          <video v-else-if="item.mediaType === 'VIDEO'" :src="getFileUrl(item.file)" class="size-full object-cover" muted controls preload="metadata" />
          <img v-else :src="getFileUrl(item.file, 'medium')" :alt="item.file?.originalName" class="size-full object-cover">
          <div class="absolute left-2 top-2 flex flex-col items-start gap-1">
            <BTag v-if="item.isMain" size="sm">★ Головне</BTag>
            <BTag v-if="item.file?.id && item.file?.id === cardVideoFileId" size="sm" variant="info">▶ На картці</BTag>
            <BTag v-if="item.externalUrl" size="sm" variant="secondary">Відеоогляд Instagram</BTag>
          </div>
        </div>
        <div class="space-y-2 p-2">
          <!-- Головне — лише фото: воно показується в каталозі та як обкладинка -->
          <BBtn
            v-if="item.mediaType === 'IMAGE'"
            size="sm"
            block
            :variant="item.isMain ? 'primary' : 'outline'"
            :disabled="busy || item.isMain"
            @click="setMain(item.id)"
          >
            <Icon name="lucide:star" size="14" /> {{ item.isMain ? 'Головне фото' : 'Зробити головним' }}
          </BBtn>
          <BBtn
            v-else-if="item.file"
            size="sm"
            block
            :variant="item.file?.id === cardVideoFileId ? 'primary' : 'outline'"
            :disabled="busy"
            @click="toggleCardVideo(item.file.id)"
          >
            <Icon name="lucide:play" size="14" /> {{ item.file?.id === cardVideoFileId ? 'Відео на картці ✓' : 'Показувати на картці' }}
          </BBtn>
          <div class="flex items-center justify-between gap-1">
            <span class="text-xs text-secondary-500">№ {{ index + 1 }}</span>
            <div class="flex">
              <BBtn variant="icon" size="sm" title="Вліво" :disabled="busy || index === 0" @click="move(index, -1)"><Icon name="lucide:arrow-left" size="16" /></BBtn>
              <BBtn variant="icon" size="sm" title="Вправо" :disabled="busy || index === media.length - 1" @click="move(index, 1)"><Icon name="lucide:arrow-right" size="16" /></BBtn>
              <BBtn variant="icon" size="sm" class="text-red-600" title="Видалити" :disabled="busy" @click="remove(item.id)"><Icon name="lucide:trash-2" size="16" /></BBtn>
            </div>
          </div>
        </div>
      </article>
    </div>

    <div class="space-y-3 rounded-xl border border-dashed border-secondary-300 bg-white p-4">
      <ReviewMediaPicker v-model="files" v-model:main="pendingMainIndex" :max="20" :selectable-main="!productId" @error="toast.error" />
      <p v-if="!productId && files.length" class="text-xs text-secondary-500">Натисніть ★ на фото, щоб зробити його головним (інакше головним стане перше фото). Файли завантажаться після збереження товару.</p>
      <p v-if="productId" class="text-xs text-secondary-500">Файли завантажуються одразу. Головне фото та відео для картки обирайте кнопками під медіа вище.</p>
      <span v-if="progress" class="ml-2 inline-flex items-center gap-2 text-sm text-secondary-500"><BSpinner size="sm" /> {{ progress }}</span>
    </div>

    <div class="space-y-2 rounded-xl border border-dashed border-secondary-300 bg-white p-4">
      <div class="flex flex-wrap items-end gap-3">
        <BInput v-model="instagramUrl" label="Відеоогляд з Instagram (посилання на reel/пост)" placeholder="https://www.instagram.com/reel/..." class="min-w-[240px] flex-1" @keydown.enter.prevent="addInstagram" />
        <BBtn type="button" :disabled="!instagramUrl.trim() || busy" @click="addInstagram">Додати</BBtn>
      </div>
      <div v-if="pendingLinks.length" class="flex flex-wrap gap-2">
        <BTag v-for="url in pendingLinks" :key="url" size="sm" variant="secondary" closable @close="pendingLinks = pendingLinks.filter(item => item !== url)">{{ url }}</BTag>
      </div>
    </div>
  </div>
</template>
