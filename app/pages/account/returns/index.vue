<script setup lang="ts">
import ReturnProgress from '~/modules/returns/components/ReturnProgress.vue'
import { returnsApi, returnStatusLabels, returnStatusVariants, returnReasonLabels } from '~/modules/returns/returns'
import ReturnThumb from '~/modules/returns/components/ReturnThumb.vue'
import { accountApi } from '~/modules/account/accountApi'
import { useSettingsStore } from '~/modules/settings/settingsStore'

definePageMeta({ layout: 'account', middleware: ['auth', 'returns-enabled'] })
useSeoMeta({ title: 'Мої повернення', robots: 'noindex, nofollow' })

const { data: returns, status } = await useAsyncData('account-returns', () => returnsApi.list(), { default: () => [] })

// «Оформити повернення»: вибір доставленого замовлення → форма нової заявки
const settingsStore = useSettingsStore()
const windowDays = computed(() => settingsStore.settings?.returnWindowDays ?? 14)
const isPickerOpen = ref(false)
const deliveredOrders = ref<AccountOrderSummary[]>([])
const loadingOrders = ref(false)
async function openPicker() {
  isPickerOpen.value = true
  loadingOrders.value = true
  try {
    const response = await accountApi.getOrders({ page: 1, limit: 50, status: 'DELIVERED' })
    deliveredOrders.value = response.items.filter(order => order.status === 'DELIVERED')
  }
  finally {
    loadingOrders.value = false
  }
}
</script>

<template>
  <div class="store-page store-container py-6 lg:py-10">
    <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 class="store-title text-2xl lg:text-3xl">Мої повернення</h1>
      <BBtn variant="primary" @click="openPicker"><Icon name="lucide:undo-2" size="16" /> Оформити повернення</BBtn>
    </div>

    <!-- Як це працює -->
    <ol class="mb-6 grid gap-2 text-sm text-secondary-600 sm:grid-cols-4">
      <li v-for="(step, i) in ['Оберіть доставлене замовлення й товари', 'Менеджер розгляне заявку', 'Відправте посилку й вкажіть ТТН', 'Отримайте гроші на картку']" :key="step" class="flex items-start gap-2 rounded-xl border border-secondary-200 p-3">
        <span class="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-800">{{ i + 1 }}</span>
        {{ step }}
      </li>
    </ol>

    <BModal v-model="isPickerOpen" title="Оберіть замовлення" size="sm">
      <p class="mb-3 text-sm text-secondary-500">Повернути можна доставлене замовлення протягом {{ windowDays }} днів після отримання.</p>
      <div v-if="loadingOrders" class="flex justify-center py-8"><BSpinner /></div>
      <p v-else-if="!deliveredOrders.length" class="py-6 text-center text-sm text-secondary-500">Доставлених замовлень немає</p>
      <ul v-else class="divide-y divide-secondary-200">
        <li v-for="order in deliveredOrders" :key="order.id">
          <NuxtLink :to="`/account/returns/new?orderId=${order.id}`" class="flex items-center justify-between gap-3 py-3 transition-colors hover:text-primary-700">
            <span>
              <span class="block font-medium">№ {{ order.orderNumber }}</span>
              <span class="text-xs text-secondary-500">{{ new Date(order.createdAt).toLocaleDateString('uk-UA') }} · {{ formatPrice(order.totalAmount) }}</span>
            </span>
            <Icon name="lucide:chevron-right" size="18" />
          </NuxtLink>
        </li>
      </ul>
    </BModal>

    <div v-if="status === 'pending'" class="flex justify-center py-20"><BSpinner size="lg" /></div>
    <BEmptyState v-else-if="!returns.length" title="Заявок на повернення немає" description="Натисніть «Оформити повернення» і оберіть доставлене замовлення.">
      <template #action><BBtn variant="primary" @click="openPicker">Оформити повернення</BBtn></template>
    </BEmptyState>
    <div v-else class="space-y-3">
      <article v-for="item in returns" :key="item.id" class="glass relative rounded-xl p-4 sm:p-5">
        <div class="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 class="font-semibold text-secondary-900"><NuxtLink :to="`/account/returns/${item.id}`" class="hover:text-primary-700">{{ item.number }}</NuxtLink></h2>
            <p class="mt-1 text-sm text-secondary-500">
              {{ new Date(item.createdAt).toLocaleDateString('uk-UA') }} · <NuxtLink :to="`/account/orders?orderNumber=${encodeURIComponent(item.order.orderNumber)}`" class="text-primary-700 hover:underline">замовлення № {{ item.order.orderNumber }}</NuxtLink> · {{ returnReasonLabels[item.reason] }}
            </p>
          </div>
          <BBadge :variant="returnStatusVariants[item.status]">{{ returnStatusLabels[item.status] }}</BBadge>
        </div>
        <ReturnProgress :status="item.status" class="mt-4" />
        <div class="mt-3 flex items-end justify-between gap-3">
          <div class="flex gap-2 overflow-hidden">
            <ReturnThumb v-for="line in item.items.slice(0, 5)" :key="line.id" :image="line.image" :alt="line.productName" />
            <span v-if="item.items.length > 5" class="flex h-16 w-12 items-center justify-center rounded-lg bg-secondary-100 text-xs text-secondary-600">+{{ item.items.length - 5 }}</span>
          </div>
          <div v-if="item.refundAmount != null" class="text-right text-sm">
            <span class="block text-secondary-500">До повернення</span>
            <strong class="text-secondary-950">{{ formatPrice(item.refundAmount) }}</strong>
          </div>
        </div>
        <div class="mt-3 flex justify-end"><BBtn size="sm" variant="outline" :to="`/account/returns/${item.id}`">Деталі</BBtn></div>
      </article>
    </div>
  </div>
</template>
