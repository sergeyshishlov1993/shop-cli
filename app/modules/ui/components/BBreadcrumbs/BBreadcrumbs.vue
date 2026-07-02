<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core'

interface BreadcrumbItem {
  label: string
  to?: string
}

interface Props {
  items: BreadcrumbItem[]
}

const props = defineProps<Props>()

const isMobile = useMediaQuery('(max-width: 767px)')

const visibleThreshold = 4

const isCollapsed = computed(
    () => isMobile.value && props.items.length > visibleThreshold,
)

const firstItem = computed(() => props.items[0])

const lastItems = computed(() =>
    isCollapsed.value ? props.items.slice(-2) : props.items.slice(1),
)

const hiddenItems = computed(() =>
    isCollapsed.value ? props.items.slice(1, -2) : [],
)
</script>

<template>
  <nav
      aria-label="Хлібні крихти"
      class="flex items-center gap-1.5 text-sm"
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

    <template v-if="isCollapsed">
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
            :key="index"
            :to="item.to"
            class="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50 hover:text-primary-600"
        >
          {{ item.label }}
        </NuxtLink>
      </BDropdown>
    </template>

    <template v-for="(item, index) in lastItems" :key="`last-${index}`">
      <span class="shrink-0 text-secondary-300">/</span>

      <NuxtLink
          v-if="item.to && index < lastItems.length - 1"
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
</template>