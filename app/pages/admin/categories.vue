<script setup lang="ts">
import AdminDialog from '~/modules/admin/components/AdminDialog.vue'
import {
  adminApi,
  getAdminError,
  type AdminCategory,
  type AdminCategoryInput,
} from '~/modules/admin/adminApi'
import { useToast } from '~/modules/ui/composables/useToast'
import { useConfirm } from '~/modules/ui/composables/useConfirm'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const toast = useToast()
const { confirm } = useConfirm()
const categories = ref<AdminCategory[]>([])
const isLoading = ref(false)
const isSaving = ref(false)
const isDialogOpen = ref(false)
const editingId = ref<number | null>(null)
const sizeChartDialog = ref(false)
const sizeChartCategory = ref<AdminCategory | null>(null)
const sizeChartColumns = ref('Розмір;Груди (см);Талія (см);Стегна (см)')
const sizeChartRows = ref('S;84-88;64-68;90-94\nM;88-92;68-72;94-98')

const emptyForm = (): AdminCategoryInput => ({
  name: '',
  slug: '',
  parentId: null,
  productType: 'CLOTHING',
  isActive: true,
  sortOrder: 0,
  imageFileId: null,
  focalX: 0.5,
  focalY: 0.5,
  focalXTablet: 0.5,
  focalYTablet: 0.5,
  focalXMobile: 0.5,
  focalYMobile: 0.5,
})
const form = reactive(emptyForm()) as Required<AdminCategoryInput>
// Плитка категорії на десктопі/планшеті — 3:4, на телефоні — банер 375×464
const categoryRatios = { desktop: 3 / 4, tablet: 3 / 4, mobile: 375 / 464 }
const categoryImageUrl = computed(() => {
  const category = rows.value.find(item => item.id === editingId.value)
  return category?.imageFile ? getFileUrl(category.imageFile, 'medium') : ''
})
const parentIdSelect = computed({
  get: () => form.parentId ?? '',
  set: (value: string | number) => { form.parentId = value === '' ? null : Number(value) },
})

const rows = computed(() => categories.value.flatMap(category => [
  { ...category, level: 0 },
  ...(category.children ?? []).map(child => ({ ...child, level: 1 })),
]))

async function loadCategories() {
  isLoading.value = true
  try {
    categories.value = await adminApi.categories()
  } catch (error) {
    toast.error(getAdminError(error, 'Не вдалося завантажити категорії'))
  } finally {
    isLoading.value = false
  }
}

function openCreate(parentId: number | null = null) {
  editingId.value = null
  Object.assign(form, emptyForm(), { parentId })
  const parent = categories.value.find(category => category.id === parentId)
  if (parent?.productType) form.productType = parent.productType
  isDialogOpen.value = true
}

function openEdit(category: AdminCategory) {
  editingId.value = category.id
  Object.assign(form, {
    name: category.name,
    slug: category.slug,
    parentId: category.parentId,
    productType: category.productType ?? 'CLOTHING',
    isActive: category.isActive,
    sortOrder: category.sortOrder,
    imageFileId: category.imageFileId ?? null,
    focalX: category.focalX ?? 0.5,
    focalY: category.focalY ?? 0.5,
    focalXTablet: category.focalXTablet ?? 0.5,
    focalYTablet: category.focalYTablet ?? 0.5,
    focalXMobile: category.focalXMobile ?? 0.5,
    focalYMobile: category.focalYMobile ?? 0.5,
  })
  isDialogOpen.value = true
}

