<script setup lang="ts">
import { useCatalogStore } from '~/modules/catalog/catalogStore'

interface Props {
  modelValue?: string
  placeholder?: string
  debounce?: number
  limit?: number
}

interface Emits {
  (event: 'update:modelValue', value: string): void
  (event: 'select', product: ProductListItem): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '',
  debounce: 300,
  limit: 5,
})

const emit = defineEmits<Emits>()

const router = useRouter()
const root = useTemplateRef<HTMLElement>('root')
const catalogStore = useCatalogStore()

const search = ref(props.modelValue)
const isOpen = ref(false)
const searchHistory = useLocalStorage<string[]>('search-history', [])

const animatedWords = ['Сукня', 'Кофта', 'Футболка'] as const
const animatedPlaceholder = ref('')
const animatedWordIndex = ref(0)
const animatedCharIndex = ref(0)
const isDeleting = ref(false)

let animationTimer: ReturnType<typeof setTimeout> | null = null

watch(
    () => props.modelValue,
    (value) => {
      search.value = value
    },
)

watch(search, (value) => {
  emit('update:modelValue', value)
})

async function fetchSuggestions(value: string) {
  const trimmedValue = value.trim()

  if (!trimmedValue) {
    catalogStore.clearSearch()
    isOpen.value = false
    return
  }

  await catalogStore.searchProducts(trimmedValue)
  isOpen.value = catalogStore.searchResults.length > 0
}

function getProductImage(product: ProductListItem) {
  return product.mainImage?.s3KeyThumb
      || product.mainImage?.s3KeyMedium
      || product.mainImage?.s3KeyLarge
      || product.mainImage?.s3Key
      || ''
}

function clearSearchState() {
  search.value = ''
  emit('update:modelValue', '')
  isOpen.value = false
  catalogStore.clearSearch()
}

function saveToHistory(value: string) {
  const trimmedValue = value.trim()

  if (!trimmedValue) {
    return
  }

  searchHistory.value = [
    trimmedValue,
    ...searchHistory.value.filter((item) => item !== trimmedValue),
  ].slice(0, props.limit)
}

function removeHistoryItem(value: string) {
  searchHistory.value = searchHistory.value.filter((item) => item !== value)
}

async function selectHistoryItem(value: string) {
  saveToHistory(value)
  search.value = value
  isOpen.value = false

  await router.push({
    path: '/catalog',
    query: {
      search: value,
      page: '1',
    },
  })
}

function onSearch(value: string) {
  fetchSuggestions(value)
}

function onFocus() {
  if (catalogStore.searchResults.length > 0) {
    isOpen.value = true
  }
}

async function onSelect(product: ProductListItem) {
  saveToHistory(product.name)
  emit('select', product)
  clearSearchState()

  await router.push(`/product/${product.slug}`)
}

async function onSubmit() {
  const trimmedValue = search.value.trim()



  if (!trimmedValue) {
    return
  }

  saveToHistory(trimmedValue)

  clearSearchState()

  await router.push({
    path: '/catalog',
    query: {
      search: trimmedValue,
      page: '1',
    },
  })
}



function startPlaceholderAnimation() {
  if (search.value) {
    animatedPlaceholder.value = ''
    return
  }

  const currentWord = animatedWords[animatedWordIndex.value]

  if (!isDeleting.value) {
    animatedCharIndex.value += 1
    animatedPlaceholder.value = currentWord.slice(0, animatedCharIndex.value)

    if (animatedCharIndex.value === currentWord.length) {
      animationTimer = setTimeout(() => {
        isDeleting.value = true
        startPlaceholderAnimation()
      }, 1200)
      return
    }

    animationTimer = setTimeout(startPlaceholderAnimation, 120)
    return
  }

  animatedCharIndex.value -= 1
  animatedPlaceholder.value = currentWord.slice(0, animatedCharIndex.value)

  if (animatedCharIndex.value === 0) {
    isDeleting.value = false
    animatedWordIndex.value = (animatedWordIndex.value + 1) % animatedWords.length
    animationTimer = setTimeout(startPlaceholderAnimation, 250)
    return
  }

  animationTimer = setTimeout(startPlaceholderAnimation, 70)
}

onClickOutside(root, () => {
  isOpen.value = false
})

watch(
    search,
    (value) => {
      if (animationTimer) {
        clearTimeout(animationTimer)
        animationTimer = null
      }

      if (value) {
        animatedPlaceholder.value = ''
        return
      }

      startPlaceholderAnimation()
    },
    { immediate: true },
)

onBeforeUnmount(() => {
  if (animationTimer) {
    clearTimeout(animationTimer)
  }
})

const hasItems = computed(() => catalogStore.searchResults.length > 0)
const hasHistory = computed(() => searchHistory.value.length > 0)
const showDropdown = computed(() => isOpen.value && (catalogStore.searchLoading || hasItems.value))
const resolvedPlaceholder = computed(() => props.placeholder || animatedPlaceholder.value)
</script>

<template>
  <div ref="root" class="relative">
    <div class="relative">
      <BInput
          v-model="search"
          mode="search"
          :placeholder="resolvedPlaceholder"
          :debounce="debounce"
          @focus="onFocus"
          @search="onSearch"
          @keydown.enter="onSubmit"
      />

      <button
          type="button"
          class="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full text-secondary-500 transition-colors hover:bg-secondary-100 hover:text-secondary-900"
          @click="onSubmit"
      >
        <Icon name="mdi:magnify" size="20" />
      </button>
    </div>

    <div v-if="hasHistory" class="mt-3 flex gap-2 overflow-x-auto whitespace-nowrap -mx-4 px-4 scrollbar-none">
      <BTag
          v-for="item in searchHistory"
          :key="item"
          variant="secondary"
          closable
          class="shrink-0 cursor-pointer"
          @click="selectHistoryItem(item)"
          @close="removeHistoryItem(item)"
      >
        {{ item }}
      </BTag>
    </div>

    <div
        v-if="showDropdown"
        class="absolute left-0 top-full z-20 mt-2 w-full overflow-hidden rounded-xl border border-secondary-200 bg-white shadow-lg"
    >
      <div v-if="catalogStore.searchLoading" class="px-4 py-3 text-sm text-secondary-500">
        Завантаження...
      </div>

      <template v-else>
        <button
            v-for="item in catalogStore.searchResults"
            :key="item.id"
            type="button"
            class="flex w-full items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-secondary-50 sm:px-4"
            @click="onSelect(item)"
        >
          <div class="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-secondary-100 sm:h-16 sm:w-16">
            <img
                v-if="getProductImage(item)"
                :src="getProductImage(item)"
                :alt="item.name"
                class="h-full w-full object-cover"
            >
          </div>

          <div class="min-w-0 flex-1">
            <div class="truncate text-sm text-secondary-900 sm:text-base">
              {{ item.name }}
            </div>

            <div
                v-if="item.brand"
                class="mt-1 truncate text-xs text-secondary-500 sm:text-sm"
            >
              {{ item.brand }}
            </div>
          </div>

          <div class="shrink-0 text-right">
            <div class="text-sm text-secondary-900 sm:text-base">
              {{ item.effectivePrice }}
            </div>

            <div
                v-if="item.oldPrice"
                class="mt-1 text-xs text-secondary-400 line-through sm:text-sm"
            >
              {{ item.oldPrice }}
            </div>
          </div>
        </button>
      </template>
    </div>
  </div>
</template>