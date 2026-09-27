<script setup lang="ts">
const { categories, activeCategory, loadCategories } = useCategoryTree()

await loadCategories()

// Підкатегорії поточної; для листової — її «сестри»; на /catalog — верхній рівень
const parent = computed(() => {
  const current = activeCategory.value
  if (!current) return null
  if (current.children?.length) return current
  return categories.value.find(category => category.id === current.parentId) ?? null
})

const allLink = computed(() => (parent.value ? `/catalog/${parent.value.slug}` : '/catalog'))
const chip = (active: boolean) => 'shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm transition-colors '
  + (active ? 'border-secondary-900 bg-secondary-900 text-white' : 'border-secondary-200 text-secondary-800 hover:border-secondary-900')

const items = computed(() => parent.value?.children ?? categories.value)
</script>

<template>
  <nav v-if="items.length" v-drag-scroll class="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0" aria-label="Категорії">
    <NuxtLink
      :to="allLink"
      :class="chip(activeCategory?.slug === parent?.slug)"
    >
      Усі
    </NuxtLink>
    <NuxtLink
      v-for="item in items"
      :key="item.id"
      :to="`/catalog/${item.slug}`"
      :class="chip(activeCategory?.id === item.id)"
    >
      {{ item.name }}
    </NuxtLink>
  </nav>
</template>
