<script setup lang="ts">
import { useAuthStore } from '~/modules/auth/authStore'
import { useConfirm } from '~/modules/ui/composables/useConfirm'

const route = useRoute()
const authStore = useAuthStore()
const isAdmin = computed(() => authStore.isAdmin)
const { confirm } = useConfirm()

const returnsEnabled = useReturnsEnabled()
const links = [
  { to: '/account', label: 'Огляд', icon: 'lucide:layout-dashboard' },
  { to: '/account/profile', label: 'Профіль', icon: 'lucide:user' },
  { to: '/account/orders', label: 'Замовлення', icon: 'lucide:package' },
  { to: '/account/returns', label: 'Повернення', icon: 'lucide:undo-2' },
  { to: '/account/delivery', label: 'Адреси', icon: 'lucide:map-pin' },
  { to: '/favorites', label: 'Обране', icon: 'lucide:heart' },
]

function isActive(to: string) {
  return to === '/account' ? route.path === to : route.path.startsWith(to)
}

async function logout() {
  const ok = await confirm({
    title: 'Вийти з акаунта?',
    message: 'Ви зможете увійти знову будь-коли.',
    confirmText: 'Вийти',
    variant: 'warning',
  })
  if (ok) authStore.logout()
}
const visibleLinks = computed(() => links.filter(link => returnsEnabled.value || link.to !== '/account/returns'))
</script>

<template>
  <nav v-drag-scroll aria-label="Особистий кабінет" class="scrollbar-none -mx-4 -my-6 flex gap-2 overflow-x-auto px-4 py-6">
    <NuxtLink
      v-for="link in visibleLinks"
      :key="link.to"
      :to="link.to"
      class="inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition"
      :class="isActive(link.to) ? 'bg-primary-500 text-white' : 'glass text-secondary-700 hover:text-primary-700'"
    >
      <Icon :name="link.icon" size="17" />
      {{ link.label }}
    </NuxtLink>
    <NuxtLink
      v-if="isAdmin"
      to="/admin"
      class="inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-secondary-700 transition glass hover:text-primary-700"
    >
      <Icon name="lucide:shield" size="17" />
      Адмін-панель
    </NuxtLink>
    <button
      type="button"
      class="glass ml-auto inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-secondary-700 transition hover:text-primary-700"
      @click="logout"
    >
      <Icon name="lucide:log-out" size="17" />
      Вийти
    </button>
  </nav>
</template>
