<script setup lang="ts">
import type { AdminReview } from '~/modules/admin/adminApi'
import { getFileUrl } from '~/modules/common/helpers/fileUrl'

// Вузол дерева відгуків в адмінці: картка + відповіді під нею (рекурсивно), гілку можна згорнути.
const props = defineProps<{
  review: AdminReview
  childrenOf: Map<number, AdminReview[]>
  /** Для відповіді, батька якої ще не підвантажено (інша сторінка) — показуємо, на що відповідь */
  orphanParentId?: number | null
}>()

const emit = defineEmits<{
  status: [id: number, value: AdminReview['status']]
  reply: [id: number]
}>()

const children = computed(() => props.childrenOf.get(props.review.id) ?? [])
function countReplies(id: number): number {
  return (props.childrenOf.get(id) ?? []).reduce((total, child) => total + 1 + countReplies(child.id), 0)
}
const repliesCount = computed(() => countReplies(props.review.id))
const repliesOpen = ref(false)
</script>

<template>
  <div class="flex flex-col gap-3">
    <article class="rounded-xl border border-secondary-200 bg-white p-5" :class="{ 'opacity-60': review.status === 'REJECTED' }">
      <div class="flex flex-wrap justify-between gap-3">
        <div>
          <NuxtLink :to="`/product/${review.product?.slug}#reviews`" target="_blank" class="font-bold hover:text-primary-600 hover:underline">{{ review.product?.name }}</NuxtLink>
          <p class="text-xs text-secondary-500">{{ review.user?.email }} · {{ new Date(review.createdAt).toLocaleString('uk-UA') }}</p>
        </div>
        <BRating v-if="review.rating !== null" :model-value="review.rating" readonly size="sm" />
      </div>
      <p v-if="orphanParentId" class="mt-3 border-l-2 border-secondary-200 pl-3 text-xs text-secondary-500">
        Відповідь на #{{ orphanParentId }}
      </p>
      <p class="my-4 text-sm">{{ review.text }}</p>
      <div v-if="review.media?.length" class="mb-4 flex flex-wrap gap-2">
        <a v-for="m in review.media" :key="m.id" :href="getFileUrl(m.file)" target="_blank" rel="noopener" class="block size-20 overflow-hidden rounded-lg bg-secondary-100">
          <video v-if="m.mediaType === 'VIDEO'" :src="getFileUrl(m.file)" class="size-full object-cover" muted preload="metadata" />
          <img v-else :src="getFileUrl(m.file, 'thumb')" class="size-full object-cover" alt="">
        </a>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <BBtn v-if="review.status === 'REJECTED'" variant="outline" size="sm" @click="emit('status', review.id, 'APPROVED')"><Icon name="lucide:eye" size="16" /> Показати</BBtn>
        <BBtn v-else variant="outline" size="sm" @click="emit('status', review.id, 'REJECTED')"><Icon name="lucide:eye-off" size="16" /> Приховати</BBtn>
        <BBtn variant="outline" size="sm" :disabled="review.status === 'REJECTED'" @click="emit('reply', review.id)"><Icon name="lucide:reply" size="16" /> Відповісти</BBtn>
        <BBtn v-if="repliesCount" variant="ghost" size="sm" :aria-expanded="repliesOpen" @click="repliesOpen = !repliesOpen">
          <Icon :name="repliesOpen ? 'lucide:chevron-up' : 'lucide:chevron-down'" size="16" />
          {{ repliesOpen ? 'Згорнути' : 'Показати' }} відповіді ({{ repliesCount }})
        </BBtn>
        <BBtn variant="ghost" size="sm" :to="`/product/${review.product?.slug}#reviews`" target="_blank"><Icon name="lucide:external-link" size="16" /> До товару</BBtn>
        <BTag :variant="review.status === 'REJECTED' ? 'secondary' : 'success'" size="sm" class="ml-auto">{{ review.status === 'REJECTED' ? 'Приховано' : 'Опубліковано' }}</BTag>
      </div>
    </article>

    <BCollapse v-if="children.length" :open="repliesOpen" gap="0.75rem">
      <div class="relative flex flex-col gap-3 pl-5 sm:pl-8">
        <!-- Лінія гілки: клік згортає відповіді -->
        <button
          type="button"
          class="group absolute inset-y-0 left-0 flex w-4 justify-center sm:w-6"
          :aria-label="`Згорнути відповіді (${repliesCount})`"
          title="Згорнути відповіді"
          @click="repliesOpen = false"
        >
          <span class="h-full w-0.5 rounded-full bg-secondary-200 transition-colors group-hover:bg-secondary-500" />
        </button>
        <AdminReviewNode
          v-for="child in children"
          :key="child.id"
          :review="child"
          :children-of="childrenOf"
          @status="(id, value) => emit('status', id, value)"
          @reply="id => emit('reply', id)"
        />
      </div>
    </BCollapse>
  </div>
</template>
