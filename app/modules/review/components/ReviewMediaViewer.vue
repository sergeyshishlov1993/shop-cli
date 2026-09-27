<script setup lang="ts">
import { getFileUrl } from '~/modules/common/helpers/fileUrl'
import { useAuthStore } from '~/modules/auth/authStore'
import { useReviewStore } from '~/modules/review/reviewStore'
import { reviewApi } from '~/modules/review/reviewApi'
import { useToast } from '~/modules/ui/composables/useToast'
import ReviewInlineForm from '~/modules/review/components/ReviewInlineForm.vue'

// Single viewer for the whole list: navigates across all product reviews that have media
interface Props {
  productId: number
  start: { review: Review, mediaIndex: number } | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  changed: []
}>()

const open = defineModel<boolean>({ required: true })

const authStore = useAuthStore()
const reviewStore = useReviewStore()
const toast = useToast()

const PAGE_LIMIT = 50

const items = ref<Review[]>([])
const reviewIndex = ref(0)
const mediaIndex = ref(0)
const formKey = ref(0)

const review = computed(() => items.value[reviewIndex.value])
const media = computed(() => review.value?.media ?? [])
const current = computed(() => media.value[mediaIndex.value])

function flatten(list: Review[]): Review[] {
  return list.flatMap(item => [item, ...flatten(item.replies ?? [])])
}

async function fetchAll() {
  const all: Review[] = []
  let page = 1
  let total = 0
  do {
    const response = await reviewApi.getByProduct(props.productId, { page, limit: PAGE_LIMIT, sort: reviewStore.sort, filter: 'with_media' })
    all.push(...response.items)
    total = response.totalCount
    page++
  } while (all.length < total)
  return flatten(all).filter(item => item.media?.length)
}

// Loads all reviews with media and positions on the given review (keeps the clicked one if absent)
async function load(reviewId: number, fallback?: Review) {
  try {
    const list = await fetchAll()
    if (fallback && !list.some(item => item.id === reviewId)) list.unshift(fallback)
    items.value = list
    reviewIndex.value = Math.max(0, list.findIndex(item => item.id === reviewId))
  }
  catch {
    toast.error('Не вдалося завантажити відгуки')
  }
}

watch(open, (isOpen) => {
  if (!isOpen || !props.start) return
  items.value = [props.start.review]
  reviewIndex.value = 0
  mediaIndex.value = props.start.mediaIndex
  load(props.start.review.id, props.start.review)
})

const fullName = (item: Review) => [item.user.firstName, item.user.lastName].filter(Boolean).join(' ') || 'Анонім'

const formatDate = (value: string) => new Date(value).toLocaleString('uk-UA', {
  day: 'numeric',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
}).replace(',', '').replace(' о ', ' ')

// Перехід до відповіді з медіа (вона є в items після flatten)
function openReply(id: number, index: number) {
  const target = items.value.findIndex(item => item.id === id)
  if (target === -1) return
  reviewIndex.value = target
  mediaIndex.value = index
}

function step(delta: number) {
  const total = items.value.length
  if (total < 2) return
  reviewIndex.value = (reviewIndex.value + delta + total) % total
  mediaIndex.value = 0
}

function onKeydown(event: KeyboardEvent) {
  if (!open.value) return
  const target = event.target as HTMLElement | null
  if (target?.closest('input, textarea')) return
  if (event.key === 'ArrowLeft') step(-1)
  if (event.key === 'ArrowRight') step(1)
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))

async function onLike() {
  if (!review.value) return
  if (!authStore.isAuthenticated) return navigateTo('/login')
  try {
    await reviewStore.toggleLike(review.value)
  }
  catch {
    toast.error('Не вдалося поставити вподобання')
  }
}

async function onReply(dto: { text: string; media: File[] }) {
  const id = review.value!.id
  await reviewStore.reply(id, dto)
  toast.success('Відповідь опубліковано')
  formKey.value++
  emit('changed')
  await load(id)
}
</script>

