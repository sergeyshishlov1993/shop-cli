<script setup lang="ts">
// Мобільна навігація адмінки: нижня скляна панель (4 розділи) + «Ще» відкриває повне меню з бічної панелі.
import AdminSidebar from '~/modules/admin/components/AdminSidebar.vue'

const route = useRoute()
const isMoreOpen = ref(false)

const tabs = [
  { to: '/admin', label: 'Огляд', icon: 'lucide:layout-dashboard', exact: true },
  { to: '/admin/orders', label: 'Замовлення', icon: 'lucide:shopping-bag' },
  { to: '/admin/products', label: 'Товари', icon: 'lucide:package' },
]

function isActive(tab: { to: string, exact?: boolean }) {
  return tab.exact ? route.path === tab.to : route.path === tab.to || route.path.startsWith(`${tab.to}/`)
}

// Позиція скляної плашки: розділ із нижньої панелі, інакше «Ще» (решта розділів відкривається з нього)
const activeIndex = computed(() => {
  if (isMoreOpen.value) return tabs.length
  const i = tabs.findIndex(isActive)
  return i === -1 ? tabs.length : i
})

watch(() => route.fullPath, () => { isMoreOpen.value = false })
</script>

<template>
  <nav class="glass fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 pb-[env(safe-area-inset-bottom)] lg:hidden" aria-label="Навігація адмінки">
    <span
        aria-hidden="true"
        class="pointer-events-none absolute left-0 top-1.5 h-[calc(4rem-0.75rem)] w-1/4 px-1.5 transition-transform duration-300 ease-out motion-reduce:transition-none"
        :style="{ transform: `translateX(${activeIndex * 100}%)` }"
    >
      <span class="glass block size-full rounded-2xl" />
    </span>
    <NuxtLink
        v-for="tab in tabs"
        :key="tab.to"
        :to="tab.to"
        class="relative flex h-16 flex-col items-center justify-center gap-1 text-[11px] transition-colors"
        :class="isActive(tab) ? 'text-secondary-900 font-semibold' : 'text-secondary-600'"
    >
      <Icon :name="tab.icon" size="22" />
      {{ tab.label }}
    </NuxtLink>
    <button
        type="button"
        class="relative flex h-16 flex-col items-center justify-center gap-1 text-[11px] text-secondary-600"
        :class="{ 'text-secondary-900 font-semibold': isMoreOpen }"
        @click="isMoreOpen = true"
    >
      <Icon name="lucide:menu" size="22" />
      Ще
    </button>
  </nav>

  <BDrawer v-model="isMoreOpen" side="left" title="Меню" width="w-[min(20rem,88vw)]">
    <AdminSidebar class="admin-sidebar--drawer !flex !w-full !border-0 !bg-transparent" />
  </BDrawer>
</template>

<style>
/* У висувному меню логотип і примітка бічної панелі зайві — заголовок «Меню» вже є */
.admin-sidebar--drawer > div:first-child,
.admin-sidebar--drawer > div:last-child {
  display: none;
}
</style>
