<script setup lang="ts">
interface BreadcrumbItem {
  label: string
  to?: string
}

interface Props {
  items: BreadcrumbItem[]
}

const props = defineProps<Props>()

const visibleThreshold = 4
const firstItem = computed<BreadcrumbItem>(() => props.items[0] ?? { label: '' })
const desktopItems = computed(() => props.items.slice(1))
const isMobileCollapsed = computed(() => props.items.length > visibleThreshold)
const mobileItems = computed(() => isMobileCollapsed.value ? props.items.slice(-2) : props.items.slice(1))
const hiddenItems = computed(() => isMobileCollapsed.value ? props.items.slice(1, -2) : [])
</script>

<template>
  <nav
      aria-label="Хлібні крихти"
      class="hidden items-center gap-1.5 text-sm md:flex"
  >
    <NuxtLink
        v-if="firstItem.to && items.length > 1"
        :to="firstItem.to"
        class="shrink-0 text-secondary-500 transition-colors hover:text-primary-600"
    >
      {{ firstItem.label }}
    </NuxtLink>
    <span
        v-else
        class="shrink-0 text-secondary-700 font-medium"
    >
      {{ firstItem.label }}
    </span>

    <template v-for="(item, index) in desktopItems" :key="`desktop-${index}`">
      <span class="shrink-0 text-secondary-300">/</span>

      <NuxtLink
          v-if="item.to && index < desktopItems.length - 1"
          :to="item.to"
          class="shrink-0 text-secondary-500 transition-colors hover:text-primary-600"
      >
        {{ item.label }}
      </NuxtLink>
      <span
          v-else
          class="shrink-0 text-secondary-700 font-medium"
      >
        {{ item.label }}
      </span>
    </template>
  </nav>

  <nav
      aria-label="Хлібні крихти"
      class="flex items-center gap-1.5 overflow-x-auto text-sm md:hidden"
  >
    <NuxtLink
        v-if="firstItem.to && items.length > 1"
        :to="firstItem.to"
        class="shrink-0 text-secondary-500 transition-colors hover:text-primary-600"
    >
      {{ firstItem.label }}
    </NuxtLink>
    <span v-else class="shrink-0 font-medium text-secondary-700">
      {{ firstItem.label }}
    </span>

    <template v-if="isMobileCollapsed">
      <span class="shrink-0 text-secondary-300">/</span>
      <BDropdown align="left">
        <template #trigger>
          <button
              type="button"
              class="shrink-0 rounded px-1 text-secondary-500 transition-colors hover:text-primary-600"
          >
            ...
          </button>
        </template>
        <NuxtLink
            v-for="(item, index) in hiddenItems"
            :key="`hidden-${index}`"
            :to="item.to"
            class="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50 hover:text-primary-600"
        >
          {{ item.label }}
        </NuxtLink>
      </BDropdown>
    </template>

    <template v-for="(item, index) in mobileItems" :key="`mobile-${index}`">
      <span class="shrink-0 text-secondary-300">/</span>
      <NuxtLink
          v-if="item.to && index < mobileItems.length - 1"
          :to="item.to"
          class="shrink-0 text-secondary-500 transition-colors hover:text-primary-600"
      >
        {{ item.label }}
      </NuxtLink>
      <span v-else class="shrink-0 font-medium text-secondary-700">
        {{ item.label }}
      </span>
    </template>
  </nav>
</template>
