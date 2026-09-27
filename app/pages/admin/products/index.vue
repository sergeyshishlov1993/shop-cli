<script setup lang="ts">
import AdminDialog from '~/modules/admin/components/AdminDialog.vue'
import AdminProductMedia from '~/modules/admin/components/AdminProductMedia.vue'
import {
  adminApi,
  getAdminError,
  type AdminCategory,
  type AdminProduct,
  type AdminProductInput,
  type AdminProductType,
} from '~/modules/admin/adminApi'
import { useToast } from '~/modules/ui/composables/useToast'
import { useConfirm } from '~/modules/ui/composables/useConfirm'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const toast = useToast()
const { confirm } = useConfirm()
const products = ref<AdminProduct[]>([])
const categories = ref<AdminCategory[]>([])
const totalCount = ref(0)
const page = ref(1)
const totalPages = ref(1)
const search = ref('')
const activeFilter = ref('')
const isLoading = ref(false)
const isSaving = ref(false)
const isDialogOpen = ref(false)
const editingId = ref<number | null>(null)
const mediaRef = useTemplateRef<InstanceType<typeof AdminProductMedia>>('mediaRef')

const emptyForm = (): AdminProductInput => ({
  name: '',
  slug: '',
  description: '',
  productType: 'CLOTHING',
  categoryId: 0,
  brand: '',
  season: '',
  material: '',
  basePrice: 0,
  oldPrice: undefined,
  purchaseCost: undefined,
  isActive: true,
  isNew: false,
  isHit: false,
  isSeasonal: false,
})

const form = reactive<AdminProductInput>(emptyForm())

const flatCategories = computed(() => categories.value.flatMap(category => [
  category,
  ...(category.children ?? []),
]))

async function loadProducts() {
  isLoading.value = true
  try {
    const response = await adminApi.products({
      search: search.value || undefined,
      isActive: activeFilter.value || undefined,
      page: page.value,
      limit: 20,
    })
    products.value = response.items
    totalCount.value = response.totalCount
    totalPages.value = response.totalPages
  } catch (error) {
    toast.error(getAdminError(error, 'Не вдалося завантажити товари'))
  } finally {
    isLoading.value = false
  }
}

const loadCategories = async () => (categories.value = await adminApi.categories())

function resetForm() {
  Object.assign(form, emptyForm())
  editingId.value = null
}

function openCreate() {
  resetForm()
  const firstCategory = flatCategories.value.find(category => category.isActive)
  if (firstCategory) {
    form.categoryId = firstCategory.id
    form.productType = firstCategory.productType ?? 'CLOTHING'
  }
  isDialogOpen.value = true
}

function openEdit(product: AdminProduct) {
  editingId.value = product.id
  Object.assign(form, {
    name: product.name,
    slug: product.slug,
    description: product.description ?? '',
    productType: product.productType,
    categoryId: product.categoryId,
    brand: product.brand ?? '',
    season: product.season ?? '',
    material: product.material ?? '',
    basePrice: product.basePrice,
    oldPrice: product.oldPrice ?? undefined,
    purchaseCost: product.purchaseCost ?? undefined,
    isActive: product.isActive,
    isNew: product.isNew,
    isHit: product.isHit,
    isSeasonal: product.isSeasonal,
  })
  isDialogOpen.value = true
}

