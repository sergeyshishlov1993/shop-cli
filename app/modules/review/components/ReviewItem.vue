<script setup lang="ts">
import { getFileUrl } from '~/modules/common/helpers/fileUrl'
import { useAuthStore } from '~/modules/auth/authStore'
import { useReviewStore } from '~/modules/review/reviewStore'
import { useConfirm } from '~/modules/ui/composables/useConfirm'
import { useToast } from '~/modules/ui/composables/useToast'
import ReviewInlineForm from '~/modules/review/components/ReviewInlineForm.vue'

interface Props {
  review: Review
}

const props = defineProps<Props>()

const emit = defineEmits<{
  changed: []
}>()

const fullName = computed(() => {
  const { firstName, lastName } = props.review.user
  return [firstName, lastName].filter(Boolean).join(' ') || 'Анонім'
})

const authStore = useAuthStore()
const reviewStore = useReviewStore()
const toast = useToast()

// Provided by ReviewsList — one shared media viewer for all reviews
const openMediaViewer = inject<(review: Review, mediaIndex: number) => void>('openReviewMedia', () => {})

const mode = ref<'reply' | 'edit' | null>(null)
const isOwn = computed(() => authStore.user?.id === props.review.user.id)

async function onLike() {
  if (!authStore.isAuthenticated) return navigateTo('/login')
  try {
    await reviewStore.toggleLike(props.review)
  }
  catch {
    toast.error('Не вдалося поставити вподобання')
  }
}

async function onReply(dto: { text: string; media: File[] }) {
  await reviewStore.reply(props.review.id, dto)
  mode.value = null
  toast.success('Відповідь опубліковано')
  emit('changed')
}

async function onEdit(dto: { rating?: number; text: string; media: File[]; removeMediaIds: number[] }) {
  await reviewStore.update(props.review.id, dto)
  mode.value = null
  toast.success('Зміни збережено')
}

const { confirm } = useConfirm()

async function onDelete() {
  if (!(await confirm({ title: 'Видалити відгук?', message: 'Цю дію не можна скасувати.', confirmText: 'Видалити', variant: 'danger' }))) return
  try {
    await reviewStore.remove(props.review.id)
    toast.success('Відгук видалено')
  }
  catch {
    toast.error('Не вдалося видалити відгук')
  }
}

const formattedDate = computed(() => new Date(props.review.createdAt).toLocaleString('uk-UA', {
  day: 'numeric',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
}).replace(',', '').replace(' о ', ' '))
</script>

<template>
  <article
    class="flex flex-col gap-3 rounded-2xl p-4"
    :class="review.depth === 0 ? 'border border-secondary-200 bg-white' : 'bg-secondary-50'"
  >
    <header class="flex items-center gap-3">
      <BAvatar
        :src="review.user.avatar?.thumb ?? undefined"
        :alt="fullName"
        size="md"
      />
      <div class="flex flex-1 flex-wrap items-baseline gap-x-2">
        <span class="text-sm font-semibold text-secondary-900">{{ fullName }}</span>
        <span class="text-xs text-secondary-500">
          {{ formattedDate }}<template v-if="review.editedAt"> (змінено)</template>
        </span>
      </div>
      <BDropdown v-if="isOwn" align="right">
        <template #trigger>
          <BBtn variant="icon" size="sm" aria-label="Дії з відгуком">
            <Icon name="lucide:more-horizontal" class="size-4" />
          </BBtn>
        </template>
        <button type="button" class="flex w-full items-center gap-2 px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50" @click="mode = 'edit'">
          <Icon name="lucide:pencil" class="size-4" /> Редагувати
        </button>
        <button type="button" class="flex w-full items-center gap-2 px-4 py-2 text-sm text-danger hover:bg-secondary-50" @click="onDelete">
          <Icon name="lucide:trash-2" class="size-4" /> Видалити
        </button>
      </BDropdown>
    </header>

    <BRating
      v-if="review.depth === 0 && review.rating !== null && mode !== 'edit'"
      :model-value="review.rating"
      readonly
      size="sm"
    />

    <ReviewInlineForm
      v-if="mode === 'edit'"
      :initial="review"
      :with-rating="review.depth === 0"
      submit-label="Зберегти"
      :action="onEdit"
      @cancel="mode = null"
    />
    <p v-else class="text-sm leading-relaxed text-secondary-700">
      {{ review.text }}
    </p>

    <div v-if="review.media?.length" class="flex flex-wrap gap-2">
      <button
        v-for="(item, index) in review.media"
        :key="item.id"
        type="button"
        class="size-20 overflow-hidden rounded-lg border border-secondary-200"
        @click="openMediaViewer(review, index)"
      >
        <video
          v-if="item.mediaType === 'VIDEO'"
          :src="getFileUrl(item.file)"
          class="size-full object-cover"
          muted
          preload="metadata"
        />
        <img
          v-else
          :src="getFileUrl(item.file, 'thumb')"
          :alt="fullName"
          class="size-full object-cover"
          loading="lazy"
        >
      </button>
    </div>

    <div class="flex items-center justify-between gap-4 text-sm text-secondary-500">
      <BBtn
        v-if="authStore.isAuthenticated"
        variant="ghost"
        size="sm"
        @click="mode = mode === 'reply' ? null : 'reply'"
      >
        <Icon name="lucide:reply" class="size-4" /> Відповісти
      </BBtn>
      <BBtn
        variant="ghost"
        size="sm"
        class="ml-auto"
        :class="review.likedByMe ? 'text-danger' : ''"
        @click="onLike"
      >
        <Icon name="lucide:heart" class="size-4" /> {{ review.likesCount }}
      </BBtn>
    </div>

    <ReviewInlineForm
      v-if="mode === 'reply'"
      submit-label="Відповісти"
      :action="onReply"
      @cancel="mode = null"
    />

    <div v-if="review.replies?.length" class="flex flex-col gap-3 pl-4 sm:pl-8">
      <ReviewItem
        v-for="reply in review.replies"
        :key="reply.id"
        :review="reply"
        @changed="emit('changed')"
      />
    </div>
  </article>
</template>
