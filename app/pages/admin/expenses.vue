<script setup lang="ts">
import AdminDialog from '~/modules/admin/components/AdminDialog.vue'
import { adminApi, getAdminError, type AdminExpense } from '~/modules/admin/adminApi'
import { useToast } from '~/modules/ui/composables/useToast'
import { useConfirm } from '~/modules/ui/composables/useConfirm'
import { rules, useFormValidation } from '~/modules/common/composables/useFormValidation'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const toast = useToast()
const { confirm } = useConfirm()
const expenses = ref<AdminExpense[]>([])
const totalCount = ref(0)
const isLoading = ref(false)
const isSaving = ref(false)
const isDialogOpen = ref(false)
const editingId = ref<number | null>(null)
const typeFilter = ref('')
const types: Record<ExpenseType, string> = { PURCHASE: 'Закупівля', LOGISTICS: 'Логістика', ADVERTISING: 'Реклама', PACKAGING: 'Пакування', SALARY: 'Зарплата', SERVICES: 'Послуги', RETURN: 'Повернення', OTHER: 'Інше' }

const form = reactive<CreateExpenseDto>({ title: '', type: 'OTHER', amount: 0, expenseDate: new Date().toISOString().slice(0, 10), note: '' })
const { errors, validate, touch, reset, applyServerErrors } = useFormValidation({
  title: [() => form.title, [rules.required('Вкажіть назву витрати')]],
  type: [() => form.type, [rules.required('Оберіть категорію')]],
  amount: [() => form.amount, [rules.required('Вкажіть суму'), rules.number(), rules.min(0.01, 'Сума має бути не менше 0.01')]],
  expenseDate: [() => form.expenseDate, [rules.required('Вкажіть дату')]],
})
const totalAmount = computed(() => expenses.value.reduce((sum, item) => sum + item.amount, 0))
const typeOptions = computed(() => (Object.entries(types) as [ExpenseType, string][]).map(([value, label]) => ({ value, label })))
const filterOptions = computed(() => [{ label: 'Усі витрати', value: '' }, ...typeOptions.value])
const columns = [
  { key: 'title', label: 'Витрата' },
  { key: 'type', label: 'Категорія' },
  { key: 'expenseDate', label: 'Дата' },
  { key: 'amount', label: 'Сума' },
  { key: 'actions', label: 'Дії', align: 'right' as const },
]

async function loadExpenses() {
  isLoading.value = true
  try {
    const response = await adminApi.expenses({ limit: 100, type: typeFilter.value || undefined })
    expenses.value = response.items
    totalCount.value = response.totalCount
  } catch (error) {
    toast.error(getAdminError(error, 'Не вдалося завантажити витрати'))
  } finally { isLoading.value = false }
}

function openCreate() {
  editingId.value = null
  Object.assign(form, { title: '', type: 'OTHER', amount: 0, expenseDate: new Date().toISOString().slice(0, 10), note: '' })
  reset()
  isDialogOpen.value = true
}

function openEdit(expense: AdminExpense) {
  editingId.value = expense.id
  Object.assign(form, { title: expense.title, type: expense.type, amount: expense.amount, expenseDate: expense.expenseDate.slice(0, 10), note: expense.note ?? '' })
  reset()
  isDialogOpen.value = true
}

async function saveExpense() {
  if (!validate()) return
  isSaving.value = true
  try {
    const payload = { ...form, title: form.title.trim(), amount: Number(form.amount), expenseDate: new Date(`${form.expenseDate}T12:00:00`).toISOString(), note: form.note?.trim() || undefined }
    if (editingId.value) { await adminApi.updateExpense(editingId.value, payload); toast.success('Витрату оновлено') }
    else { await adminApi.createExpense(payload); toast.success('Витрату додано') }
    isDialogOpen.value = false
    await loadExpenses()
  } catch (error) {
    const rest = applyServerErrors(error)
    if (rest.length || !Object.values(errors).some(Boolean)) toast.error(getAdminError(error, 'Не вдалося зберегти витрату'))
  }
  finally { isSaving.value = false }
}

async function removeExpense(expense: AdminExpense) {
  if (!(await confirm({ title: `Видалити витрату «${expense.title}»?`, message: 'Цю дію не можна скасувати.', variant: 'danger', confirmText: 'Видалити' }))) return
  try { await adminApi.deleteExpense(expense.id); toast.success('Витрату видалено'); await loadExpenses() }
  catch (error) { toast.error(getAdminError(error)) }
}

