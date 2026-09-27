<script setup lang="ts">
import { adminApi, getAdminError, type AdminColor, type AdminProduct, type AdminSize, type AdminVariant, type AdminWearWithItem } from '~/modules/admin/adminApi'
import AdminDialog from '~/modules/admin/components/AdminDialog.vue'
import AdminProductMedia from '~/modules/admin/components/AdminProductMedia.vue'
import { useConfirm } from '~/modules/ui/composables/useConfirm'
import { getFileUrl } from '~/modules/common/helpers/fileUrl'
import { rules, useFormValidation } from '~/modules/common/composables/useFormValidation'

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
const stockRules = [rules.integer(), rules.min(0, 'Значення не може бути відʼємним')]
const { errors, validate, touch, reset, applyServerErrors } = useFormValidation({
  sku: [() => variantForm.sku, [rules.required('Вкажіть SKU')]],
  price: [() => variantForm.price, [rules.number(), rules.positive()]],
  stockQty: [() => variantForm.stockQty, stockRules],
  reservedQty: [() => variantForm.reservedQty, stockRules],
})

const wearWith = ref<AdminWearWithItem[]>([])
const wearSearchOptions = ref<AdminProduct[]>([])
const wearSearchValue = ref<number | null>(null)
const wearSearchLoading = ref(false)
const wearSaving = ref(false)

async function load() {
  try {
    ;[product.value, variants.value, sizes.value, colors.value, wearWith.value] = await Promise.all([
      adminApi.product(productId), adminApi.variants(productId), adminApi.sizes(), adminApi.colors(), adminApi.wearWith(productId),
    ])
  } catch (error) { toast.error(getAdminError(error, 'Не вдалося завантажити товар')) }
}

function openVariant(variant?: AdminVariant) {
  editingVariantId.value = variant?.id ?? null
  Object.assign(variantForm, variant ? {
    sku: variant.sku, barcode: variant.barcode ?? '', sizeId: variant.sizeId ?? 0, colorId: variant.colorId ?? 0, price: variant.price,
    stockQty: variant.stockQty, reservedQty: variant.reservedQty, isActive: variant.isActive,
  } : { sku: '', barcode: '', sizeId: 0, colorId: 0, price: null, stockQty: 0, reservedQty: 0, isActive: true })
  reset()
  variantDialog.value = true
}

async function saveVariant() {
  if (!validate()) return
  try {
    const dto = { ...variantForm, sizeId: variantForm.sizeId || undefined, colorId: variantForm.colorId || undefined, price: variantForm.price ?? undefined }
    if (editingVariantId.value) await adminApi.updateVariant(productId, editingVariantId.value, dto)
    else await adminApi.createVariant(productId, dto)
    variantDialog.value = false
    variants.value = await adminApi.variants(productId)
    toast.success('Варіант збережено')
  } catch (error) {
    const rest = applyServerErrors(error)
    if (rest.length || !Object.values(errors).some(Boolean)) toast.error(getAdminError(error))
  }
}

async function removeVariant(id: number) {
  if (!(await confirm({ title: 'Видалити варіант?', message: 'Цю дію не можна скасувати.', variant: 'danger', confirmText: 'Видалити' }))) return
  try { await adminApi.deleteVariant(productId, id); variants.value = await adminApi.variants(productId) } catch (error) { toast.error(getAdminError(error)) }
}

const wearOptions = computed(() => wearSearchOptions.value
  .filter(p => p.id !== productId && !wearWith.value.some(w => w.id === p.id))
  .map(p => ({ value: p.id, label: p.name })))

async function searchWear(search: string) {
  wearSearchLoading.value = true
  try { wearSearchOptions.value = (await adminApi.products({ search, limit: 10 })).items } catch (error) { toast.error(getAdminError(error)) } finally { wearSearchLoading.value = false }
}

const wearSearchKey = ref(0)
watch(wearSearchValue, (id) => {
  const found = id ? wearSearchOptions.value.find(p => p.id === id) : null
  if (!found) return
  if (wearWith.value.length >= 12) { toast.error('Максимум 12 товарів'); return }
  wearWith.value.push({ id: found.id, name: found.name, slug: found.slug, price: found.basePrice, mainImage: null })
  // Перемонтовуємо пошук, щоб поле очистилось (BAutocomplete не скидає текст при null)
  nextTick(() => { wearSearchValue.value = null; wearSearchKey.value++ })
})

function moveWear(index: number, delta: number) {
  const list = wearWith.value
  const target = index + delta
  if (target < 0 || target >= list.length) return
  ;[list[index], list[target]] = [list[target]!, list[index]!]
}

async function saveWear() {
  wearSaving.value = true
  try {
    wearWith.value = await adminApi.setWearWith(productId, wearWith.value.map(w => w.id))
    toast.success('Список збережено')
  } catch (error) { toast.error(getAdminError(error)) } finally { wearSaving.value = false }
}

