<script setup lang="ts">
import { useReviewStore } from '~/modules/review/reviewStore'
import { useAuthStore } from '~/modules/auth/authStore'
import ReviewForm from '~/modules/review/components/ReviewForm.vue'
import ReviewItem from '~/modules/review/components/ReviewItem.vue'
import ReviewMediaViewer from '~/modules/review/components/ReviewMediaViewer.vue'

interface Props {
  productId: number
  limit?: number
}

const props = withDefaults(defineProps<Props>(), {
  limit: 10,
})

const reviewStore = useReviewStore()
const { reviews, totalCount, loading, sort, filter, averageRating, ratingDistribution } = storeToRefs(reviewStore)

const sortOptions = [
  { value: 'newest', label: 'Нові' },
  { value: 'oldest', label: 'Старі' },
  { value: 'popular', label: 'Популярні' },
  { value: 'rating_desc', label: 'Спочатку високі' },
  { value: 'rating_asc', label: 'Спочатку низькі' },
]

const currentSortLabel = computed(() => sortOptions.find(o => o.value === sort.value)?.label)

const filterOptions = computed(() => [
  { value: 'all', label: 'Усі' },
  { value: 'with_media', label: 'З фото' },
  ...(authStore.isAuthenticated ? [{ value: 'mine', label: 'Мої відгуки' }] : []),
])
const currentFilterLabel = computed(() => filterOptions.value.find(o => o.value === filter.value)?.label)

// Загальна кількість по товару — не залежить від фільтра
const ratingTotal = computed(() => Object.values(ratingDistribution.value).reduce((a, b) => a + b, 0))
const ratingRows = computed(() => ([5, 4, 3, 2, 1] as const).map((star) => {
  const count = ratingDistribution.value[String(star) as '1' | '2' | '3' | '4' | '5'] ?? 0
  return { star, count, percent: ratingTotal.value ? (count / ratingTotal.value) * 100 : 0 }
}))

function pluralReviews(n: number) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return 'відгук'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'відгуки'
  return 'відгуків'
}

watch([sort, filter], () => load())

const authStore = useAuthStore()
// Профіль потрібен, щоб показати "Редагувати/Видалити" на власних відгуках
onMounted(() => { if (authStore.isAuthenticated && !authStore.user) authStore.fetchProfile() })

const page = ref(1)
// Сторінки 2–3 підвантажуються автоматично, далі — кнопкою
const AUTO_PAGES = 3
const isFormOpen = ref(false)

function onCreated() {
  isFormOpen.value = false
  load()
}

const viewerOpen = ref(false)
const viewerStart = ref<{ review: Review, mediaIndex: number } | null>(null)

provide('openReviewMedia', (review: Review, mediaIndex: number) => {
  viewerStart.value = { review, mediaIndex }
  viewerOpen.value = true
})

const totalPages = computed(() => Math.ceil(totalCount.value / props.limit))
const hasMore = computed(() => page.value < totalPages.value)

async function load() {
  page.value = 1
  await reviewStore.fetchByProduct(props.productId, {
    page: 1,
    limit: props.limit,
  })
}

async function loadMore() {
  if (loading.value || !hasMore.value) return
  page.value++
  await reviewStore.fetchByProduct(props.productId, {
    page: page.value,
    limit: props.limit,
  })
}

const sentinel = ref<HTMLElement | null>(null)
const sentinelVisible = ref(false)
useIntersectionObserver(sentinel, ([entry]) => { sentinelVisible.value = !!entry?.isIntersecting })
watch([sentinelVisible, loading], () => {
  if (sentinelVisible.value && !loading.value && page.value < AUTO_PAGES) loadMore()
})

// Перша сторінка — на SSR: стан стору приходить у payload, клієнт не перезапитує.
// Зміна товару без перезавантаження сторінки — звичайний load().
await useAsyncData(`reviews-${props.productId}`, () => load().then(() => true))
watch(() => props.productId, () => load())

onBeforeUnmount(() => {
  reviewStore.reset()
})
</script>

<template>
  <section id="reviews" class="flex scroll-mt-24 flex-col gap-6">
    <div class="flex flex-col gap-6 rounded-2xl border border-secondary-200 bg-white p-6 sm:flex-row sm:items-center sm:gap-10">
      <div class="flex flex-col items-center gap-1 sm:w-40">
        <span class="text-5xl font-bold text-secondary-900">{{ averageRating.toFixed(1) }}</span>
        <span class="text-sm text-secondary-500">{{ ratingTotal }} {{ pluralReviews(ratingTotal) }}</span>
      </div>
      <div class="flex flex-1 flex-col gap-2">
        <div v-for="row in ratingRows" :key="row.star" class="flex items-center gap-3">
          <BRating :model-value="row.star" readonly size="sm" />
          <div class="h-2 flex-1 overflow-hidden rounded-full bg-secondary-100">
            <div class="h-full rounded-full bg-primary-500" :style="{ width: `${row.percent}%` }" />
          </div>
          <span class="w-8 text-right text-sm text-secondary-500">{{ row.count }}</span>
        </div>
      </div>
    </div>

    <div>
      <BBtn v-if="authStore.isAuthenticated" variant="primary" @click="isFormOpen = true">
        Написати відгук
      </BBtn>
      <BBtn v-else variant="primary" to="/login">
        Написати відгук
      </BBtn>
    </div>

    <BModal v-model="isFormOpen" title="Написати відгук">
      <ReviewForm :product-id="productId" @submit="onCreated" />
    </BModal>

    <div class="flex flex-wrap items-center justify-between gap-3">
      <BDropdown align="left">
        <template #trigger>
          <BBtn variant="ghost" size="sm">
            <Icon name="lucide:list-filter" class="size-4" /> {{ currentFilterLabel }}
          </BBtn>
        </template>
        <button
          v-for="option in filterOptions"
          :key="option.value"
          type="button"
          class="flex w-full items-center px-4 py-2 text-sm hover:bg-secondary-50"
          :class="option.value === filter ? 'font-semibold text-secondary-900' : 'text-secondary-700'"
          @click="filter = option.value as ReviewFilter"
        >
          {{ option.label }}
        </button>
      </BDropdown>
      <BDropdown align="right">
        <template #trigger>
          <BBtn variant="ghost" size="sm">
            <Icon name="lucide:arrow-down-up" class="size-4" /> {{ currentSortLabel }}
          </BBtn>
        </template>
        <button
          v-for="option in sortOptions"
          :key="option.value"
          type="button"
          class="flex w-full items-center px-4 py-2 text-sm hover:bg-secondary-50"
          :class="option.value === sort ? 'font-semibold text-secondary-900' : 'text-secondary-700'"
          @click="sort = option.value as ReviewSort"
        >
          {{ option.label }}
        </button>
      </BDropdown>
    </div>

    <div v-if="loading && !reviews.length" class="flex justify-center py-8">
      <BSpinner />
    </div>

    <div v-else-if="reviews.length" class="flex flex-col gap-4">
      <ReviewItem
        v-for="review in reviews"
        :key="review.id"
        :review="review"
        @changed="load"
      />
      <div ref="sentinel" />
      <div v-if="loading" class="flex justify-center py-4">
        <BSpinner />
      </div>
      <BBtn v-else-if="hasMore && page >= AUTO_PAGES" variant="outline" class="self-center" @click="loadMore">
        Завантажити ще
      </BBtn>
    </div>

    <p v-else class="py-8 text-center text-secondary-500">
      Відгуків ще немає
    </p>

    <ReviewMediaViewer
      v-model="viewerOpen"
      :product-id="productId"
      :start="viewerStart"
      @changed="load"
    />
  </section>
</template>
