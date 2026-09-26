<script setup lang="ts">
import { adminApi, getAdminError, type AdminReview } from '~/modules/admin/adminApi'
import { getFileUrl } from '~/modules/common/helpers/fileUrl'
import { reviewApi } from '~/modules/review/reviewApi'
import ReviewInlineForm from '~/modules/review/components/ReviewInlineForm.vue'
definePageMeta({ layout: 'admin', middleware: 'admin' })
const toast = useToast(); const reviews = ref<AdminReview[]>([]); const status = ref(''); const replyDialog = ref(false); const replyId = ref<number | null>(null)
const statusOptions = [{ label: 'Усі', value: '' }, { label: 'Опубліковані', value: 'APPROVED' }, { label: 'Приховані', value: 'REJECTED' }]
// Сторінки 2–3 підвантажуються скролом, далі — кнопкою «Завантажити ще»
const AUTO_PAGES = 3; const page = ref(1); const totalPages = ref(0); const loading = ref(false); const sentinel = ref<HTMLElement | null>(null); const sentinelVisible = ref(false)
const hasMore = computed(() => page.value < totalPages.value)
async function fetchPage(p: number) { loading.value = true; try { const res = await adminApi.reviews({ status: status.value || undefined, page: p }); reviews.value = p > 1 ? [...reviews.value, ...res.items] : res.items; page.value = p; totalPages.value = res.totalPages } catch (e) { toast.error(getAdminError(e)) } finally { loading.value = false } }
const load = () => fetchPage(1)
function loadMore() { if (!loading.value && hasMore.value) fetchPage(page.value + 1) }
useIntersectionObserver(sentinel, ([entry]) => { sentinelVisible.value = !!entry?.isIntersecting })
watch([sentinelVisible, loading], () => { if (sentinelVisible.value && !loading.value && page.value < AUTO_PAGES) loadMore() })
async function setStatus(id: number, value: AdminReview['status']) { try { await adminApi.updateReviewStatus(id, value); const item = reviews.value.find(r => r.id === id); if (item) item.status = value; toast.success(value === 'REJECTED' ? 'Відгук приховано' : 'Відгук опубліковано') } catch (e) { toast.error(getAdminError(e)) } }
function openReply(id: number) { replyId.value = id; replyDialog.value = true }
// Відповідь магазину — той самий ендпоінт і форма, що й на сайті (текст + медіа)
async function reply(dto: { text: string, media: File[] }) { if (!replyId.value) return; await reviewApi.reply(replyId.value, { text: dto.text, media: dto.media }); replyDialog.value = false; await load(); toast.success('Відповідь опубліковано') }
const byId = computed(() => new Map(reviews.value.map(r => [r.id, r])))
await load()
</script>

<template>
  <div class="mx-auto max-w-6xl space-y-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:justify-between">
      <div>
        <h1 class="text-3xl font-bold">Відгуки</h1>
        <p class="text-sm text-secondary-500">Відгуки публікуються одразу — тут можна приховати, відповісти або перейти до товару.</p>
      </div>
      <BSelect v-model="status" class="w-full sm:w-48" :options="statusOptions" @update:model-value="load" />
    </div>

    <article v-for="review in reviews" :key="review.id" class="rounded-xl border border-secondary-200 bg-white p-5">
      <div class="flex flex-wrap justify-between gap-3">
        <div>
          <NuxtLink :to="`/product/${review.product?.slug}#reviews`" target="_blank" class="font-bold hover:text-primary-600 hover:underline">{{ review.product?.name }}</NuxtLink>
          <p class="text-xs text-secondary-500">{{ review.user?.email }} · {{ new Date(review.createdAt).toLocaleString('uk-UA') }}</p>
        </div>
        <BRating v-if="review.rating !== null" :model-value="review.rating" readonly size="sm" />
      </div>
      <p v-if="review.parentId" class="mt-3 border-l-2 border-secondary-200 pl-3 text-xs text-secondary-500">
        Відповідь на #{{ review.parentId }}<template v-if="byId.get(review.parentId)">: «{{ byId.get(review.parentId)!.text }}»</template>
      </p>
      <p class="my-4 text-sm">{{ review.text }}</p>
      <div v-if="review.media?.length" class="mb-4 flex flex-wrap gap-2">
        <a v-for="m in review.media" :key="m.id" :href="getFileUrl(m.file)" target="_blank" rel="noopener" class="block size-20 overflow-hidden rounded-lg bg-secondary-100">
          <video v-if="m.mediaType === 'VIDEO'" :src="getFileUrl(m.file)" class="size-full object-cover" muted preload="metadata" />
          <img v-else :src="getFileUrl(m.file, 'thumb')" class="size-full object-cover" alt="">
        </a>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <BBtn v-if="review.status === 'REJECTED'" variant="outline" size="sm" @click="setStatus(review.id, 'APPROVED')"><Icon name="lucide:eye" size="16" /> Показати</BBtn>
        <BBtn v-else variant="outline" size="sm" @click="setStatus(review.id, 'REJECTED')"><Icon name="lucide:eye-off" size="16" /> Приховати</BBtn>
        <BBtn variant="outline" size="sm" :disabled="review.status === 'REJECTED'" @click="openReply(review.id)"><Icon name="lucide:reply" size="16" /> Відповісти</BBtn>
        <BBtn variant="ghost" size="sm" :to="`/product/${review.product?.slug}#reviews`" target="_blank"><Icon name="lucide:external-link" size="16" /> До товару</BBtn>
        <BTag :variant="review.status === 'REJECTED' ? 'secondary' : 'success'" size="sm" class="ml-auto">{{ review.status === 'REJECTED' ? 'Приховано' : 'Опубліковано' }}</BTag>
      </div>
    </article>

    <div ref="sentinel" />
    <div v-if="loading" class="flex justify-center py-4"><BSpinner /></div>
    <div v-else-if="hasMore && page >= AUTO_PAGES" class="flex justify-center"><BBtn variant="outline" @click="loadMore">Завантажити ще</BBtn></div>

    <BEmptyState v-if="!reviews.length && !loading" title="Відгуків немає" />

    <BModal v-model="replyDialog" title="Відповідь магазину">
      <ReviewInlineForm v-if="replyDialog" submit-label="Опублікувати" :action="reply" @cancel="replyDialog = false" />
    </BModal>
  </div>
</template>
