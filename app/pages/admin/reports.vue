<script setup lang="ts">
import { adminApi, getAdminError, type ReportCategory, type ReportDay, type ReportExpenseCategory, type ReportProduct, type ReportSummary } from '~/modules/admin/adminApi'
import AdminBarChart from '~/modules/admin/components/charts/AdminBarChart.vue'
import AdminLineChart from '~/modules/admin/components/charts/AdminLineChart.vue'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const expenseLabels: Record<string, string> = { PURCHASE: 'Закупівля', LOGISTICS: 'Логістика', ADVERTISING: 'Реклама', PACKAGING: 'Пакування', SALARY: 'Зарплата', SERVICES: 'Послуги', RETURN: 'Повернення', OTHER: 'Інше' }

const toast = useToast()
const today = new Date()
const monthAgo = new Date(today)
monthAgo.setDate(today.getDate() - 30)

const dateFrom = ref(monthAgo.toISOString().slice(0, 10))
const dateTo = ref(today.toISOString().slice(0, 10))
const loading = ref(false)
const report = ref<ReportSummary | null>(null)
const byDay = ref<ReportDay[]>([])
const byCategory = ref<ReportCategory[]>([])
const byProduct = ref<ReportProduct[]>([])
const expenses = ref<ReportExpenseCategory[]>([])

async function load() {
  loading.value = true
  try {
    const q = {
      dateFrom: new Date(`${dateFrom.value}T00:00:00`).toISOString(),
      dateTo: new Date(`${dateTo.value}T23:59:59`).toISOString(),
      orderStatuses: ['DELIVERED'],
    }
    ;[report.value, byDay.value, byCategory.value, byProduct.value, expenses.value] = await Promise.all([
      adminApi.reportSummary(q),
      adminApi.reportByDay(q),
      adminApi.reportByCategory(q),
      adminApi.reportByProduct(q),
      adminApi.reportExpensesByCategory(q),
    ])
  }
  catch (e) {
    toast.error(getAdminError(e))
  }
  finally {
    loading.value = false
  }
}

await load()

const tiles = computed(() => report.value
  ? [
      { label: 'Виручка', value: formatPrice(report.value.revenue) },
      { label: 'Чистий прибуток', value: formatPrice(report.value.netProfit) },
      { label: 'Замовлень', value: String(report.value.ordersCount) },
      { label: 'Середній чек', value: formatPrice(report.value.averageOrderValue) },
    ]
  : [])

const breakdown = computed(() => report.value
  ? [
      { label: 'Виручка', value: report.value.revenue },
      { label: 'Собівартість', value: report.value.costOfGoods },
      { label: 'Валовий прибуток', value: report.value.grossProfit },
      { label: 'Витрати', value: report.value.expenses },
      { label: 'Чистий прибуток', value: report.value.netProfit },
    ]
  : [])

const revenuePoints = computed(() => byDay.value.map(d => ({ date: d.date, value: d.revenue, detail: `${d.ordersCount} замовл.` })))
const ordersPoints = computed(() => byDay.value.map(d => ({ date: d.date, value: d.ordersCount })))

const categoryItems = computed(() => byCategory.value.map(c => ({ label: c.categoryName, value: c.revenue, hint: `${c.itemsSold} шт.` })))

const expenseItems = computed(() => [...expenses.value]
  .sort((a, b) => b.totalAmount - a.totalAmount)
  .map(e => ({ label: expenseLabels[e.category] ?? e.category, value: e.totalAmount, hint: `${e.count} шт.` })))
const expensesTotal = computed(() => expenses.value.reduce((sum, e) => sum + e.totalAmount, 0))
</script>