function slugify(value: string) {
  const map: Record<string, string> = { а: 'a', б: 'b', в: 'v', г: 'h', ґ: 'g', д: 'd', е: 'e', є: 'ye', ж: 'zh', з: 'z', и: 'y', і: 'i', ї: 'yi', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'shch', ь: '', ю: 'yu', я: 'ya', ы: 'y', э: 'e', ё: 'yo', ъ: '' }
  return value.toLowerCase().split('').map(char => map[char] ?? char).join('').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function syncProductType() {
  const category = flatCategories.value.find(item => item.id === form.categoryId)
  if (category?.productType) form.productType = category.productType
}

async function saveProduct() {
  if (!form.name.trim() || !form.slug.trim() || !form.categoryId || form.basePrice < 0) {
    toast.error('Заповніть назву, slug, категорію та коректну ціну')
    return
  }

  isSaving.value = true
  try {
    const payload: AdminProductInput = {
      ...form,
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description?.trim() || undefined,
      brand: form.brand?.trim() || undefined,
      season: form.season?.trim() || undefined,
      material: form.material?.trim() || undefined,
      oldPrice: Number(form.oldPrice) || undefined,
      purchaseCost: Number(form.purchaseCost) || undefined,
      basePrice: Number(form.basePrice),
      categoryId: Number(form.categoryId),
    }

    const savedProduct = editingId.value
      ? await adminApi.updateProduct(editingId.value, payload)
      : await adminApi.createProduct(payload)

    const mediaOk = editingId.value || !mediaRef.value?.hasPending() || await mediaRef.value.uploadPending(savedProduct.id)
    toast[mediaOk ? 'success' : 'error'](mediaOk ? (editingId.value ? 'Товар оновлено' : 'Товар створено') : 'Товар створено, але частину медіа не вдалося додати')
    isDialogOpen.value = false
    await loadProducts()
  } catch (error) {
    toast.error(getAdminError(error, 'Не вдалося зберегти товар'))
  } finally {
    isSaving.value = false
  }
}

async function toggleActive(product: AdminProduct) {
  try {
    await adminApi.updateProduct(product.id, { isActive: !product.isActive })
    product.isActive = !product.isActive
    toast.success(product.isActive ? 'Товар активовано' : 'Товар приховано')
  } catch (error) {
    toast.error(getAdminError(error))
  }
}

async function removeProduct(product: AdminProduct) {
  if (!(await confirm({ title: `Видалити товар «${product.name}»?`, message: 'Цю дію не можна скасувати.', variant: 'danger', confirmText: 'Видалити' }))) return
  try {
    await adminApi.deleteProduct(product.id)
    toast.success('Товар видалено')
    await loadProducts()
  } catch (error) {
    toast.error(getAdminError(error, 'Не вдалося видалити товар'))
  }
}

async function applyFilters() { page.value = 1; await loadProducts() }
async function changePage(nextPage: number) { page.value = nextPage; await loadProducts() }

await Promise.all([loadProducts(), loadCategories()])
// Перехід із плаваючої «+» на сторінці товару: одразу відкриваємо форму нового товару
const route = useRoute()
if (route.query.create) { openCreate(); navigateTo({ query: {} }, { replace: true }) }
</script>

<template>
  <div class="mx-auto max-w-7xl space-y-6">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div><h1 class="text-2xl font-bold text-secondary-900 sm:text-3xl">Товари</h1><p class="mt-1 text-sm text-secondary-500">{{ totalCount }} позицій у каталозі</p></div>
      <BBtn class="max-lg:hidden" @click="openCreate">
        <Icon name="lucide:plus" size="18" /> Додати товар
      </BBtn>
    </div>

    <form class="grid gap-3 rounded-xl border border-secondary-200 bg-white p-4 sm:grid-cols-[1fr_180px_auto]" @submit.prevent="applyFilters">
      <BInput v-model="search" class="w-full" placeholder="Пошук за назвою, slug або SKU" />
      <BSelect v-model="activeFilter" class="w-full" :options="[{ label: 'Усі статуси', value: '' }, { label: 'Активні', value: 'true' }, { label: 'Приховані', value: 'false' }]" />
      <BBtn type="submit" variant="outline" class="w-full">Знайти</BBtn>
    </form>

    <div class="overflow-hidden rounded-xl border border-secondary-200 bg-white" :aria-busy="isLoading">
      <div v-if="isLoading && !products.length" class="p-10 text-center text-secondary-500">Завантаження товарів…</div>
      <div v-else class="loading-blur lg:overflow-x-auto">
        <table class="admin-table w-full lg:min-w-[900px] text-sm">
          <thead class="bg-secondary-50 text-left text-xs uppercase text-secondary-500"><tr><th class="px-5 py-3">Товар</th><th class="px-5 py-3">Категорія</th><th class="px-5 py-3">Ціна / собівартість</th><th class="px-5 py-3">Контент</th><th class="px-5 py-3">Статус</th><th class="px-5 py-3 text-right">Дії</th></tr></thead>
          <tbody class="divide-y divide-secondary-100">
            <tr v-for="product in products" :key="product.id" class="hover:bg-secondary-50/70">
              <td class="px-5 py-4" data-label="Товар"><div class="font-semibold text-secondary-900">{{ product.name }}</div><div class="mt-1 text-xs text-secondary-500">/{{ product.slug }}</div><div class="mt-2 flex gap-1"><span v-if="product.isNew" class="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] text-blue-700">NEW</span><span v-if="product.isHit" class="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] text-amber-700">HIT</span><span v-if="product.isSeasonal" class="rounded bg-violet-50 px-1.5 py-0.5 text-[10px] text-violet-700">SEASON</span></div></td>
              <td class="px-5 py-4 text-secondary-600" data-label="Категорія">{{ product.category?.name }}</td>
              <td class="px-5 py-4" data-label="Ціна / собівартість"><div class="font-semibold">{{ formatPrice(product.basePrice) }}</div><div class="text-xs text-secondary-500">Собівартість: {{ formatPrice(product.purchaseCost) }}</div></td>
              <td class="px-5 py-4 text-xs text-secondary-500" data-label="Контент">{{ product._count?.variants ?? 0 }} варіантів<br>{{ product._count?.media ?? 0 }} медіа</td>
              <td class="px-5 py-4" data-label="Статус"><button type="button" class="rounded-full px-2.5 py-1 text-xs font-medium" :class="product.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-secondary-100 text-secondary-600'" @click="toggleActive(product)">{{ product.isActive ? 'Активний' : 'Прихований' }}</button></td>
              <td class="px-5 py-4 admin-table__actions"><div class="flex justify-end gap-2"><NuxtLink :to="`/admin/products/${product.id}`" class="rounded-lg p-2 text-primary-700 hover:bg-primary-50" title="Варіанти та медіа"><Icon name="lucide:settings-2" size="17" /></NuxtLink><NuxtLink :to="`/product/${product.slug}`" target="_blank" class="rounded-lg p-2 text-secondary-500 hover:bg-secondary-100" title="Відкрити товар"><Icon name="lucide:external-link" size="17" /></NuxtLink><BBtn variant="icon" size="sm" title="Редагувати" @click="openEdit(product)"><Icon name="lucide:pencil" size="17" /></BBtn><BBtn variant="icon" size="sm" class="text-red-600" title="Видалити" @click="removeProduct(product)"><Icon name="lucide:trash-2" size="17" /></BBtn></div></td>
            </tr>
            <tr v-if="!products.length"><td colspan="6" class="px-5 py-12 text-center text-secondary-500">Товари не знайдені</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <BBtn class="fixed bottom-24 right-4 z-30 !size-14 !rounded-full !p-0 shadow-lg lg:hidden" aria-label="Додати" @click="openCreate"><Icon name="lucide:plus" size="24" /></BBtn>

    <BPagination v-if="totalPages > 1" :page="page" :total-pages="totalPages" @update:page="changePage" />

    <AdminDialog v-model="isDialogOpen" :title="editingId ? 'Редагувати товар' : 'Новий товар'" wide>
      <form class="grid gap-5 sm:grid-cols-2" @submit.prevent="saveProduct">
        <BInput v-model="form.name" label="Назва" required @blur="!editingId && !form.slug && (form.slug = slugify(form.name))" />
        <BInput v-model="form.slug" label="Slug" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required />
        <BSelect
          v-model="form.categoryId"
          label="Категорія"
          placeholder="Оберіть категорію"
          required
          :options="categories.flatMap(category => [{ label: category.name, value: category.id }, ...(category.children ?? []).map(child => ({ label: `— ${child.name}`, value: child.id }))])"
          @update:model-value="syncProductType"
        />
        <BSelect v-model="form.productType" label="Тип товару" :options="[{ label: 'Одяг', value: 'CLOTHING' }, { label: 'Взуття', value: 'SHOES' }, { label: 'Аксесуар', value: 'ACCESSORY' }]" />
        <BInput v-model.number="form.basePrice" type="number" label="Ціна" required />
        <BInput v-model.number="form.oldPrice" type="number" label="Стара ціна" />
        <BInput v-model.number="form.purchaseCost" type="number" label="Собівартість" />
        <BInput v-model="form.brand" label="Бренд" />
        <BInput v-model="form.season" label="Сезон" />
        <BInput v-model="form.material" label="Матеріал" />
        <BTextarea v-model="form.description" label="Опис" :rows="4" class="sm:col-span-2" />
        <AdminProductMedia ref="mediaRef" :product-id="editingId" class="sm:col-span-2" />
        <div class="flex flex-wrap gap-4 sm:col-span-2">
          <BCheckbox v-model="form.isActive" label="Активний" />
          <BCheckbox v-model="form.isNew" label="Новинка" />
          <BCheckbox v-model="form.isHit" label="Хіт" />
          <BCheckbox v-model="form.isSeasonal" label="Сезонний" />
        </div>
        <div class="flex justify-end gap-3 border-t border-secondary-200 pt-5 sm:col-span-2">
          <BBtn variant="outline" type="button" @click="isDialogOpen = false">Скасувати</BBtn>
          <BBtn type="submit" :loading="isSaving">Зберегти</BBtn>
        </div>
      </form>
    </AdminDialog>
  </div>
</template>
