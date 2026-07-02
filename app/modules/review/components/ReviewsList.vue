<script setup lang="ts">
interface Props {
  productId: number
  limit?: number
}

const props = withDefaults(defineProps<Props>(), {
  limit: 10,
})

const reviewStore = useReviewStore()
const { reviews, totalCount, loading } = storeToRefs(reviewStore)

const authStore = useAuthStore()

const page = ref(1)

const totalPages = computed(() => Math.ceil(totalCount.value / props.limit))

async function load() {
  await reviewStore.fetchByProduct(props.productId, {
    page: page.value,
    limit: props.limit,
  })
}

function onPageChange(value: number) {
  page.value = value
  load()
}

watch(
  () => props.productId,
  () => {
    page.value = 1
    load()
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  reviewStore.reset()
})
</script>

<template>
  <section class="flex flex-col gap-6">
    <header class="flex items-center justify-between">
      <h2 class="text-xl font-semibold text-secondary-900">
        Відгуки
      </h2>
      <span class="text-sm text-secondary-500">
        {{ totalCount }}
      </span>
    </header>

    <ReviewForm
      v-if="authStore.isAuthenticated"
      :product-id="productId"
    />

    <div v-if="loading && !reviews.length" class="flex justify-center py-8">
      <BSpinner />
    </div>

    <div v-else-if="reviews.length" class="flex flex-col gap-4">
      <ReviewItem
        v-for="review in reviews"
        :key="review.id"
        :review="review"
      />
    </div>

    <p v-else class="py-8 text-center text-secondary-500">
      Відгуків ще немає
    </p>

    <BPagination
      v-if="totalPages > 1"
      :page="page"
      :total-pages="totalPages"
      @update:page="onPageChange"
    />
  </section>
</template>
