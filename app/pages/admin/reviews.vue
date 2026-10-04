<script setup lang="ts">
import { adminApi, getAdminError, type AdminReview } from '~/modules/admin/adminApi'
import AdminReviewNode from '~/modules/admin/components/AdminReviewNode.vue'
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
// Дерево з плоского списку: відповіді — під своїм відгуком (старші зверху).
// Відповідь, батько якої на ще не підвантаженій сторінці, тимчасово показується коренем з підписом «Відповідь на #N».
const childrenOf = computed(() => {
  const map = new Map<number, AdminReview[]>()
  for (const review of reviews.value) {
    if (!review.parentId || !byId.value.has(review.parentId)) continue
    if (!map.has(review.parentId)) map.set(review.parentId, [])
    map.get(review.parentId)!.push(review)
  }
  for (const list of map.values()) list.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  return map
})
const roots = computed(() => reviews.value.filter(r => !r.parentId || !byId.value.has(r.parentId)))
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

    <AdminReviewNode
      v-for="review in roots"
      :key="review.id"
      :review="review"
      :children-of="childrenOf"
      :orphan-parent-id="review.parentId"
      @status="setStatus"
      @reply="openReply"
    />

    <div ref="sentinel" />
    <div v-if="loading" class="flex justify-center py-4"><BSpinner /></div>
    <div v-else-if="hasMore && page >= AUTO_PAGES" class="flex justify-center"><BBtn variant="outline" @click="loadMore">Завантажити ще</BBtn></div>

    <BEmptyState v-if="!reviews.length && !loading" title="Відгуків немає" />

    <BModal v-model="replyDialog" title="Відповідь магазину">
      <ReviewInlineForm v-if="replyDialog" submit-label="Опублікувати" :action="reply" @cancel="replyDialog = false" />
    </BModal>
  </div>
</template>
