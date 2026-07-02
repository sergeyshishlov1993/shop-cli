<script setup lang="ts">
interface Props {
  review: Review
}

const props = defineProps<Props>()

const fullName = computed(() => {
  const { firstName, lastName } = props.review.user
  return [firstName, lastName].filter(Boolean).join(' ') || 'Анонім'
})

const formattedDate = computed(() => {
  return new Date(props.review.createdAt).toLocaleDateString('uk-UA', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
})
</script>

<template>
  <article class="flex flex-col gap-3 rounded-2xl border border-secondary-200 bg-white p-4">
    <header class="flex items-center gap-3">
      <BAvatar
        :src="review.user.avatarFile?.url"
        :alt="fullName"
        size="md"
      />
      <div class="flex flex-1 flex-col">
        <span class="text-sm font-medium text-secondary-900">{{ fullName }}</span>
        <span class="text-xs text-secondary-500">{{ formattedDate }}</span>
      </div>
      <BRating
        v-if="review.rating !== null"
        :model-value="review.rating"
        readonly
        size="sm"
      />
    </header>

    <p class="text-sm leading-relaxed text-secondary-700">
      {{ review.text }}
    </p>

    <div v-if="review.replies.length" class="flex flex-col gap-3 border-l-2 border-secondary-100 pl-4">
      <ReviewItem
        v-for="reply in review.replies"
        :key="reply.id"
        :review="reply"
      />
    </div>
  </article>
</template>
