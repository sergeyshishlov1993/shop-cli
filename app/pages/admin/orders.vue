<script setup lang="ts">
import { adminApi, getAdminError, type AdminOrder, type AdminOrderStatus, type AdminTrackingInfo } from '~/modules/admin/adminApi'
import AdminDialog from '~/modules/admin/components/AdminDialog.vue'
import { useToast } from '~/modules/ui/composables/useToast'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const toast = useToast()
const orders = ref<AdminOrder[]>([])
const search = ref('')
const statusFilter = ref('')
const isLoading = ref(false)
const totalCount = ref(0)
const page = ref(1)
const totalPages = ref(1)
const dateFrom = ref('')
const dateTo = ref('')
const orderDialog = ref(false)
const selectedOrder = ref<AdminOrder | null>(null)
const orderForm = reactive({ internalComment: '', trackingNumber: '' })
const tracking = ref<AdminTrackingInfo | null>(null)
const trackingLoading = ref(false)
const ttnLoading = ref(false)
async function createTtn() {
  if (!selectedOrder.value) return
  ttnLoading.value = true
  try {
    selectedOrder.value = await adminApi.createTtn(selectedOrder.value.id)
    orderForm.trackingNumber = String(selectedOrder.value.trackingNumber || '')
    toast.success('ТТН створено')
    await loadOrders()
  }
  catch (error) {
    toast.error(getAdminError(error))
  }
  finally {
    ttnLoading.value = false
  }
}

const labels: Record<AdminOrderStatus, string> = { NEW: 'Нове', PROCESSING: 'В роботі', SHIPPED: 'Відправлено', DELIVERED: 'Доставлено', CANCELLED: 'Скасовано', RETURNED: 'Повернення' }
const colors: Record<AdminOrderStatus, string> = { NEW: 'bg-blue-50 text-blue-700', PROCESSING: 'bg-amber-50 text-amber-700', SHIPPED: 'bg-violet-50 text-violet-700', DELIVERED: 'bg-emerald-50 text-emerald-700', CANCELLED: 'bg-red-50 text-red-700', RETURNED: 'bg-gray-100 text-gray-700' }
const transitions: Record<AdminOrderStatus, AdminOrderStatus[]> = { NEW: ['PROCESSING', 'CANCELLED'], PROCESSING: ['SHIPPED', 'CANCELLED'], SHIPPED: ['DELIVERED', 'RETURNED'], DELIVERED: ['RETURNED'], CANCELLED: [], RETURNED: [] }

async function loadOrders() {
  isLoading.value = true
  try {
    const response = await adminApi.orders({ search: search.value || undefined, status: statusFilter.value || undefined, page: page.value, limit: 20, dateFrom: dateFrom.value || undefined, dateTo: dateTo.value || undefined })
    orders.value = response.items
    totalCount.value = response.totalCount
    totalPages.value = response.totalPages
  } catch (error) {
    toast.error(getAdminError(error, 'Не вдалося завантажити замовлення'))
  } finally {
    isLoading.value = false
  }
}

async function openOrder(id: number) {
  try { selectedOrder.value = await adminApi.order(id); Object.assign(orderForm, { internalComment: String(selectedOrder.value.internalComment || ''), trackingNumber: String(selectedOrder.value.trackingNumber || '') }); tracking.value = null; orderDialog.value = true } catch (error) { toast.error(getAdminError(error)) }
}

async function saveOrder() {
  if (!selectedOrder.value) return
  try { selectedOrder.value = await adminApi.updateOrder(selectedOrder.value.id, { internalComment: orderForm.internalComment, trackingNumber: orderForm.trackingNumber.trim() }); toast.success('Замовлення оновлено'); await loadOrders() } catch (error) { toast.error(getAdminError(error)) }
}

async function loadTracking() {
  if (!selectedOrder.value) return
  if (!orderForm.trackingNumber.trim()) return
  trackingLoading.value = true
  try {
    selectedOrder.value = await adminApi.updateOrder(selectedOrder.value.id, { internalComment: orderForm.internalComment, trackingNumber: orderForm.trackingNumber.trim() })
    tracking.value = await adminApi.orderTracking(selectedOrder.value.id)
    if (!tracking.value) toast.error('Нова пошта не повернула дані за цією ТТН')
    else if (tracking.value.statusChanged) { toast.success(`Статус замовлення змінено: ${labels[tracking.value.orderStatus!]}`); await loadOrders() }
  } catch (error) { toast.error(getAdminError(error, 'Не вдалося отримати трекінг')) } finally { trackingLoading.value = false }
}

