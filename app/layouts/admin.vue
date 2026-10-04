<script setup lang="ts">
import AdminSidebar from '~/modules/admin/components/AdminSidebar.vue'
import AdminTopbar from '~/modules/admin/components/AdminTopbar.vue'
import AdminMobileNav from '~/modules/admin/components/AdminMobileNav.vue'
import { startAdminBadges } from '~/modules/admin/composables/useAdminBadges'

const isSidebarCollapsed = ref(false)
startAdminBadges()

onMounted(() => {
  isSidebarCollapsed.value = localStorage.getItem('stella-admin-sidebar') === 'collapsed'
})

function toggleSidebar() {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
  localStorage.setItem('stella-admin-sidebar', isSidebarCollapsed.value ? 'collapsed' : 'expanded')
}
</script>

<template>
  <div class="admin-shell flex min-h-screen bg-gray-50">
    <AdminSidebar :collapsed="isSidebarCollapsed" />
    <div class="flex min-w-0 flex-1 flex-col">
      <AdminTopbar
        :sidebar-collapsed="isSidebarCollapsed"
        @toggle-sidebar="toggleSidebar"
      />
      <main class="min-w-0 flex-1 p-4 pb-28 sm:p-6 sm:pb-28 lg:p-8">
        <slot />
      </main>
    </div>
    <AdminMobileNav />
  </div>
</template>
