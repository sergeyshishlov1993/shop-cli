<script setup lang="ts">
import { adminApi, getAdminError, type AdminColor, type AdminProduct, type AdminSize, type AdminVariant } from '~/modules/admin/adminApi'
import AdminDialog from '~/modules/admin/components/AdminDialog.vue'
import AdminProductMedia from '~/modules/admin/components/AdminProductMedia.vue'
import { useConfirm } from '~/modules/ui/composables/useConfirm'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const route = useRoute()
const toast = useToast()
const { confirm } = useConfirm()
const productId = Number(route.params.id)
const product = ref<AdminProduct | null>(null)
const variants = ref<AdminVariant[]>([])
const sizes = ref<AdminSize[]>([])
const colors = ref<AdminColor[]>([])
const variantDialog = ref(false)
const editingVariantId = ref<number | null>(null)
const variantForm = reactive({ sku: '', barcode: '', sizeId: 0, colorId: 0, price: null as number | null, stockQty: 0, reservedQty: 0, isActive: true })

async function load() {
  try {
    ;[product.value, variants.value, sizes.value, colors.value] = await Promise.all([
      adminApi.product(productId), adminApi.variants(productId), adminApi.sizes(), adminApi.colors(),
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
      <AdminProductMedia :product-id="productId" />
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