<template>
  <BModal v-model="open" size="xl" headless>
    <div v-if="review" class="relative flex h-full flex-col md:flex-row">
      <BBtn
        variant="icon"
        class="absolute right-3 top-3 z-20 !size-10 rounded-full !bg-white text-secondary-900 shadow-md hover:!bg-secondary-100"
        aria-label="Закрити"
        title="Закрити (Esc)"
        @click="open = false"
      >
        <Icon name="lucide:x" class="size-6" />
      </BBtn>
      <div class="relative flex min-h-[50vh] flex-1 flex-col bg-secondary-100 md:min-h-0 md:basis-[70%]">
        <div class="relative flex min-h-0 flex-1 items-center justify-center">
          <template v-if="current">
            <video
              v-if="current.mediaType === 'VIDEO'"
              :key="current.id"
              :src="getFileUrl(current.file)"
              class="max-h-full max-w-full"
              controls
              autoplay
              muted
              playsinline
            />
            <img
              v-else
              :key="current.id"
              :src="getFileUrl(current.file, 'large')"
              :alt="fullName(review)"
              class="absolute inset-0 size-full object-contain"
            >
          </template>

          <template v-if="items.length > 1">
            <BBtn variant="icon" class="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white shadow" aria-label="Попередній відгук" @click="step(-1)">
              <Icon name="lucide:chevron-left" class="size-5" />
            </BBtn>
            <BBtn variant="icon" class="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white shadow" aria-label="Наступний відгук" @click="step(1)">
              <Icon name="lucide:chevron-right" class="size-5" />
            </BBtn>
          </template>
        </div>

        <div v-if="media.length > 1" class="flex justify-center gap-2 overflow-x-auto px-3 pt-2">
          <button
            v-for="(item, i) in media"
            :key="item.id"
            type="button"
            class="relative size-14 shrink-0 overflow-hidden rounded-md border-2"
            :class="i === mediaIndex ? 'border-secondary-900' : 'border-transparent opacity-60 hover:opacity-100'"
            @click="mediaIndex = i"
          >
            <template v-if="item.mediaType === 'VIDEO'">
              <video :src="getFileUrl(item.file)" class="size-full object-cover" muted preload="metadata" />
              <Icon name="lucide:play" class="absolute inset-0 m-auto size-5 text-white" />
            </template>
            <img v-else :src="getFileUrl(item.file, 'thumb')" :alt="fullName(review)" class="size-full object-cover">
          </button>
        </div>

        <div class="py-2 text-center text-sm text-secondary-600">
          Відгук {{ reviewIndex + 1 }} з {{ items.length }}
        </div>
      </div>

      <aside class="flex min-h-0 flex-col gap-3 overflow-y-auto bg-white p-4 pr-14 md:basis-[30%]">
        <header class="flex items-center gap-3">
          <BAvatar :src="review.user.avatar?.thumb ?? undefined" :alt="fullName(review)" size="md" />
          <div class="flex flex-col">
            <span class="text-sm font-semibold text-secondary-900">{{ fullName(review) }}</span>
            <span class="text-xs text-secondary-500">{{ formatDate(review.createdAt) }}</span>
          </div>
        </header>

        <BRating
          v-if="review.depth === 0 && review.rating !== null"
          :model-value="review.rating"
          readonly
          size="sm"
        />

        <p class="whitespace-pre-line text-sm leading-relaxed text-secondary-700">
          {{ review.text }}
        </p>

        <div class="flex justify-end">
          <BBtn variant="ghost" size="sm" :class="review.likedByMe ? 'text-danger' : ''" @click="onLike">
            <Icon name="lucide:heart" class="size-4" /> {{ review.likesCount }}
          </BBtn>
        </div>

        <div v-if="review.replies?.length" class="flex flex-col gap-2 border-t border-secondary-100 pt-3">
          <div v-for="reply in review.replies" :key="reply.id" class="rounded-lg bg-secondary-50 p-2">
            <div class="flex flex-wrap items-baseline gap-x-2">
              <span class="text-xs font-semibold text-secondary-900">{{ fullName(reply) }}</span>
              <span class="text-xs text-secondary-500">{{ formatDate(reply.createdAt) }}</span>
            </div>
            <p class="whitespace-pre-line text-sm text-secondary-700">
              {{ reply.text }}
            </p>
            <div v-if="reply.media?.length" class="mt-2 flex flex-wrap gap-1.5">
              <button
                v-for="(item, i) in reply.media"
                :key="item.id"
                type="button"
                class="relative size-12 overflow-hidden rounded-md border border-secondary-200"
                @click="openReply(reply.id, i)"
              >
                <video v-if="item.mediaType === 'VIDEO'" :src="getFileUrl(item.file)" class="size-full object-cover" muted preload="metadata" />
                <img v-else :src="getFileUrl(item.file, 'thumb')" :alt="fullName(reply)" class="size-full object-cover">
                <Icon v-if="item.mediaType === 'VIDEO'" name="lucide:play" class="absolute inset-0 m-auto size-4 text-white" />
              </button>
            </div>
          </div>
        </div>

        <div class="mt-auto border-t border-secondary-100 pt-3">
          <ReviewInlineForm
            v-if="authStore.isAuthenticated"
            :key="`${review.id}-${formKey}`"
            submit-label="Відповісти"
            :action="onReply"
            @cancel="formKey++"
          />
          <NuxtLink v-else to="/login" class="text-sm text-primary-600 hover:underline">
            Увійдіть, щоб відповісти
          </NuxtLink>
        </div>
      </aside>
    </div>
  </BModal>
</template>
