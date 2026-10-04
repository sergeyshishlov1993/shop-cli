<script setup lang="ts">
import { adminApi } from '~/modules/admin/adminApi'
import AdminBarChart from '~/modules/admin/components/charts/AdminBarChart.vue'
import AdminLineChart from '~/modules/admin/components/charts/AdminLineChart.vue'
import AdminDonutChart from '~/modules/admin/components/charts/AdminDonutChart.vue'
import { ADMIN_BADGE_HINTS, useAdminBadges } from '~/modules/admin/composables/useAdminBadges'

definePageMeta({ layout: 'admin', middleware: 'admin' })

// «Потребує уваги» — ті самі лічильники, що й бейджі меню; плитка веде в розділ
const badges = useAdminBadges()
const returnsEnabled = useReturnsEnabled()
const attentionTiles = computed(() => [
  { to: '/admin/orders', label: 'Чекають підтвердження', tone: 'bg-blue-50 text-blue-700' },
  { to: '/admin/reviews', label: 'Нових відгуків', tone: 'bg-violet-50 text-violet-700' },
  { to: '/admin/feedback', label: 'Нових звернень', tone: 'bg-rose-50 text-rose-700' },
  { to: '/admin/returns', label: 'Нових повернень', tone: 'bg-orange-50 text-orange-700' },
  { to: '/admin/users', label: 'Нових користувачів', tone: 'bg-emerald-50 text-emerald-700' },
  { to: '/admin/products', label: 'Мало на складі', tone: 'bg-amber-50 text-amber-700' },
].filter(tile => returnsEnabled.value || tile.to !== '/admin/returns'))

const { data: dashboard, pending, error, refresh } = await useAsyncData(
  'admin-dashboard',
  () => adminApi.dashboard(),
)

const { data: last30 } = await useAsyncData('admin-dashboard-by-day', () => {
  const to = new Date()
  const from = new Date(to)
  from.setDate(to.getDate() - 29)
  from.setHours(0, 0, 0, 0)
  return adminApi.reportByDay({ dateFrom: from.toISOString(), dateTo: to.toISOString() })
}, { default: () => [] })

const revenuePoints = computed(() => (last30.value ?? []).map(d => ({ date: d.date, value: d.revenue, detail: `${d.ordersCount} замовл.` })))

const statusLabels: Record<string, string> = {
  NEW: 'Нові',
  PROCESSING: 'В роботі',
  SHIPPED: 'Відправлені',
  DELIVERED: 'Доставлені',
  CANCELLED: 'Скасовані',
  RETURNED: 'Повернення',
}

const statusClasses: Record<string, string> = {
  NEW: 'bg-blue-50 text-blue-700',
  PROCESSING: 'bg-amber-50 text-amber-700',
  SHIPPED: 'bg-violet-50 text-violet-700',
  DELIVERED: 'bg-emerald-50 text-emerald-700',
  CANCELLED: 'bg-red-50 text-red-700',
  RETURNED: 'bg-gray-100 text-gray-700',
}

const statusItems = computed(() => Object.entries(statusLabels).map(([key, label]) => ({
  key,
  label,
  value: dashboard.value?.orderStatuses?.[key as keyof typeof dashboard.value.orderStatuses] ?? 0,
})))

const topProductItems = computed(() => (dashboard.value?.topProducts ?? []).map(product => ({
  label: product.productName,
  value: product.quantity,
  hint: formatPrice(product.revenue),
})))

const tile = 'rounded-xl border border-secondary-200 bg-white p-5'
</script>

