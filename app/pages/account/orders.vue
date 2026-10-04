<script setup lang="ts">
import { useAccountStore } from '~/modules/account/accountStore'
import { accountApi } from '~/modules/account/accountApi'
import ReturnThumb from '~/modules/returns/components/ReturnThumb.vue'
import NpTimeline from '~/modules/order/components/NpTimeline.vue'
definePageMeta({ layout: 'account', middleware: 'auth' })

const accountStore = useAccountStore()
const page = ref(1)
const route = useRoute()
const orderNumber = ref(typeof route.query.orderNumber === 'string' ? route.query.orderNumber : '')
const date = ref('')
const status = ref<OrderStatus | ''>('')
const selectedOrder = ref<Awaited<ReturnType<typeof accountApi.getOrder>> | null>(null)
const detailOpen = ref(false)
const loadingDetail = ref(false)
const trackingInfo = ref<Awaited<ReturnType<typeof accountApi.getOrderTracking>>>(null)
const trackingLoading = ref(false)
const reorderingId = ref<number | null>(null)
const toast = useToast()
const limit = 10
const totalPages = computed(() => Math.max(1, Math.ceil(accountStore.ordersTotalCount / limit)))

const statusLabels: Record<OrderStatus, string> = {
  NEW: 'Нове',
  PROCESSING: 'В обробці',
  SHIPPED: 'Відправлено',
  DELIVERED: 'Доставлено',
  CANCELLED: 'Скасовано',
  RETURNED: 'Повернено',
}

async function loadOrders() {
  await accountStore.fetchOrders({ page: page.value, limit, orderNumber: orderNumber.value || undefined, date: date.value || undefined, status: status.value || undefined })
}

async function applyFilters() { page.value = 1; await loadOrders() }
async function loadTracking(id:number){trackingLoading.value=true;try{trackingInfo.value=await accountApi.getOrderTracking(id);if(trackingInfo.value?.orderStatus&&selectedOrder.value)selectedOrder.value.status=trackingInfo.value.orderStatus}catch{trackingInfo.value=null}finally{trackingLoading.value=false}}
async function openOrder(id: number) { loadingDetail.value = true; detailOpen.value = true; trackingInfo.value=null; try { selectedOrder.value = await accountApi.getOrder(id); if(selectedOrder.value.trackingNumber)await loadTracking(id) } catch { toast.error('Не вдалося завантажити замовлення') } finally { loadingDetail.value = false } }
async function reorder(id: number) { reorderingId.value = id; try { const result = await accountApi.reorder(id); toast.success(`У кошик додано позицій: ${result.added.length}`); await navigateTo('/cart') } catch { toast.error('Не вдалося повторити замовлення') } finally { reorderingId.value = null } }

watch(page, loadOrders)
await useAsyncData('account-orders', async () => {
  await loadOrders()
  return true
})

useSeoMeta({ title: 'Мої замовлення', robots: 'noindex, nofollow' })
const returnsEnabled = useReturnsEnabled()
</script>