function slugify(value: string) {
  const map: Record<string, string> = { а: 'a', б: 'b', в: 'v', г: 'h', ґ: 'g', д: 'd', е: 'e', є: 'ye', ж: 'zh', з: 'z', и: 'y', і: 'i', ї: 'yi', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'shch', ь: '', ю: 'yu', я: 'ya', ы: 'y', э: 'e', ё: 'yo', ъ: '' }
  return value.toLowerCase().split('').map(char => map[char] ?? char).join('').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

async function saveCategory() {
  if (!form.name.trim() || !form.slug.trim()) {
    toast.error('Заповніть назву та slug')
    return
  }
  isSaving.value = true
  try {
    const payload: AdminCategoryInput = {
      ...form,
      name: form.name.trim(),
      slug: form.slug.trim(),
      parentId: form.parentId ? Number(form.parentId) : null,
      sortOrder: Number(form.sortOrder),
    }
    if (editingId.value) {
      await adminApi.updateCategory(editingId.value, payload)
      toast.success('Категорію оновлено')
    } else {
      await adminApi.createCategory(payload)
      toast.success('Категорію створено')
    }
    isDialogOpen.value = false
    await loadCategories()
  } catch (error) {
    toast.error(getAdminError(error, 'Не вдалося зберегти категорію'))
  } finally {
    isSaving.value = false
  }
}

async function toggleActive(category: AdminCategory) {
  try {
    await adminApi.updateCategory(category.id, { isActive: !category.isActive })
    category.isActive = !category.isActive
    toast.success(category.isActive ? 'Категорію активовано' : 'Категорію приховано')
  } catch (error) {
    toast.error(getAdminError(error))
  }
}

async function removeCategory(category: AdminCategory) {
  if (!(await confirm({ title: `Видалити категорію «${category.name}»?`, message: 'Цю дію не можна скасувати.', variant: 'danger', confirmText: 'Видалити' }))) return
  try {
    await adminApi.deleteCategory(category.id)
    toast.success('Категорію видалено')
    await loadCategories()
  } catch (error) {
    toast.error(getAdminError(error, 'Категорію з підкатегоріями або активними товарами видалити не можна'))
  }
}

async function openSizeChart(category: AdminCategory) {
  sizeChartCategory.value = category
  try {
    const chart = await adminApi.sizeChart(category.id)
    if (chart) {
      sizeChartColumns.value = chart.columns.join(';')
      sizeChartRows.value = chart.rows.map(row => row.join(';')).join('\n')
    }
  } catch {
    sizeChartColumns.value = 'Розмір;Груди (см);Талія (см);Стегна (см)'
    sizeChartRows.value = 'S;84-88;64-68;90-94\nM;88-92;68-72;94-98'
  }
  sizeChartDialog.value = true
}

async function saveSizeChart() {
  if (!sizeChartCategory.value) return
  const columns = sizeChartColumns.value.split(';').map(item => item.trim()).filter(Boolean)
  const rows = sizeChartRows.value.split('\n').map(line => line.split(';').map(item => item.trim())).filter(row => row.some(Boolean))
  try { await adminApi.upsertSizeChart(sizeChartCategory.value.id, { columns, rows }); sizeChartDialog.value = false; toast.success('Таблицю розмірів збережено') } catch (error) { toast.error(getAdminError(error)) }
}

await loadCategories()
</script>

<template>
  <div class="mx-auto max-w-6xl space-y-6">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div><h1 class="text-2xl font-bold text-secondary-900 sm:text-3xl">Категорії</h1><p class="mt-1 text-sm text-secondary-500">Структура каталогу та видимість розділів.</p></div>
      <BBtn class="max-lg:hidden" @click="openCreate()"><Icon name="lucide:plus" size="18" /> Додати категорію</BBtn>
    </div>

    <div class="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
      Категорії підтримують два рівні. Тип категорії визначає доступні розміри товарів: одяг, взуття або аксесуари.
    </div>

    <div class="overflow-hidden rounded-xl border border-secondary-200 bg-white" :aria-busy="isLoading">
      <div v-if="isLoading && !rows.length" class="p-10 text-center text-secondary-500">Завантаження категорій…</div>
      <div v-else class="loading-blur lg:overflow-x-auto">
        <table class="admin-table w-full lg:min-w-[760px] text-sm">
          <thead class="bg-secondary-50 text-left text-xs uppercase text-secondary-500"><tr><th class="px-5 py-3">Назва</th><th class="px-5 py-3">Slug</th><th class="px-5 py-3">Тип</th><th class="px-5 py-3">Порядок</th><th class="px-5 py-3">Статус</th><th class="px-5 py-3 text-right">Дії</th></tr></thead>
          <tbody class="divide-y divide-secondary-100">
            <tr v-for="category in rows" :key="category.id" class="hover:bg-secondary-50/70">
              <td class="px-5 py-4" data-label="Назва"><div class="flex items-center gap-2" :class="category.level ? 'pl-6' : 'font-semibold text-secondary-900'"><Icon v-if="category.level" name="lucide:corner-down-right" size="15" class="text-secondary-400" />{{ category.name }}</div></td>
              <td class="px-5 py-4 font-mono text-xs text-secondary-500" data-label="Slug">/{{ category.slug }}</td>
              <td class="px-5 py-4 text-secondary-600" data-label="Тип">{{ category.productType === 'CLOTHING' ? 'Одяг' : category.productType === 'SHOES' ? 'Взуття' : 'Аксесуари' }}</td>
              <td class="px-5 py-4 text-secondary-600" data-label="Порядок">{{ category.sortOrder }}</td>
              <td class="px-5 py-4" data-label="Статус"><button type="button" class="rounded-full px-2.5 py-1 text-xs font-medium" :class="category.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-secondary-100 text-secondary-600'" @click="toggleActive(category)">{{ category.isActive ? 'Активна' : 'Прихована' }}</button></td>
              <td class="px-5 py-4 admin-table__actions"><div class="flex justify-end gap-2"><BBtn variant="icon" size="sm" class="text-violet-700" title="Таблиця розмірів" @click="openSizeChart(category)"><Icon name="lucide:ruler" size="17" /></BBtn><BBtn v-if="!category.level" variant="icon" size="sm" class="text-primary-700" title="Додати підкатегорію" @click="openCreate(category.id)"><Icon name="lucide:folder-plus" size="17" /></BBtn><BBtn variant="icon" size="sm" title="Редагувати" @click="openEdit(category)"><Icon name="lucide:pencil" size="17" /></BBtn><BBtn variant="icon" size="sm" class="text-red-600" title="Видалити" @click="removeCategory(category)"><Icon name="lucide:trash-2" size="17" /></BBtn></div></td>
            </tr>
            <tr v-if="!rows.length"><td colspan="6" class="px-5 py-12 text-center text-secondary-500">Категорій ще немає</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <BBtn class="fixed bottom-24 right-4 z-30 !size-14 !rounded-full !p-0 shadow-lg lg:hidden" aria-label="Додати" @click="openCreate()"><Icon name="lucide:plus" size="24" /></BBtn>

    <AdminDialog v-model="isDialogOpen" :title="editingId ? 'Редагувати категорію' : 'Нова категорія'">
      <form class="space-y-5" @submit.prevent="saveCategory">
        <BInput v-model="form.name" label="Назва" required @blur="!editingId && !form.slug && (form.slug = slugify(form.name))" />
        <BInput v-model="form.slug" label="Slug" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required />
        <BSelect
          v-model="parentIdSelect"
          label="Батьківська категорія"
          :options="[{ label: 'Коренева категорія', value: '' }, ...categories.filter(item => item.id !== editingId).map(category => ({ label: category.name, value: category.id }))]"
        />
        <div class="grid gap-4 sm:grid-cols-2">
          <BSelect v-model="form.productType" label="Тип товарів" :options="[{ label: 'Одяг', value: 'CLOTHING' }, { label: 'Взуття', value: 'SHOES' }, { label: 'Аксесуари', value: 'ACCESSORY' }]" />
          <BInput v-model.number="form.sortOrder" type="number" label="Порядок" />
        </div>
        <BCheckbox v-model="form.isActive" label="Категорія активна і видима на вітрині" />
        <AdminImageFocalField :form="form" :current-url="categoryImageUrl" :ratios="categoryRatios" label="Фото категорії (плитка на головній)" />
        <div class="flex justify-end gap-3 border-t border-secondary-200 pt-5">
          <BBtn variant="outline" type="button" @click="isDialogOpen = false">Скасувати</BBtn>
          <BBtn type="submit" :loading="isSaving">Зберегти</BBtn>
        </div>
      </form>
    </AdminDialog>
    <AdminDialog v-model="sizeChartDialog" :title="`Таблиця розмірів: ${sizeChartCategory?.name || ''}`" wide>
      <div class="space-y-4"><p class="text-sm text-gray-500">Колонки та значення розділяйте крапкою з комою; кожен розмір — з нового рядка.</p><BInput v-model="sizeChartColumns" label="Колонки" /><BTextarea v-model="sizeChartRows" label="Рядки" :rows="8" /><div class="flex justify-end"><BBtn @click="saveSizeChart">Зберегти таблицю</BBtn></div></div>
    </AdminDialog>
  </div>
</template>
