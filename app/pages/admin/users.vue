<script setup lang="ts">
import { adminApi, getAdminError, type AdminUser } from '~/modules/admin/adminApi'
import AdminDialog from '~/modules/admin/components/AdminDialog.vue'
import { rules, useFormValidation } from '~/modules/common/composables/useFormValidation'
definePageMeta({ layout: 'admin', middleware: 'admin' })
const toast = useToast(); const users = ref<AdminUser[]>([]); const search = ref(''); const role = ref(''); const active = ref(''); const total = ref(0); const dialog = ref(false); const selected = ref<AdminUser | null>(null)
const form = reactive({ firstName: '', lastName: '', phone: '', role: 'USER' as 'USER' | 'ADMIN', isActive: true, personalDiscountPercent: 0 })
const { errors, validate, touch, reset, applyServerErrors } = useFormValidation({
  personalDiscountPercent: [() => form.personalDiscountPercent, [rules.required('Вкажіть знижку'), rules.number(), rules.min(0), rules.max(100)]],
})
const roleOptions = [{ label: 'Усі ролі', value: '' }, { label: 'Користувачі', value: 'USER' }, { label: 'Адміністратори', value: 'ADMIN' }]
const activeOptions = [{ label: 'Усі статуси', value: '' }, { label: 'Активні', value: 'true' }, { label: 'Заблоковані', value: 'false' }]
const columns = [
  { key: 'client', label: 'Клієнт' },
  { key: 'role', label: 'Роль' },
  { key: 'ordersCount', label: 'Замовлення' },
  { key: 'totalSpent', label: 'Витрачено' },
  { key: 'personalDiscountPercent', label: 'Знижка' },
  { key: 'status', label: 'Статус' },
  { key: 'actions', label: '', align: 'right' as const },
]
async function load() { try { const r = await adminApi.users({ search: search.value || undefined, role: role.value || undefined, isActive: active.value === '' ? undefined : active.value === 'true', limit: 100 }); users.value = r.items; total.value = r.totalCount } catch (e) { toast.error(getAdminError(e)) } }
async function open(user: AdminUser) { selected.value = await adminApi.user(user.id); Object.assign(form, { firstName: selected.value.firstName || '', lastName: selected.value.lastName || '', phone: selected.value.phone || '', role: selected.value.role, isActive: selected.value.isActive, personalDiscountPercent: selected.value.personalDiscountPercent }); reset(); dialog.value = true }
async function save() { if (!selected.value || !validate()) return; try { await adminApi.updateUser(selected.value.id, form); dialog.value = false; await load(); toast.success('Користувача оновлено') } catch (e) { const rest = applyServerErrors(e); if (rest.length || !Object.values(errors).some(Boolean)) toast.error(getAdminError(e)) } }
await load()
</script>

<template>
  <div class="mx-auto max-w-7xl space-y-6">
    <div>
      <h1 class="text-3xl font-bold">Користувачі</h1>
      <p class="mt-1 text-sm text-secondary-500">{{ total }} клієнтів: ролі, блокування, персональні знижки та статистика.</p>
    </div>

    <form novalidate class="grid gap-3 rounded-xl border border-secondary-200 bg-white p-4 md:grid-cols-[1fr_170px_170px_auto]" @submit.prevent="load">
      <BInput v-model="search" class="w-full" placeholder="Email, ім’я або телефон" />
      <BSelect v-model="role" class="w-full" :options="roleOptions" />
      <BSelect v-model="active" class="w-full" :options="activeOptions" />
      <BBtn type="submit" class="w-full">Знайти</BBtn>
    </form>

    <div class="rounded-xl border border-secondary-200 bg-white p-2">
      <BTable :columns="columns" :rows="users" row-key="id" empty="Користувачів не знайдено">
        <template #cell-client="{ row }">
          <b>{{ [row.firstName, row.lastName].filter(Boolean).join(' ') || 'Без імені' }}</b>
          <div class="text-xs text-secondary-500">{{ row.email }} · {{ row.phone || 'без телефону' }}</div>
        </template>
        <template #cell-totalSpent="{ row }">{{ formatPrice(row.totalSpent) }}</template>
        <template #cell-personalDiscountPercent="{ row }">{{ row.personalDiscountPercent }}%</template>
        <template #cell-status="{ row }">{{ row.isActive ? 'Активний' : 'Заблокований' }}</template>
        <template #cell-actions="{ row }">
          <BBtn variant="icon" size="sm" @click="open(row)"><Icon name="lucide:pencil" /></BBtn>
        </template>
      </BTable>
    </div>

    <AdminDialog v-model="dialog" title="Користувач" wide>
      <div class="grid gap-6 lg:grid-cols-2">
        <form novalidate class="space-y-4" @submit.prevent="save">
          <BInput v-model="form.firstName" label="Ім’я" />
          <BInput v-model="form.lastName" label="Прізвище" />
          <BPhoneInput v-model="form.phone" label="Телефон" />
          <BSelect v-model="form.role" label="Роль" :options="[{ label: 'Користувач', value: 'USER' }, { label: 'Адміністратор', value: 'ADMIN' }]" />
          <BInput v-model.number="form.personalDiscountPercent" type="number" min="0" max="100" label="Персональна знижка, %" required :error="errors.personalDiscountPercent" @blur="touch('personalDiscountPercent')" />
          <BCheckbox v-model="form.isActive" label="Активний акаунт" />
          <BBtn type="submit">Зберегти</BBtn>
        </form>
        <div class="space-y-4">
          <div class="grid grid-cols-3 gap-2">
            <div class="rounded-xl bg-secondary-50 p-3"><small>Замовлень</small><strong class="block text-xl">{{ selected?.ordersCount }}</strong></div>
            <div class="rounded-xl bg-secondary-50 p-3"><small>Витрачено</small><strong class="block">{{ formatPrice(selected?.totalSpent || 0) }}</strong></div>
            <div class="rounded-xl bg-secondary-50 p-3"><small>Середній чек</small><strong class="block">{{ formatPrice(selected?.averageOrderAmount || 0) }}</strong></div>
          </div>
          <h3 class="font-semibold">Останні замовлення</h3>
          <div v-for="order in selected?.orders" :key="order.id" class="flex justify-between border-b py-2 text-sm"><span>{{ order.orderNumber }}</span><b>{{ formatPrice(order.totalAmount) }}</b></div>
          <h3 class="font-semibold">Адреси доставки: {{ selected?.deliveryProfiles?.length || 0 }}</h3>
        </div>
      </div>
    </AdminDialog>
  </div>
</template>