await load()
</script>

<template>
  <div class="mx-auto max-w-7xl space-y-8">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div><NuxtLink to="/admin/products" class="text-sm text-secondary-500 hover:text-secondary-900">← Усі товари</NuxtLink><h1 class="mt-2 text-3xl font-bold">{{ product?.name || 'Товар' }}</h1><p class="mt-1 text-sm text-secondary-500">Варіанти, залишки та вся медіагалерея.</p></div>
      <BBtn @click="openVariant()"><Icon name="lucide:plus" size="17" /> Додати варіант</BBtn>
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

    <!-- Плаваюча «+» у всіх розділах товарів — новий товар; варіант додається кнопкою в блоці «Варіанти» -->
    <BBtn class="fixed bottom-24 right-4 z-30 !size-14 !rounded-full !p-0 shadow-lg lg:hidden" aria-label="Новий товар" to="/admin/products?create=1"><Icon name="lucide:plus" size="24" /></BBtn>

    <section class="space-y-4">
      <div><h2 class="text-xl font-semibold">Медіагалерея</h2><p class="text-sm text-secondary-500">Перше основне медіа показується у картці товару. Порядок можна змінювати.</p></div>
      <AdminProductMedia :product-id="productId" />
    </section>

    <section class="space-y-4" data-testid="wear-with-admin">
      <div><h2 class="text-xl font-semibold">З чим носити</h2><p class="text-sm text-secondary-500">Ручний список (до 12). Якщо порожній — на вітрині показуються товари з інших категорій, які купують разом.</p></div>
      <BAutocomplete :key="wearSearchKey" v-model="wearSearchValue" :options="wearOptions" :loading="wearSearchLoading" label="Додати товар" placeholder="Почніть вводити назву" :min-chars="2" @search="searchWear" />
      <ul class="divide-y divide-secondary-100 rounded-xl border border-secondary-200 bg-white" data-testid="wear-with-list">
        <li v-for="(item, index) in wearWith" :key="item.id" class="flex items-center gap-3 p-3">
          <img v-if="item.mainImage" :src="getFileUrl(item.mainImage, 'thumb')" :alt="item.name" class="size-12 rounded object-cover">
          <div v-else class="size-12 rounded bg-secondary-100" />
          <span class="flex-1 text-sm">{{ item.name }}</span>
          <BBtn variant="icon" size="sm" title="Вгору" :disabled="index === 0" @click="moveWear(index, -1)"><Icon name="lucide:arrow-up" /></BBtn>
          <BBtn variant="icon" size="sm" title="Вниз" :disabled="index === wearWith.length - 1" @click="moveWear(index, 1)"><Icon name="lucide:arrow-down" /></BBtn>
          <BBtn variant="icon" size="sm" class="text-red-600" title="Прибрати" @click="wearWith.splice(index, 1)"><Icon name="lucide:x" /></BBtn>
        </li>
        <li v-if="!wearWith.length" class="p-6 text-center text-sm text-secondary-500">Список порожній.</li>
      </ul>
      <div class="flex justify-end"><BBtn :loading="wearSaving" @click="saveWear">Зберегти</BBtn></div>
    </section>

    <AdminDialog v-model="variantDialog" :title="editingVariantId ? 'Редагувати варіант' : 'Новий варіант'">
      <form novalidate class="grid gap-4 sm:grid-cols-2" @submit.prevent="saveVariant">
        <BInput v-model="variantForm.sku" label="SKU" required :error="errors.sku" @blur="touch('sku')" />
        <BInput v-model="variantForm.barcode" label="Штрихкод" inputmode="numeric" />
        <BInput v-model.number="variantForm.price" type="number" label="Ціна (порожньо = базова)" :error="errors.price" @blur="touch('price')" />
        <BSelect v-model.number="variantForm.sizeId" label="Розмір" :options="[{ label: 'Без розміру', value: 0 }, ...sizes.map(size => ({ label: size.name, value: size.id }))]" />
        <BSelect v-model.number="variantForm.colorId" label="Колір" :options="[{ label: 'Без кольору', value: 0 }, ...colors.map(color => ({ label: color.name, value: color.id }))]" />
        <BInput v-model.number="variantForm.stockQty" type="number" label="Залишок" :error="errors.stockQty" @blur="touch('stockQty')" />
        <BInput v-if="editingVariantId" v-model.number="variantForm.reservedQty" type="number" label="Резерв" :error="errors.reservedQty" @blur="touch('reservedQty')" />
        <BCheckbox v-model="variantForm.isActive" label="Активний" class="sm:col-span-2" />
        <div class="flex justify-end gap-3 border-t border-secondary-200 pt-4 sm:col-span-2">
          <BBtn variant="outline" type="button" @click="variantDialog = false">Скасувати</BBtn>
          <BBtn type="submit">Зберегти</BBtn>
        </div>
      </form>
    </AdminDialog>
  </div>
</template>