<template>
  <div class="mx-auto max-w-7xl space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-gray-950 sm:text-3xl">Огляд магазину</h1>
        <p class="mt-1 text-sm text-gray-500">Замовлення, виручка, прибуток і дії, що потребують уваги.</p>
      </div>
      <BBtn variant="outline" @click="refresh(); refreshNuxtData('admin-dashboard-by-day')">Оновити</BBtn>
    </div>

    <div v-if="pending" class="rounded-2xl border border-gray-200 bg-white p-10 text-center text-gray-500">Завантаження статистики…</div>
    <div v-else-if="error || !dashboard" class="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
      Не вдалося завантажити статистику. Перевірте API та повторіть.
    </div>

    <template v-else>
      <section class="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <article :class="tile">
          <div class="text-sm text-secondary-500">Виручка за місяць</div>
          <div class="mt-2 text-2xl font-bold text-secondary-900">{{ formatPrice(dashboard.financials.revenue) }}</div>
          <div class="mt-2 text-xs" :class="(dashboard.month.changePercent ?? 0) >= 0 ? 'text-emerald-600' : 'text-red-600'">
            {{ (dashboard.month.changePercent ?? 0) >= 0 ? '+' : '' }}{{ dashboard.month.changePercent ?? 0 }}% до минулого місяця
          </div>
        </article>
        <article :class="tile">
          <div class="text-sm text-secondary-500">Валовий прибуток</div>
          <div class="mt-2 text-2xl font-bold text-secondary-900">{{ formatPrice(dashboard.financials.grossProfit) }}</div>
          <div class="mt-2 text-xs text-secondary-500">Собівартість: {{ formatPrice(dashboard.financials.costOfGoods) }}</div>
        </article>
        <article :class="tile">
          <div class="text-sm text-secondary-500">Витрати за місяць</div>
          <div class="mt-2 text-2xl font-bold text-secondary-900">{{ formatPrice(dashboard.financials.expenses) }}</div>
          <NuxtLink to="/admin/expenses" class="mt-2 inline-block text-xs font-medium text-primary-700 hover:underline">Відкрити витрати →</NuxtLink>
        </article>
        <article :class="tile">
          <div class="text-sm text-secondary-500">Чистий прибуток</div>
          <div class="mt-2 text-2xl font-bold text-secondary-900">{{ formatPrice(dashboard.financials.netProfit) }}</div>
          <div class="mt-2 text-xs text-secondary-500">Прибуток мінус операційні витрати</div>
        </article>
      </section>

      <section class="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
        <article v-for="period in [
          { title: 'Сьогодні', value: dashboard.today },
          { title: 'Цей тиждень', value: dashboard.week },
          { title: 'Цей місяць', value: dashboard.month },
        ]" :key="period.title" class="rounded-xl border border-secondary-200 bg-white p-5">
          <h2 class="font-semibold text-secondary-900">{{ period.title }}</h2>
          <dl class="mt-4 grid grid-cols-3 gap-3 text-center">
            <div><dt class="text-xs text-secondary-500">Замовлень</dt><dd class="mt-1 text-xl font-bold text-secondary-900">{{ period.value.ordersCount }}</dd></div>
            <div><dt class="text-xs text-secondary-500">Виручка</dt><dd class="mt-1 text-sm font-bold text-secondary-900">{{ formatPrice(period.value.revenue) }}</dd></div>
            <div><dt class="text-xs text-secondary-500">Середній чек</dt><dd class="mt-1 text-sm font-bold text-secondary-900">{{ formatPrice(period.value.averageCheck) }}</dd></div>
          </dl>
        </article>
      </section>

      <section class="rounded-xl border border-secondary-200 bg-white p-5">
        <h2 class="font-semibold text-secondary-900">Виручка за 30 днів</h2>
        <p class="text-xs text-secondary-500">Доставлені замовлення</p>
        <div class="mt-4"><AdminLineChart :points="revenuePoints" :format="formatPrice" empty-text="Продажів за 30 днів немає" /></div>
      </section>

      <section class="grid gap-6 lg:grid-cols-2">
        <article class="rounded-xl border border-secondary-200 bg-white p-5">
          <h2 class="font-semibold text-secondary-900">Статуси замовлень</h2>
          <div class="mt-4"><AdminDonutChart :items="statusItems" center-label="замовлень" empty-text="Замовлень ще немає" /></div>
        </article>
        <article class="rounded-xl border border-secondary-200 bg-white p-5">
          <h2 class="font-semibold text-secondary-900">Топ товарів за тиждень, шт.</h2>
          <div class="mt-4"><AdminBarChart :items="topProductItems" :format="(v: number) => `${v} шт.`" empty-text="Немає доставлених продажів за тиждень." /></div>
        </article>
      </section>

      <section class="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <article class="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <div class="flex items-center justify-between border-b border-gray-200 px-5 py-4">
            <h2 class="font-semibold text-gray-950">Останні замовлення</h2>
            <NuxtLink to="/admin/orders" class="text-sm font-medium text-primary-700 hover:underline">Усі замовлення</NuxtLink>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full min-w-[640px] text-sm">
              <thead class="bg-gray-50 text-left text-xs uppercase text-gray-500"><tr><th class="px-5 py-3">Номер</th><th class="px-5 py-3">Клієнт</th><th class="px-5 py-3">Статус</th><th class="px-5 py-3 text-right">Сума</th></tr></thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="order in dashboard.recentOrders" :key="order.id">
                  <td class="px-5 py-4 font-medium text-gray-950">{{ order.orderNumber }}</td>
                  <td class="px-5 py-4 text-gray-600">{{ order.customerName }}</td>
                  <td class="px-5 py-4"><span class="rounded-full px-2.5 py-1 text-xs font-medium" :class="statusClasses[order.status]">{{ statusLabels[order.status] }}</span></td>
                  <td class="px-5 py-4 text-right font-semibold">{{ formatPrice(order.totalAmount) }}</td>
                </tr>
                <tr v-if="!dashboard.recentOrders.length"><td colspan="4" class="px-5 py-8 text-center text-gray-500">Замовлень ще немає</td></tr>
              </tbody>
            </table>
          </div>
        </article>

        <div class="space-y-6">
          <article class="rounded-2xl border border-gray-200 bg-white p-5">
            <h2 class="font-semibold text-gray-950">Потребує уваги</h2>
            <div class="mt-4 grid grid-cols-2 gap-3">
              <NuxtLink v-for="tile in attentionTiles" :key="tile.to" :to="tile.to" class="rounded-xl p-4 transition hover:brightness-95" :class="tile.tone" :title="ADMIN_BADGE_HINTS[tile.to]">
                <div class="text-2xl font-bold">{{ badges[tile.to] ?? 0 }}</div>
                <div class="text-xs">{{ tile.label }}</div>
              </NuxtLink>
            </div>
          </article>

        </div>
      </section>
    </template>
  </div>
</template>