async function changeStatus(order: AdminOrder, newStatus: AdminOrderStatus) {
  if (!newStatus || newStatus === order.status) return
  try {
    const updated = await adminApi.updateOrderStatus(order.id, newStatus)
    order.status = updated.status
    toast.success(`Статус ${order.orderNumber} оновлено`)
  } catch (error) {
    toast.error(getAdminError(error, 'Недопустимий перехід статусу'))
  }
}

const statusFilterOptions = computed(() => [{ label: 'Усі статуси', value: '' }, ...Object.entries(labels).map(([value, label]) => ({ label, value }))])
function transitionOptions(order: AdminOrder) {
  return [{ label: 'Змінити статус', value: order.status }, ...transitions[order.status].map(status => ({ label: labels[status], value: status }))]
}

async function applyFilters() { page.value = 1; await loadOrders() }
async function changePage(value: number) { page.value = value; await loadOrders() }

await loadOrders()
</script>

<template>
  <div class="mx-auto max-w-7xl space-y-6">
    <div><h1 class="text-2xl font-bold text-secondary-900 sm:text-3xl">Замовлення</h1><p class="mt-1 text-sm text-secondary-500">{{ totalCount }} замовлень, керування статусами та виконанням.</p></div>
    <form class="grid gap-3 rounded-xl border border-secondary-200 bg-white p-4 md:grid-cols-5" @submit.prevent="applyFilters">
      <BInput v-model="search" class="w-full" placeholder="Номер, клієнт або телефон" />
      <BSelect v-model="statusFilter" class="w-full" :options="statusFilterOptions" />
      <BInput v-model="dateFrom" class="w-full" type="date" title="Дата від" />
      <BInput v-model="dateTo" class="w-full" type="date" title="Дата до" />
      <BBtn type="submit" variant="outline" class="w-full">Знайти</BBtn>
    </form>
    <div class="overflow-hidden rounded-xl border border-secondary-200 bg-white" :aria-busy="isLoading">
      <div v-if="isLoading && !orders.length" class="p-10 text-center text-secondary-500">Завантаження замовлень…</div>
      <div v-else class="loading-blur lg:overflow-x-auto">
        <table class="admin-table w-full lg:min-w-[850px] text-sm">
          <thead class="bg-secondary-50 text-left text-xs uppercase text-secondary-500"><tr><th class="px-5 py-3">Замовлення</th><th class="px-5 py-3">Клієнт</th><th class="px-5 py-3">Дата</th><th class="px-5 py-3">Сума</th><th class="px-5 py-3">Статус / наступна дія</th><th class="px-5 py-3"></th></tr></thead>
          <tbody class="divide-y divide-secondary-100">
            <tr v-for="order in orders" :key="order.id">
              <td class="px-5 py-4 font-semibold text-secondary-900" data-label="Замовлення">{{ order.orderNumber }}</td>
              <td class="px-5 py-4" data-label="Клієнт"><div>{{ order.customerName }}</div><div class="text-xs text-secondary-500">{{ order.customerPhone }}</div></td>
              <td class="px-5 py-4 text-secondary-600" data-label="Дата">{{ new Date(order.createdAt).toLocaleString('uk-UA') }}</td>
              <td class="px-5 py-4 font-semibold" data-label="Сума">{{ formatPrice(order.totalAmount) }}</td>
              <td class="px-5 py-4" data-label="Статус / наступна дія">
                <div class="flex items-center gap-3">
                  <span class="rounded-full px-2.5 py-1 text-xs font-medium" :class="colors[order.status]">{{ labels[order.status] }}</span>
                  <BSelect
                    v-if="transitions[order.status].length"
                    class="w-40"
                    :model-value="order.status"
                    :options="transitionOptions(order)"
                    @update:model-value="value => changeStatus(order, value as AdminOrderStatus)"
                  />
                </div>
              </td>
              <td class="px-5 py-4 admin-table__actions"><BBtn variant="icon" size="sm" title="Деталі" @click="openOrder(order.id)"><Icon name="lucide:eye" /></BBtn></td>
            </tr>
            <tr v-if="!orders.length"><td colspan="6" class="px-5 py-12 text-center text-secondary-500">Замовлень не знайдено</td></tr>
          </tbody>
        </table>
      </div>
    </div>
    <BPagination v-if="totalPages > 1" :page="page" :total-pages="totalPages" @update:page="changePage" />
    <AdminDialog v-model="orderDialog" :title="`Замовлення ${selectedOrder?.orderNumber || ''}`" wide>
      <div v-if="selectedOrder" class="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,.8fr)]">
        <div class="space-y-5">
          <div><h3 class="font-semibold">Клієнт і доставка</h3><div class="mt-2 rounded-xl bg-secondary-50 p-4 text-sm"><p class="font-medium">{{ selectedOrder.customerName }} · {{ selectedOrder.customerPhone }}</p><p class="text-secondary-500">{{ selectedOrder.customerEmail || 'Без email' }}</p><p class="mt-2">{{ [selectedOrder.city,selectedOrder.warehouse,selectedOrder.addressLine].filter(Boolean).join(', ') || 'Адресу не вказано' }}</p></div></div>
          <div><div class="mb-2 flex items-center justify-between"><h3 class="font-semibold">Позиції</h3><span class="text-xs text-secondary-500">{{selectedOrder.items?.length||0}} позицій</span></div><div class="overflow-hidden rounded-xl border border-secondary-200"><div v-for="item in selectedOrder.items" :key="item.id" class="grid gap-3 border-b border-secondary-100 p-4 text-sm last:border-0 sm:grid-cols-[1fr_auto]"><div><p class="font-semibold text-secondary-900">{{item.productName}}</p><p class="mt-1 text-xs text-secondary-500">{{item.sku}} · {{item.sizeName||'Без розміру'}} · {{item.colorName||'Без кольору'}}</p><p class="mt-1 text-xs text-secondary-500">{{formatPrice(item.salePrice)}} × {{item.quantity}} шт.</p></div><div class="text-right"><p class="font-semibold">{{formatPrice(item.lineRevenue)}}</p><p class="mt-1 text-xs text-secondary-500">Собівартість {{formatPrice(item.lineCost)}}</p><p class="text-xs text-emerald-700">Прибуток {{formatPrice(item.lineProfit)}}</p></div></div></div></div>
        </div>
        <form class="space-y-4" @submit.prevent="saveOrder">
          <div class="rounded-xl border border-secondary-200 p-4"><h3 class="mb-3 font-semibold">Доставка Новою поштою</h3><BInput v-model="orderForm.trackingNumber" label="Номер ТТН" placeholder="Введіть номер накладної"/><div class="mt-3 flex flex-wrap gap-2"><BBtn type="button" variant="outline" :disabled="!orderForm.trackingNumber.trim()" :loading="trackingLoading" @click="loadTracking">Зберегти ТТН і перевірити</BBtn><BBtn v-if="!orderForm.trackingNumber.trim()" type="button" :loading="ttnLoading" @click="createTtn">Створити ТТН</BBtn></div><div v-if="tracking" class="mt-4 rounded-xl bg-violet-50 p-4"><div class="flex items-start gap-3"><Icon name="lucide:truck" class="mt-0.5 text-violet-700"/><div><p class="font-semibold text-violet-950">{{tracking.statusDescription}}</p><p class="mt-1 text-xs text-violet-700">ТТН {{tracking.ttn}} · код НП {{tracking.statusCode}}</p><p v-if="tracking.statusChanged" class="mt-2 text-xs font-medium text-emerald-700">Статус замовлення оновлено автоматично</p></div></div></div></div>
          <BTextarea v-model="orderForm.internalComment" label="Внутрішній коментар" :rows="5"/>
          <div class="flex justify-end"><BBtn type="submit">Зберегти замовлення</BBtn></div>
        </form>
      </div>
    </AdminDialog>
  </div>
</template>
