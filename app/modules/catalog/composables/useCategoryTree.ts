import { useCatalogStore } from '../catalogStore'

export function useCategoryTree() {
  const catalogStore = useCatalogStore()
  const route = useRoute()

  const categories = computed(() => catalogStore.categories)

  const flatCategories = computed<Category[]>(() => {
    const result: Category[] = []

    for (const parent of categories.value) {
      result.push(parent)

      if (parent.children?.length) {
        for (const child of parent.children) {
          result.push(child)
        }
      }
    }

    return result
  })

  const activeSlug = computed<string | null>(() => {
    return (route.params.slug as string) || null
  })

  const activeCategory = computed<Category | null>(() => {
    if (!activeSlug.value) return null
    return flatCategories.value.find((category: Category) => category.slug === activeSlug.value) || null
  })

  const activeParentSlug = computed<string | null>(() => {
    if (!activeCategory.value) return null

    if (activeCategory.value.parentId) {
      const parent = categories.value.find((category: Category) => category.id === activeCategory.value!.parentId)
      return parent?.slug || null
    }

    return activeCategory.value.slug
  })

  function findBySlug(slug: string): Category | undefined {
    return flatCategories.value.find((category: Category) => category.slug === slug)
  }

  async function loadCategories() {
    await catalogStore.fetchCategories()
  }

  return {
    categories,
    flatCategories,
    activeSlug,
    activeCategory,
    activeParentSlug,
    findBySlug,
      loadCategories,
  }
}
