<script setup lang="ts">
import { useAuthStore } from '~/modules/auth/authStore'

defineProps<{
  sidebarCollapsed?: boolean
}>()

defineEmits<{
  'toggle-sidebar': []
}>()

const authStore = useAuthStore()
const isLoggingOut = ref(false)

async function logout() {
  isLoggingOut.value = true
  try {
    await authStore.logout()
  } finally {
    isLoggingOut.value = false
  }
}
</script>

<template>
  <header class="glass sticky top-0 z-30 flex min-h-14 items-center justify-between border-x-0 border-t-0 px-4 sm:px-6 lg:static lg:min-h-16">
    <div class="flex min-w-0 items-center gap-3">
      <button
        type="button"
        class="hidden size-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-50 hover:text-gray-900 lg:flex"
        :aria-label="sidebarCollapsed ? 'Розгорнути бокову панель' : 'Згорнути бокову панель'"
        :title="sidebarCollapsed ? 'Розгорнути меню' : 'Згорнути меню'"
        @click="$emit('toggle-sidebar')"
      >
        <Icon :name="sidebarCollapsed ? 'lucide:panel-left-open' : 'lucide:panel-left-close'" size="19" />
      </button>

      <div class="min-w-0">
        <div class="text-base font-semibold text-gray-900 sm:text-lg">Адмін-панель</div>
        <div class="hidden truncate text-xs text-gray-500 sm:block">{{ authStore.user?.email }}</div>
      </div>
    </div>

    <div class="flex items-center gap-1 sm:gap-2">
      <!-- Однакова висота (40px) і вирівнювання для всіх дій шапки -->
      <ThemeToggle class="flex size-10 items-center justify-center rounded-lg text-secondary-600 transition hover:bg-secondary-100 hover:text-secondary-900" />
      <NuxtLink to="/" class="flex h-10 items-center gap-2 rounded-lg px-2 text-sm text-secondary-700 transition hover:bg-secondary-100 hover:text-secondary-900 sm:px-3" aria-label="На сайт">
        <Icon name="lucide:store" size="18" />
        <span class="max-sm:hidden">На сайт</span>
      </NuxtLink>
      <button
        type="button"
        class="flex h-10 items-center gap-2 rounded-lg border border-secondary-300 px-3 text-sm text-secondary-700 transition hover:bg-secondary-100 disabled:opacity-60 sm:px-4"
        :disabled="isLoggingOut"
        @click="logout"
      >
        <Icon name="lucide:log-out" size="18" />
        <span class="max-sm:hidden">{{ isLoggingOut ? 'Вихід…' : 'Вийти' }}</span>
      </button>
    </div>
  </header>

</template>
