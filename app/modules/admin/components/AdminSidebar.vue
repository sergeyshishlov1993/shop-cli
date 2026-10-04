<script setup lang="ts">
import { adminApi, adminReturnsApi } from '~/modules/admin/adminApi'

defineProps<{
  collapsed?: boolean
}>()

// Лічильники «потребує уваги» біля пунктів меню (дані дашборду + нові повернення).
// Оновлюємо при відкритті, при переході між розділами (після обробки замовлення/відгуку) і раз на хвилину.
const badges = ref<Record<string, number>>({})
async function loadBadges() {
  const [dashboard, returns] = await Promise.allSettled([adminApi.dashboard(), adminReturnsApi.stats()])
  const pending = dashboard.status === 'fulfilled' ? dashboard.value.pendingActions : null
  badges.value = {
    '/admin/orders': pending?.newOrders ?? 0,
    '/admin/reviews': pending?.pendingReviews ?? 0,
    '/admin/feedback': pending?.newFeedback ?? 0,
    '/admin/products': pending?.lowStockVariants ?? 0,
    '/admin/returns': returns.status === 'fulfilled' ? returns.value.new : 0,
  }
}
onMounted(loadBadges)
useIntervalFn(loadBadges, 60_000)

const navigation = [
  { to: '/admin', label: 'Огляд', icon: 'lucide:layout-dashboard' },
  { to: '/admin/products', label: 'Товари', icon: 'lucide:package' },
  { to: '/admin/categories', label: 'Категорії', icon: 'lucide:folders' },
  { to: '/admin/catalog-data', label: 'Кольори й розміри', icon: 'lucide:swatch-book' },
  { to: '/admin/orders', label: 'Замовлення', icon: 'lucide:shopping-bag' },
  { to: '/admin/returns', label: 'Повернення', icon: 'lucide:undo-2' },
  { to: '/admin/users', label: 'Користувачі', icon: 'lucide:users' },
  { to: '/admin/reviews', label: 'Відгуки', icon: 'lucide:message-square' },
  { to: '/admin/feedback', label: 'Звернення', icon: 'lucide:inbox' },
  { to: '/admin/content', label: 'Контент', icon: 'lucide:panels-top-left' },
  { to: '/admin/instagram', label: 'Instagram', icon: 'lucide:instagram' },
  { to: '/admin/reports', label: 'Звіти', icon: 'lucide:chart-no-axes-combined' },
  { to: '/admin/expenses', label: 'Витрати', icon: 'lucide:wallet-cards' },
  { to: '/admin/coupons', label: 'Промокоди', icon: 'lucide:ticket-percent' },
  { to: '/admin/import', label: 'Імпорт', icon: 'lucide:upload' },
  { to: '/admin/labels', label: 'Друк цінників', icon: 'lucide:tags' },
  { to: '/admin/settings', label: 'Налаштування', icon: 'lucide:settings' },
]
const route = useRoute()
watch(() => route.path, loadBadges)
// Сторінки збільшують лічильник після дій, що змінюють «потребує уваги» (статус, архів) — бейджі оновлюються одразу
watch(useState('admin-badges-tick', () => 0), loadBadges)
// Розділ активний і на підсторінках (/admin/products/12), і з query/hash модалок
function isActive(to: string) {
  return to === '/admin' ? route.path === to : route.path === to || route.path.startsWith(`${to}/`)
}
const returnsEnabled = useReturnsEnabled()
const visibleNavigation = computed(() => navigation.filter(item => returnsEnabled.value || item.to !== '/admin/returns'))
</script>

<template>
  <aside
    class="hidden h-full shrink-0 flex-col border-r border-secondary-200 bg-white transition-[width] duration-200 lg:flex"
    :class="collapsed ? 'w-20' : 'w-64'"
  >
    <div class="flex min-h-[73px] items-center border-b border-secondary-200" :class="collapsed ? 'justify-center px-3' : 'px-6'">
      <NuxtLink to="/admin" class="store-wordmark text-2xl text-secondary-900">
        {{ collapsed ? 'S' : 'Stella' }}
      </NuxtLink>
    </div>

    <nav class="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-4">
      <NuxtLink
        v-for="item in visibleNavigation"
        :key="item.to"
        :to="item.to"
        class="flex items-center rounded-lg py-3 text-sm text-secondary-700 transition hover:bg-secondary-100 hover:text-secondary-900"
        :class="[collapsed ? 'justify-center px-2' : 'gap-3 px-4', isActive(item.to) && '!bg-secondary-900 font-semibold !text-white']"
        active-class=""
        exact-active-class=""
        :title="collapsed ? item.label : undefined"
      >
        <span class="relative shrink-0">
          <Icon :name="item.icon" size="19" />
          <span v-if="collapsed && badges[item.to]" class="absolute -right-1.5 -top-1.5 size-2.5 rounded-full" :class="item.to === '/admin/products' ? 'bg-warning' : 'bg-primary-500'" />
        </span>
        <span v-if="!collapsed" class="flex-1">{{ item.label }}</span>
        <!-- «Товари» — скільки варіантів закінчується (жовтий), решта — нові/непрочитані (акцент) -->
        <span
          v-if="!collapsed && badges[item.to]"
          class="rounded-full px-2 py-0.5 text-xs font-semibold text-white"
          :class="item.to === '/admin/products' ? 'bg-warning' : 'bg-primary-500'"
          :title="item.to === '/admin/products' ? 'Варіантів закінчується' : undefined"
        >{{ badges[item.to] }}</span>
      </NuxtLink>
    </nav>

    <div v-if="!collapsed" class="border-t border-secondary-200 p-4 text-xs leading-relaxed text-secondary-500">
      Каталог, замовлення та фінанси працюють через admin API.
    </div>
  </aside>
</template>