<template>
  <div class="mx-auto max-w-7xl space-y-6">
    <div>
      <h1 class="text-3xl font-bold text-secondary-900">Фінансові звіти</h1>
      <p class="text-sm text-secondary-500">Дохід, собівартість, валовий і чистий прибуток за доставленими замовленнями.</p>
    </div>

    <form class="flex flex-wrap items-end gap-3 rounded-xl border border-secondary-200 bg-white p-4" @submit.prevent="load">
      <BInput v-model="dateFrom" type="date" label="Від" />
      <BInput v-model="dateTo" type="date" label="До" />
      <BBtn type="submit" :loading="loading">Побудувати звіт</BBtn>
    </form>

    <div v-if="!report" class="rounded-xl border border-secondary-200 bg-white p-10 text-center text-secondary-500">
      Немає даних за період
    </div>

    <template v-else>
      <div class="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <article v-for="tile in tiles" :key="tile.label" class="rounded-xl border border-secondary-200 bg-white p-5">
          <span class="text-sm text-secondary-500">{{ tile.label }}</span>
          <strong class="mt-2 block text-2xl text-secondary-900">{{ tile.value }}</strong>
        </article>
      </div>

      <div class="grid gap-6 xl:grid-cols-2">
        <section class="rounded-xl border border-secondary-200 bg-white p-5">
          <h2 class="font-semibold text-secondary-900">Виручка за днями</h2>
          <div class="mt-4"><AdminLineChart :points="revenuePoints" :format="formatPrice" /></div>
        </section>
        <section class="rounded-xl border border-secondary-200 bg-white p-5">
          <h2 class="font-semibold text-secondary-900">Замовлення за днями</h2>
          <div class="mt-4"><AdminLineChart :points="ordersPoints" :format="(v: number) => `${Math.round(v)}`" /></div>
        </section>
        <section class="rounded-xl border border-secondary-200 bg-white p-5">
          <h2 class="font-semibold text-secondary-900">Від виручки до прибутку</h2>
          <div class="mt-4"><AdminBarChart :items="report.revenue ? breakdown : []" :format="formatPrice" /></div>
        </section>
        <section class="rounded-xl border border-secondary-200 bg-white p-5">
          <h2 class="font-semibold text-secondary-900">Виручка за категоріями</h2>
          <div class="mt-4"><AdminBarChart :items="categoryItems" :format="formatPrice" /></div>
        </section>
        <section class="rounded-xl border border-secondary-200 bg-white p-5">
          <h2 class="font-semibold text-secondary-900">Витрати за категоріями</h2>
          <div class="mt-4">
            <div v-if="!expensesTotal" class="flex h-40 items-center justify-center text-sm text-secondary-500">Витрат за період немає</div>
            <template v-else>
              <p class="mb-3 text-sm text-secondary-500">Разом: <span class="font-semibold text-secondary-900">{{ formatPrice(expensesTotal) }}</span></p>
              <AdminBarChart :items="expenseItems" :format="formatPrice" />
            </template>
          </div>
        </section>
      </div>

      <section class="overflow-hidden rounded-xl border border-secondary-200 bg-white">
        <h2 class="border-b border-secondary-200 p-5 font-semibold text-secondary-900">Товари</h2>
        <div class="max-h-[28rem] overflow-auto">
          <table class="w-full min-w-[640px] text-sm">
            <thead class="text-left text-xs uppercase text-secondary-500">
              <tr><th class="px-5 py-3">Товар</th><th class="px-5 py-3 text-right">Продано</th><th class="px-5 py-3 text-right">Виручка</th><th class="px-5 py-3 text-right">Валовий прибуток</th><th class="px-5 py-3 w-48">Маржа</th></tr>
            </thead>
            <tbody class="divide-y divide-secondary-200">
              <tr v-for="p in byProduct" :key="p.productId ?? p.productName">
                <td class="px-5 py-3"><div class="font-medium text-secondary-900">{{ p.productName }}</div><div class="text-xs text-secondary-500">{{ p.sku }}</div></td>
                <td class="px-5 py-3 text-right text-secondary-600">{{ p.itemsSold }} шт.</td>
                <td class="px-5 py-3 text-right font-semibold text-secondary-900">{{ formatPrice(p.revenue) }}</td>
                <td class="px-5 py-3 text-right text-secondary-600">{{ formatPrice(p.grossProfit) }}</td>
                <td class="px-5 py-3">
                  <div class="flex items-center gap-2">
                    <div class="h-1.5 flex-1 rounded-full bg-secondary-200"><div class="h-full rounded-full bg-primary-500" :style="{ width: `${Math.min(100, Math.max(0, p.marginPercent))}%` }" /></div>
                    <span class="w-12 text-right text-xs font-semibold text-secondary-900">{{ p.marginPercent }}%</span>
                  </div>
                </td>
              </tr>
              <tr v-if="!byProduct.length"><td colspan="5" class="p-8 text-center text-secondary-500">Немає продажів за період</td></tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>
  </div>
</template>
