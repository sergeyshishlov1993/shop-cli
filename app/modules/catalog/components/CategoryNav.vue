<script setup lang="ts">
const { categories, activeSlug, activeParentSlug, loadCategories } = useCategoryTree()

const expandedSlugs = ref<Set<string>>(new Set())

watch(activeParentSlug, (slug) => {
  if (slug) {
    expandedSlugs.value.add(slug)
  }
}, { immediate: true })

function toggleExpand(slug: string) {
  if (expandedSlugs.value.has(slug)) {
    expandedSlugs.value.delete(slug)
  } else {
    expandedSlugs.value.add(slug)
  }
}

function isExpanded(slug: string): boolean {
  return expandedSlugs.value.has(slug)
}

function isActive(slug: string): boolean {
  return activeSlug.value === slug
}

await loadCategories()
</script>

<template>
  <nav>
    <div class="hidden lg:block">
      <h3 class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
        Категорії
      </h3>
      <ul class="space-y-1">
        <li>
          <NuxtLink
            to="/catalog"
            class="block rounded-lg px-3 py-2 text-sm font-medium transition-colors"
            :class="[
              !activeSlug
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-700 hover:bg-gray-100',
            ]"
          >
            Усі товари
          </NuxtLink>
        </li>
        <li v-for="parent in categories" :key="parent.id">
          <div class="flex items-center">
            <NuxtLink
              :to="`/catalog/${parent.slug}`"
              class="flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
              :class="[
                isActive(parent.slug)
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100',
              ]"
            >
              {{ parent.name }}
            </NuxtLink>
            <button
              v-if="parent.children?.length"
              type="button"
              class="flex size-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              @click="toggleExpand(parent.slug)"
            >
              <BIcon
                name="chevron-down"
                :size="16"
                class="transition-transform duration-200"
                :class="{ 'rotate-180': isExpanded(parent.slug) }"
              />
            </button>
          </div>
          <ul
            v-if="parent.children?.length && isExpanded(parent.slug)"
            class="ml-3 mt-1 space-y-1 border-l border-gray-200 pl-3"
          >
            <li v-for="child in parent.children" :key="child.id">
              <NuxtLink
                :to="`/catalog/${child.slug}`"
                class="block rounded-lg px-3 py-1.5 text-sm transition-colors"
                :class="[
                  isActive(child.slug)
                    ? 'bg-primary-50 font-medium text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                ]"
              >
                {{ child.name }}
              </NuxtLink>
            </li>
          </ul>
        </li>
      </ul>
    </div>

    <div class="lg:hidden">
      <div class="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 scrollbar-none">
        <NuxtLink
          to="/catalog"
          class="shrink-0 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors"
          :class="[
            !activeSlug
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
          ]"
        >
          Усі
        </NuxtLink>
        <template v-for="parent in categories" :key="parent.id">
          <NuxtLink
            :to="`/catalog/${parent.slug}`"
            class="shrink-0 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors"
            :class="[
              isActive(parent.slug) || activeParentSlug === parent.slug
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
            ]"
          >
            {{ parent.name }}
          </NuxtLink>
          <template v-if="parent.children?.length && activeParentSlug === parent.slug">
            <NuxtLink
              v-for="child in parent.children"
              :key="child.id"
              :to="`/catalog/${child.slug}`"
              class="shrink-0 rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors"
              :class="[
                isActive(child.slug)
                  ? 'border-primary-600 bg-primary-50 text-primary-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300',
              ]"
            >
              {{ child.name }}
            </NuxtLink>
          </template>
        </template>
      </div>
    </div>
  </nav>
</template>