<template>
  <div class="store-page store-container py-6 lg:py-10">
    <h1 class="store-title mb-6 text-2xl lg:text-3xl">Мої замовлення</h1>

    <form class="grid gap-3 rounded-xl border border-secondary-200 p-4 md:grid-cols-[1fr_180px_200px_auto]" @submit.prevent="applyFilters">
      <BInput v-model="orderNumber" label="Номер замовлення" placeholder="ORD-…" />
      <BInput v-model="date" type="date" label="Дата" />
      <BSelect v-model="status" label="Статус" :options="[{label:'Усі статуси',value:''},...Object.entries(statusLabels).map(([value,label])=>({value,label}))]" />
      <BBtn type="submit" class="self-end">Знайти</BBtn>
    </form>

    <div v-if="accountStore.loading" class="flex justify-center py-20"><BSpinner size="lg" /></div>
    <BEmptyState v-else-if="!accountStore.orders.length" class="mt-8" title="Замовлень поки немає" description="Після покупки замовлення зʼявляться тут.">
      <template #action><BBtn to="/catalog" variant="primary">Перейти в каталог</BBtn></template>
    </BEmptyState>
    <div v-else class="mt-8 space-y-3">
      <article v-for="order in accountStore.orders" :key="order.id" class="glass rounded-xl p-4 sm:p-5">
        <div class="grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-center">
          <div>
            <h2 class="font-semibold text-secondary-900">№ {{ order.orderNumber }}</h2>
            <p class="mt-1 text-sm text-secondary-500">{{ new Date(order.date).toLocaleDateString('uk-UA') }} · {{ order.itemsCount }} товарів</p>
          </div>
          <BBadge :variant="order.status === 'DELIVERED' ? 'success' : order.status === 'CANCELLED' ? 'danger' : 'info'" class="justify-self-start">{{ statusLabels[order.status] }}</BBadge>
          <strong class="text-secondary-950">{{ formatPrice(order.total) }}</strong>
        </div>
        <ul v-if="order.items?.length" class="mt-4 flex gap-3 overflow-x-auto pb-1">
          <li v-for="item in order.items" :key="item.id" class="flex min-w-[180px] max-w-[240px] items-center gap-3">
            <ReturnThumb :image="item.image" :alt="item.productName" />
            <div class="min-w-0 text-sm">
              <p class="line-clamp-2 font-medium text-secondary-900">{{ item.productName }}</p>
              <p class="text-secondary-500">{{ [item.sizeName, `${item.quantity} шт.`].filter(Boolean).join(' · ') }}</p>
            </div>
          </li>
        </ul>
        <div class="mt-4 flex flex-wrap justify-end gap-2">
          <BBtn v-if="returnsEnabled && order.status === 'DELIVERED'" size="sm" variant="secondary" :to="`/account/returns/new?orderId=${order.id}`"><Icon name="lucide:undo-2" size="16" /> Оформити повернення</BBtn>
          <BBtn size="sm" variant="outline" @click="openOrder(order.id)">Деталі</BBtn>
        </div>
      </article>

      <BPagination v-if="totalPages > 1" :page="page" :total-pages="totalPages" class="pt-6" @update:page="page = $event" />
    </div>

    <BModal v-model="detailOpen" title="Деталі замовлення" size="lg">
      <div v-if="loadingDetail" class="flex justify-center py-12"><BSpinner /></div>
      <div v-else-if="selectedOrder" class="space-y-5"><div class="flex flex-wrap justify-between gap-3"><div><h2 class="font-semibold">№ {{ selectedOrder.orderNumber }}</h2><p class="text-sm text-secondary-500">{{ new Date(selectedOrder.createdAt).toLocaleString('uk-UA') }}</p></div><BBadge>{{ statusLabels[selectedOrder.status] }}</BBadge></div><div class="divide-y rounded-xl border"><div v-for="item in selectedOrder.items" :key="item.id" class="flex justify-between gap-4 p-4 text-sm"><div class="flex min-w-0 gap-3"><ReturnThumb :image="item.image" :alt="item.productName" /><div><b>{{ item.productName }}</b><p class="text-secondary-500">{{ item.sku }} · {{ item.sizeName || '—' }} · {{ item.colorName || '—' }} · {{ item.quantity }} шт.</p></div></div><strong>{{ formatPrice(item.lineRevenue) }}</strong></div></div><div class="grid gap-2 text-sm sm:grid-cols-2"><span>Доставка: {{ selectedOrder.deliveryProvider || '—' }}</span><span>Адреса: {{ [selectedOrder.city,selectedOrder.warehouse,selectedOrder.addressLine].filter(Boolean).join(', ') || '—' }}</span><span>ТТН: {{ selectedOrder.trackingNumber || 'ще не задана' }}</span><strong>Разом: {{ formatPrice(selectedOrder.totalAmount) }}</strong></div><div v-if="selectedOrder.trackingNumber" class="rounded-xl border border-primary-100 bg-primary-50 p-4"><div class="flex items-start gap-3"><Icon name="lucide:truck" class="mt-0.5 text-primary-700"/><div class="min-w-0"><h3 class="font-semibold">Посилка в дорозі</h3><p v-if="trackingLoading" class="mt-1 text-sm text-secondary-500">Оновлюємо статус Нової пошти…</p><template v-else-if="trackingInfo"><NpTimeline class="mt-3" v-bind="trackingInfo" /><p class="mt-2 text-xs text-secondary-500">ТТН {{trackingInfo.ttn}}</p></template><p v-else class="mt-1 text-sm text-secondary-500">ТТН збережена, але Нова пошта поки не повернула статус.</p></div></div></div><div><h3 class="mb-2 font-semibold">Історія статусів</h3><div v-for="history in selectedOrder.statusHistory" :key="history.id" class="border-l-2 border-secondary-200 py-1 pl-3 text-sm">{{ statusLabels[history.newStatus] }} · {{ new Date(history.createdAt).toLocaleString('uk-UA') }}<p v-if="history.note" class="text-secondary-500">{{ history.note }}</p></div></div></div>
      <template #footer><BBtn v-if="returnsEnabled && selectedOrder?.status === 'DELIVERED'" variant="secondary" :to="`/account/returns/new?orderId=${selectedOrder.id}`">Оформити повернення</BBtn><BBtn v-if="selectedOrder" :loading="reorderingId===selectedOrder.id" @click="reorder(selectedOrder.id)">Повторити замовлення</BBtn></template>
    </BModal>
  </div>
</template>
