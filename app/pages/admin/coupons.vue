<script setup lang="ts">
import { adminApi, getAdminError, type AdminCoupon, type CreateCouponDto } from '~/modules/admin/adminApi'
import AdminDialog from '~/modules/admin/components/AdminDialog.vue'
import { useConfirm } from '~/modules/ui/composables/useConfirm'

const { confirm } = useConfirm()

definePageMeta({ layout: 'admin', middleware: 'admin' })

const toast = useToast()
const loading = ref(true)
const coupons = ref<AdminCoupon[]>([])
const dialog = ref(false)
const editId = ref<number | null>(null)
const form = reactive<CreateCouponDto>({ code: '', discountType: 'PERCENT', discountValue: 10, minSubtotal: undefined, maxUses: undefined, isActive: true })

const typeOptions = [
  { label: 'Відсоток (%)', value: 'PERCENT' },
  { label: 'Фіксована сума', value: 'FIXED' },
]

const columns = [
  { key: 'code', label: 'Код' },
  { key: 'discount', label: 'Знижка' },
  { key: 'minSubtotal', label: 'Мін. сума' },
  { key: 'used', label: 'Використано' },
  { key: 'isActive', label: 'Активний' },
  { key: 'actions', label: '', align: 'right' as const },
]

async function load() {
  loading.value = true
  try {
    coupons.value = await adminApi.coupons()
  }
  catch (e) {
    toast.error(getAdminError(e))
  }
  finally {
    loading.value = false
  }
}

function edit(item?: AdminCoupon) {
  editId.value = item?.id ?? null
  Object.assign(form, item
    ? { code: item.code, discountType: item.discountType, discountValue: item.discountValue, minSubtotal: item.minSubtotal ?? undefined, maxUses: item.maxUses ?? undefined, isActive: item.isActive }
    : { code: '', discountType: 'PERCENT', discountValue: 10, minSubtotal: undefined, maxUses: undefined, isActive: true })
  dialog.value = true
}

async function save() {
  try {
    if (editId.value) await adminApi.updateCoupon(editId.value, form)
    else await adminApi.createCoupon(form)
    dialog.value = false
    await load()
  }
  catch (e) {
    toast.error(getAdminError(e))
  }
}

async function remove(item: AdminCoupon) {
  if (!(await confirm({ title: `Видалити промокод ${item.code}?`, message: 'Цю дію не можна скасувати.', variant: 'danger', confirmText: 'Видалити' }))) return
  try {
    await adminApi.deleteCoupon(item.id)
    await load()
  }
  catch (e) {
    toast.error(getAdminError(e))
  }
}

onMounted(load)
</script>

<template>
  <div class="p-4">
    <div class="mb-4 flex items-center justify-between">
      <h1 class="text-xl font-semibold">Промокоди</h1>
      <BBtn class="max-lg:hidden" @click="edit()">Новий промокод</BBtn>
    </div>

    <BBtn class="fixed bottom-24 right-4 z-30 !size-14 !rounded-full !p-0 shadow-lg lg:hidden" aria-label="Додати" @click="edit()"><Icon name="lucide:plus" size="24" /></BBtn>

    <BSpinner v-if="loading" />
    <BTable v-else :columns="columns" :rows="coupons" row-key="id" empty="Промокодів ще немає">
      <template #cell-code="{ row }">
        <span class="font-medium">{{ row.code }}</span>
      </template>
      <template #cell-discount="{ row }">
        {{ row.discountType === 'PERCENT' ? `${row.discountValue}%` : row.discountValue }}
      </template>
      <template #cell-minSubtotal="{ row }">
        {{ row.minSubtotal ?? '—' }}
      </template>
      <template #cell-used="{ row }">
        {{ row.usedCount }}{{ row.maxUses ? ` / ${row.maxUses}` : '' }}
      </template>
      <template #cell-isActive="{ row }">
        {{ row.isActive ? 'так' : 'ні' }}
      </template>
      <template #cell-actions="{ row }">
        <BBtn variant="ghost" size="sm" @click="edit(row)">Змінити</BBtn>
        <BBtn variant="ghost" size="sm" class="text-red-600" @click="remove(row)">Видалити</BBtn>
      </template>
    </BTable>

    <AdminDialog v-model="dialog" :title="editId ? 'Редагувати промокод' : 'Новий промокод'">
      <form class="grid gap-4 sm:grid-cols-2" @submit.prevent="save">
        <BInput v-model="form.code" label="Код" required />
        <BSelect v-model="form.discountType" label="Тип знижки" :options="typeOptions" />
        <BInput v-model.number="form.discountValue" type="number" label="Значення" required />
        <BInput v-model.number="form.minSubtotal" type="number" label="Мін. сума замовлення" />
        <BInput v-model.number="form.maxUses" type="number" label="Ліміт використань" />
        <BCheckbox v-model="form.isActive" label="Активний" />
        <div class="flex justify-end sm:col-span-2">
          <BBtn type="submit">Зберегти</BBtn>
        </div>
      </form>
    </AdminDialog>
  </div>
</template>
