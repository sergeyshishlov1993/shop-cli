<script setup lang="ts">
import { adminReturnsApi, getAdminError, type AdminReturnListItem } from '~/modules/admin/adminApi'
import { returnStatusLabels, returnStatusVariants, type ReturnStatus } from '~/modules/returns/returns'
import ReturnProgress from '~/modules/returns/components/ReturnProgress.vue'
import { useToast } from '~/modules/ui/composables/useToast'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Повернення', robots: 'noindex, nofollow' })

const toast = useToast()
const items = ref<AdminReturnListItem[]>([])
const totalCount = ref(0)
const loading = ref(false)
const filters = reactive({ status: '' as ReturnStatus | '', search: '', page: 1 })
const limit = 20
const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / limit)))

const statusOptions = [
  { label: 'Усі статуси', value: '' },
  ...(Object.keys(returnStatusLabels) as ReturnStatus[]).map(status => ({ label: returnStatusLabels[status], value: status })),
]

async function load() {
  loading.value = true
  try {
    const response = await adminReturnsApi.list({
      status: filters.status || undefined,
      search: filters.search.trim() || undefined,
      page: filters.page,
      limit,
    })
    items.value = response.items
    totalCount.value = response.totalCount
  }
  catch (error) {
    toast.error(getAdminError(error))
  }
  finally {
    loading.value = false
  }
}

const reloadFromFilters = useDebounceFn(() => {
  filters.page = 1
  load()
}, 350)
watch(() => [filters.status, filters.search], reloadFromFilters)
watch(() => filters.page, load)
onMounted(load)

const itemsCount = (item: AdminReturnListItem) => item.items.reduce((sum, line) => sum + line.quantity, 0)
</script>

<template>
  <div class="mx-auto max-w-7xl space-y-6">
    <div>
      <h1 class="text-2xl font-semibold text-secondary-900 sm:text-3xl">Повернення</h1>
      <p class="text-sm text-secondary-500">Заявки клієнтів на повернення товарів</p>
    </div>

    <div class="flex flex-col gap-3 sm:flex-row">
      <BInput v-model="filters.search" mode="search" placeholder="Номер, замовлення, телефон, імʼя" class="w-full sm:max-w-sm" />
      <BSelect v-model="filters.status" :options="statusOptions" class="w-full sm:w-64" />
    </div>

    <div :aria-busy="loading" class="rounded-xl border border-secondary-200 bg-white">
      <div v-if="loading && !items.length" class="flex justify-center py-16"><BSpinner size="lg" /></div>
      <p v-else-if="!items.length" class="py-16 text-center text-sm text-secondary-500">Заявок немає</p>
      <table v-else class="loading-blur admin-table w-full text-sm">
        <thead class="bg-secondary-50 text-left text-xs uppercase text-secondary-500">
          <tr>
            <th class="px-5 py-3">Номер</th>
            <th class="px-5 py-3">Дата</th>
            <th class="px-5 py-3">Клієнт</th>
            <th class="px-5 py-3">Замовлення</th>
            <th class="px-5 py-3">Товарів</th>
            <th class="px-5 py-3">Статус</th>
            <th class="px-5 py-3">Сума</th>
            <th class="px-5 py-3" />
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in items" :key="r.id" class="border-t border-secondary-200">
            <td class="px-5 py-4 font-medium" data-label="Номер">{{ r.number }}</td>
            <td class="px-5 py-4" data-label="Дата">{{ new Date(r.createdAt).toLocaleDateString('uk-UA') }}</td>
            <td class="px-5 py-4" data-label="Клієнт">
              <span class="block">{{ r.customer.name }}</span>
              <span class="text-xs text-secondary-500">{{ r.customer.phone }}</span>
            </td>
            <td class="px-5 py-4" data-label="Замовлення">№ {{ r.order.orderNumber }}</td>
            <td class="px-5 py-4" data-label="Товарів">{{ itemsCount(r) }}</td>
            <td class="px-5 py-4" data-label="Статус">
              <div class="flex min-w-36 flex-col items-end gap-2 lg:items-start">
                <BBadge :variant="returnStatusVariants[r.status]">{{ returnStatusLabels[r.status] }}</BBadge>
                <ReturnProgress :status="r.status" compact class="max-w-44" />
              </div>
            </td>
            <td class="px-5 py-4" data-label="Сума">{{ r.refundAmount ? formatPrice(r.refundAmount) : '—' }}</td>
            <td class="admin-table__actions px-5 py-4 text-right">
              <BBtn :to="`/admin/returns/${r.id}`" size="sm" variant="outline">Відкрити</BBtn>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <BPagination v-if="totalPages > 1" :page="filters.page" :total-pages="totalPages" @update:page="filters.page = $event" />
  </div>
</template>
