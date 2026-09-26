<script setup lang="ts">
import { adminApi, getAdminError, type AdminColor, type AdminProduct, type AdminProductMedia, type AdminSize, type AdminVariant } from '~/modules/admin/adminApi'
import AdminDialog from '~/modules/admin/components/AdminDialog.vue'
import { getFileUrl, getInstagramEmbedUrl } from '~/modules/common/helpers/fileUrl'
import { useConfirm } from '~/modules/ui/composables/useConfirm'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const route = useRoute()
const toast = useToast()
const { confirm } = useConfirm()
const productId = Number(route.params.id)
const product = ref<AdminProduct | null>(null)
const variants = ref<AdminVariant[]>([])
const media = ref<AdminProductMedia[]>([])
const sizes = ref<AdminSize[]>([])
const colors = ref<AdminColor[]>([])
const mediaFile = shallowRef<File | null>(null)
const instagramUrl = ref('')
const uploading = ref(false)
const variantDialog = ref(false)
const editingVariantId = ref<number | null>(null)
const variantForm = reactive({ sku: '', barcode: '', sizeId: 0, colorId: 0, price: null as number | null, stockQty: 0, reservedQty: 0, isActive: true })

async function load() {
  try {
    ;[product.value, variants.value, media.value, sizes.value, colors.value] = await Promise.all([
      adminApi.product(productId), adminApi.variants(productId), adminApi.productMedia(productId), adminApi.sizes(), adminApi.colors(),
    ])
  } catch (error) { toast.error(getAdminError(error, 'Не вдалося завантажити товар')) }
}

function openVariant(variant?: AdminVariant) {
  editingVariantId.value = variant?.id ?? null
  Object.assign(variantForm, variant ? {
    sku: variant.sku, barcode: variant.barcode ?? '', sizeId: variant.sizeId ?? 0, colorId: variant.colorId ?? 0, price: variant.price,
    stockQty: variant.stockQty, reservedQty: variant.reservedQty, isActive: variant.isActive,
  } : { sku: '', barcode: '', sizeId: 0, colorId: 0, price: null, stockQty: 0, reservedQty: 0, isActive: true })
  variantDialog.value = true
}

async function saveVariant() {
  try {
    const dto = { ...variantForm, sizeId: variantForm.sizeId || undefined, colorId: variantForm.colorId || undefined, price: variantForm.price ?? undefined }
    if (editingVariantId.value) await adminApi.updateVariant(productId, editingVariantId.value, dto)
    else await adminApi.createVariant(productId, dto)
    variantDialog.value = false
    variants.value = await adminApi.variants(productId)
    toast.success('Варіант збережено')
  } catch (error) { toast.error(getAdminError(error)) }
}

async function removeVariant(id: number) {
  if (!(await confirm({ title: 'Видалити варіант?', message: 'Цю дію не можна скасувати.', variant: 'danger', confirmText: 'Видалити' }))) return
  try { await adminApi.deleteVariant(productId, id); variants.value = await adminApi.variants(productId) } catch (error) { toast.error(getAdminError(error)) }
}

async function uploadMedia() {
  if (!mediaFile.value) return
  uploading.value = true
  try {
    const file = await adminApi.uploadFile(mediaFile.value)
    await adminApi.addProductMedia(productId, { fileId: file.id, mediaType: file.fileType, isMain: media.value.length === 0, sortOrder: media.value.length })
    mediaFile.value = null
    media.value = await adminApi.productMedia(productId)
    toast.success('Медіа додано')
  } catch (error) { toast.error(getAdminError(error)) } finally { uploading.value = false }
}

async function addInstagramMedia() {
  if (!instagramUrl.value.trim()) return
  uploading.value = true
  try {
    await adminApi.addProductInstagramMedia(productId, { url: instagramUrl.value.trim(), sortOrder: media.value.length })
    instagramUrl.value = ''
    media.value = await adminApi.productMedia(productId)
    toast.success('Медіа додано')
  } catch (error) { toast.error(getAdminError(error)) } finally { uploading.value = false }
}