await loadExpenses()
</script>

<template>
  <div class="mx-auto max-w-6xl space-y-6">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-950 sm:text-3xl">Витрати</h1>
        <p class="mt-1 text-sm text-gray-500">Операційні витрати впливають на чистий прибуток у дашборді.</p>
      </div>
      <BBtn class="max-lg:hidden" @click="openCreate">Додати витрату</BBtn>
    </div>

    <section class="grid gap-4 sm:grid-cols-3">
      <article class="rounded-2xl border border-gray-200 bg-white p-5"><div class="text-sm text-gray-500">Записів у вибірці</div><div class="mt-2 text-2xl font-bold">{{ totalCount }}</div></article>
      <article class="rounded-2xl border border-gray-200 bg-white p-5"><div class="text-sm text-gray-500">Сума у вибірці</div><div class="mt-2 text-2xl font-bold text-red-600">{{ formatPrice(totalAmount) }}</div></article>
      <article class="rounded-2xl border border-gray-200 bg-white p-5">
        <BSelect v-model="typeFilter" label="Категорія" :options="filterOptions" @update:model-value="loadExpenses" />
      </article>
    </section>

    <div class="rounded-xl border border-secondary-200 bg-white p-2" :aria-busy="isLoading">
      <div v-if="isLoading && !expenses.length" class="p-10 text-center text-secondary-500">Завантаження…</div>
      <div v-else class="lg:overflow-x-auto">
        <table class="admin-table loading-blur w-full text-sm">
          <thead>
            <tr class="text-gray-500">
              <th v-for="column in columns" :key="column.key" class="whitespace-nowrap py-2 pr-4 font-medium" :class="column.align === 'right' ? 'text-right' : 'text-left'">{{ column.label }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in expenses" :key="row.id" class="border-t border-black/5">
              <td data-label="Витрата" class="py-2 pr-4">
                <div class="font-semibold">{{ row.title }}</div>
                <div class="text-xs text-gray-500">{{ row.note }}</div>
              </td>
              <td data-label="Категорія" class="py-2 pr-4">{{ types[row.type] }}</td>
              <td data-label="Дата" class="py-2 pr-4">{{ new Date(row.expenseDate).toLocaleDateString('uk-UA') }}</td>
              <td data-label="Сума" class="py-2 pr-4">
                <span class="font-semibold text-red-600">− {{ formatPrice(row.amount) }}</span>
              </td>
              <td class="admin-table__actions py-2 pr-4 text-right">
                <div class="flex justify-end gap-2">
                  <BBtn variant="icon" size="sm" aria-label="Редагувати" @click="openEdit(row)"><Icon name="lucide:pencil" size="17" /></BBtn>
                  <BBtn variant="icon" size="sm" class="text-red-600" aria-label="Видалити" @click="removeExpense(row)"><Icon name="lucide:trash-2" size="17" /></BBtn>
                </div>
              </td>
            </tr>
            <tr v-if="!expenses.length">
              <td :colspan="columns.length" class="py-6 text-center text-gray-400">Витрат ще немає</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <BBtn class="fixed bottom-24 right-4 z-30 !size-14 !rounded-full !p-0 shadow-lg lg:hidden" aria-label="Додати" @click="openCreate"><Icon name="lucide:plus" size="24" /></BBtn>

    <AdminDialog v-model="isDialogOpen" :title="editingId ? 'Редагувати витрату' : 'Нова витрата'">
      <form novalidate class="space-y-5" @submit.prevent="saveExpense">
        <BInput v-model="form.title" label="Назва" required :error="errors.title" @blur="touch('title')" />
        <div class="grid gap-4 sm:grid-cols-2">
          <BSelect v-model="form.type" label="Категорія" :options="typeOptions" required :error="errors.type" />
          <BInput v-model.number="form.amount" type="number" min="0.01" step="0.01" label="Сума" required :error="errors.amount" @blur="touch('amount')" />
        </div>
        <BInput v-model="form.expenseDate" type="date" label="Дата" required :error="errors.expenseDate" @blur="touch('expenseDate')" />
        <BTextarea v-model="form.note" label="Примітка" :rows="3" />
        <div class="flex justify-end gap-3 border-t border-gray-200 pt-5">
          <BBtn type="button" variant="outline" @click="isDialogOpen = false">Скасувати</BBtn>
          <BBtn type="submit" :loading="isSaving">Зберегти</BBtn>
        </div>
      </form>
    </AdminDialog>
  </div>
</template>