async function setMain(id: number) {
  await adminApi.setMainProductMedia(productId, id)
  media.value = await adminApi.productMedia(productId)
}

async function removeMedia(id: number) {
  if (!(await confirm({ title: 'Видалити медіа з товару?', message: 'Цю дію не можна скасувати.', variant: 'danger', confirmText: 'Видалити' }))) return
  await adminApi.deleteProductMedia(productId, id)
  media.value = await adminApi.productMedia(productId)
}

async function moveMedia(index: number, direction: -1 | 1) {
  const nextIndex = index + direction
  if (nextIndex < 0 || nextIndex >= media.value.length) return
  const reordered = [...media.value]
  ;[reordered[index], reordered[nextIndex]] = [reordered[nextIndex]!, reordered[index]!]
  media.value = await adminApi.reorderProductMedia(productId, reordered.map((item, sortOrder) => ({ id: item.id, sortOrder })))
}

await load()
</script>

<template>
  <div class="mx-auto max-w-7xl space-y-8">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div><NuxtLink to="/admin/products" class="text-sm text-secondary-500 hover:text-secondary-900">← Усі товари</NuxtLink><h1 class="mt-2 text-3xl font-bold">{{ product?.name || 'Товар' }}</h1><p class="mt-1 text-sm text-secondary-500">Варіанти, залишки та вся медіагалерея.</p></div>
      <BBtn class="max-lg:hidden" @click="openVariant()"><Icon name="lucide:plus" size="17" /> Додати варіант</BBtn>
    </div>

    <section class="space-y-4">
      <h2 class="text-xl font-semibold">Варіанти та залишки</h2>
      <div class="lg:overflow-x-auto rounded-xl border border-secondary-200 bg-white">
        <table class="admin-table w-full lg:min-w-[760px] text-sm">
          <thead class="bg-secondary-50 text-left text-xs uppercase text-secondary-500"><tr><th class="p-4">SKU</th><th class="p-4">Розмір</th><th class="p-4">Колір</th><th class="p-4">Ціна</th><th class="p-4">Залишок / резерв</th><th class="p-4">Статус</th><th class="p-4"></th></tr></thead>
          <tbody class="divide-y divide-secondary-100">
            <tr v-for="variant in variants" :key="variant.id">
              <td class="p-4 font-mono" data-label="SKU">{{ variant.sku }}</td>
              <td class="p-4" data-label="Розмір">{{ variant.size?.name || '—' }}</td>
              <td class="p-4" data-label="Колір"><span v-if="variant.color" class="inline-flex items-center gap-2"><i class="size-3 rounded-full border border-secondary-200" :style="{ background: variant.color.hexCode || '#fff' }" />{{ variant.color.name }}</span><span v-else>—</span></td>
              <td class="p-4" data-label="Ціна">{{ variant.price == null ? 'Базова' : formatPrice(variant.price) }}</td>
              <td class="p-4" data-label="Залишок / резерв">{{ variant.stockQty }} / {{ variant.reservedQty }}</td>
              <td class="p-4" data-label="Статус">{{ variant.isActive ? 'Активний' : 'Прихований' }}</td>
              <td class="p-4 text-right admin-table__actions">
                <BBtn variant="icon" size="sm" title="Редагувати" @click="openVariant(variant)"><Icon name="lucide:pencil" /></BBtn>
                <BBtn variant="icon" size="sm" class="text-red-600" title="Видалити" @click="removeVariant(variant.id)"><Icon name="lucide:trash-2" /></BBtn>
              </td>
            </tr>
            <tr v-if="!variants.length"><td colspan="7" class="p-10 text-center text-secondary-500">Варіантів немає — товар не можна додати в кошик.</td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <BBtn class="fixed bottom-24 right-4 z-30 !size-14 !rounded-full !p-0 shadow-lg lg:hidden" aria-label="Додати" @click="openVariant()"><Icon name="lucide:plus" size="24" /></BBtn>

    <section class="space-y-4">
      <div><h2 class="text-xl font-semibold">Медіагалерея</h2><p class="text-sm text-secondary-500">Перше основне медіа показується у картці товару. Порядок можна змінювати.</p></div>
      <div class="flex flex-wrap items-end gap-3 rounded-xl border border-dashed border-secondary-300 bg-white p-4">
        <BFile v-model="mediaFile" label="Нове фото або відео" accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime" :max-size="50 * 1024 * 1024" class="min-w-[280px] flex-1" />
        <BBtn :disabled="!mediaFile" :loading="uploading" @click="uploadMedia">Додати</BBtn>
      </div>
      <div class="flex flex-wrap items-end gap-3 rounded-xl border border-dashed border-secondary-300 bg-white p-4">
        <BInput v-model="instagramUrl" label="Відеовідгук з Instagram" placeholder="https://www.instagram.com/reel/..." class="min-w-[280px] flex-1" />
        <BBtn :disabled="!instagramUrl.trim()" :loading="uploading" @click="addInstagramMedia">Додати</BBtn>
      </div>
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article v-for="(item, index) in media" :key="item.id" class="overflow-hidden rounded-xl border border-secondary-200 bg-white">
          <div class="aspect-[4/5] bg-secondary-100"><iframe v-if="item.externalUrl" :src="getInstagramEmbedUrl(item.externalUrl) ?? undefined" class="size-full border-0" loading="lazy" title="Instagram" /><video v-else-if="item.mediaType === 'VIDEO'" :src="getFileUrl(item.file)" class="size-full object-cover" muted controls /><img v-else :src="getFileUrl(item.file, 'medium')" :alt="item.file?.originalName" class="size-full object-cover"></div>
          <div class="flex items-center justify-between gap-2 p-3">
            <span class="text-xs" :class="item.isMain ? 'font-semibold text-emerald-700' : 'text-secondary-500'">{{ item.isMain ? 'Основне' : `№ ${index + 1}` }}</span>
            <div class="flex">
              <BBtn variant="icon" size="sm" :disabled="index === 0" @click="moveMedia(index, -1)"><Icon name="lucide:arrow-left" size="16" /></BBtn>
              <BBtn variant="icon" size="sm" :disabled="index === media.length - 1" @click="moveMedia(index, 1)"><Icon name="lucide:arrow-right" size="16" /></BBtn>
              <BBtn v-if="!item.isMain" variant="icon" size="sm" title="Зробити основним" @click="setMain(item.id)"><Icon name="lucide:star" size="16" /></BBtn>
              <BBtn variant="icon" size="sm" class="text-red-600" @click="removeMedia(item.id)"><Icon name="lucide:trash-2" size="16" /></BBtn>
            </div>
          </div>
        </article>
      </div>
    </section>

    <AdminDialog v-model="variantDialog" :title="editingVariantId ? 'Редагувати варіант' : 'Новий варіант'">
      <form class="grid gap-4 sm:grid-cols-2" @submit.prevent="saveVariant">
        <BInput v-model="variantForm.sku" label="SKU" required />
        <BInput v-model="variantForm.barcode" label="Штрихкод" inputmode="numeric" />
        <BInput v-model.number="variantForm.price" type="number" label="Ціна (порожньо = базова)" />
        <BSelect v-model.number="variantForm.sizeId" label="Розмір" :options="[{ label: 'Без розміру', value: 0 }, ...sizes.map(size => ({ label: size.name, value: size.id }))]" />
        <BSelect v-model.number="variantForm.colorId" label="Колір" :options="[{ label: 'Без кольору', value: 0 }, ...colors.map(color => ({ label: color.name, value: color.id }))]" />
        <BInput v-model.number="variantForm.stockQty" type="number" label="Залишок" />
        <BInput v-if="editingVariantId" v-model.number="variantForm.reservedQty" type="number" label="Резерв" />
        <BCheckbox v-model="variantForm.isActive" label="Активний" class="sm:col-span-2" />
        <div class="flex justify-end gap-3 border-t border-secondary-200 pt-4 sm:col-span-2">
          <BBtn variant="outline" type="button" @click="variantDialog = false">Скасувати</BBtn>
          <BBtn type="submit">Зберегти</BBtn>
        </div>
      </form>
    </AdminDialog>
  </div>
</template>
