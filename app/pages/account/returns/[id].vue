<script setup lang="ts">
import ReturnProgress from '~/modules/returns/components/ReturnProgress.vue'
import { getApiError, returnFlow, returnFlowLabels, returnReasonLabels, returnsApi, returnStatusLabels, returnStatusVariants } from '~/modules/returns/returns'
import ReturnThumb from '~/modules/returns/components/ReturnThumb.vue'
import { useConfirm } from '~/modules/ui/composables/useConfirm'

definePageMeta({ layout: 'account', middleware: ['auth', 'returns-enabled'] })

const route = useRoute()
const toast = useToast()
const { confirm } = useConfirm()
const id = Number(route.params.id)

const { data: ret, error } = await useAsyncData(`account-return-${id}`, () => returnsApi.get(id))
useSeoMeta({ title: () => ret.value ? `Повернення ${ret.value.number}` : 'Повернення', robots: 'noindex, nofollow' })

const busy = ref(false)
const tracking = ref('')

const isTerminalFail = computed(() => ret.value?.status === 'REJECTED' || ret.value?.status === 'CANCELLED')
const currentStep = computed(() => {
  if (!ret.value) return -1
  if (!isTerminalFail.value) return returnFlow.indexOf(ret.value.status)
  // last happy-path status reached before rejection/cancel
  const reached = ret.value.history.map(h => returnFlow.indexOf(h.status)).filter(i => i >= 0)
  return reached.length ? Math.max(...reached) : 0
})
function stepDate(status: string) {
  const entry = ret.value?.history.find(h => h.status === status)
  return entry ? new Date(entry.createdAt).toLocaleDateString('uk-UA') : ''
}
const total = computed(() => ret.value?.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0) ?? 0)

async function cancel() {
  if (!ret.value) return
  if (!(await confirm({ title: 'Скасувати заявку?', message: 'Заявку на повернення буде скасовано. Ви зможете подати нову, поки не минув строк повернення.', confirmText: 'Скасувати заявку', cancelText: 'Ні', variant: 'warning' }))) return
  busy.value = true
  try { ret.value = await returnsApi.cancel(ret.value.id); toast.success('Заявку скасовано') }
  catch (e) { toast.error(getApiError(e, 'Не вдалося скасувати заявку')) }
  finally { busy.value = false }
}

async function saveTracking() {
  if (!ret.value || !tracking.value.trim()) return
  busy.value = true
  try { ret.value = await returnsApi.setTracking(ret.value.id, tracking.value.trim()); toast.success('Номер ТТН збережено') }
  catch (e) { toast.error(getApiError(e, 'Не вдалося зберегти ТТН')) }
  finally { busy.value = false }
}
</script>

<template>
  <div class="store-page store-container py-6 lg:py-10">
    <NuxtLink to="/account/returns" class="mb-4 inline-flex items-center gap-1 text-sm text-secondary-600 hover:text-primary-700"><Icon name="lucide:arrow-left" size="16" /> Усі повернення</NuxtLink>

    <BEmptyState v-if="error || !ret" title="Заявку не знайдено" description="Можливо, її було видалено або посилання неправильне.">
      <template #action><BBtn to="/account/returns">До списку повернень</BBtn></template>
    </BEmptyState>

    <div v-else class="space-y-5">
      <header class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 class="store-title text-2xl lg:text-3xl">{{ ret.number }}</h1>
          <p class="mt-1 text-sm text-secondary-500">
            від {{ new Date(ret.createdAt).toLocaleDateString('uk-UA') }} · замовлення
            <NuxtLink :to="`/account/orders?orderNumber=${encodeURIComponent(ret.order.orderNumber)}`" class="text-primary-700 hover:underline">№ {{ ret.order.orderNumber }}</NuxtLink>
          </p>
        </div>
        <BBadge :variant="returnStatusVariants[ret.status]">{{ returnStatusLabels[ret.status] }}</BBadge>
      </header>

      <!-- Timeline -->
      <section class="glass rounded-xl p-4 sm:p-5" aria-label="Статус заявки">
        <ReturnProgress :status="ret.status" class="mb-5" />
        <ol class="grid gap-3 sm:grid-cols-5">
          <li v-for="(step, i) in returnFlow" :key="step" class="flex items-center gap-3 sm:flex-col sm:items-start sm:gap-2">
            <span
              class="flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
              :class="i <= currentStep ? 'bg-primary-500 text-white' : 'bg-secondary-100 text-secondary-500'"
            >
              <Icon v-if="i < currentStep || (i === currentStep && ret.status === 'REFUNDED')" name="lucide:check" size="16" />
              <template v-else>{{ i + 1 }}</template>
            </span>
            <div class="text-sm">
              <p :class="i === currentStep && !isTerminalFail ? 'font-semibold text-secondary-900' : 'text-secondary-600'">{{ returnFlowLabels[step] }}</p>
              <p v-if="stepDate(step)" class="text-xs text-secondary-500">{{ stepDate(step) }}</p>
            </div>
          </li>
        </ol>
        <div v-if="isTerminalFail" class="mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          <Icon name="lucide:circle-x" size="18" class="mt-0.5 shrink-0" />
          <div>
            <p class="font-semibold">{{ returnStatusLabels[ret.status] }}</p>
            <p v-if="ret.rejectReason">{{ ret.rejectReason }}</p>
          </div>
        </div>
      </section>

      <!-- Tracking form -->
      <section v-if="ret.status === 'APPROVED'" class="rounded-xl border border-primary-200 bg-primary-50 p-4 sm:p-5">
        <div class="flex items-start gap-3">
          <Icon name="lucide:truck" size="20" class="mt-0.5 shrink-0 text-primary-700" />
          <div class="min-w-0 flex-1">
            <h2 class="font-semibold text-secondary-900">Заявку схвалено</h2>
            <p class="mt-1 text-sm text-secondary-700">Відправте посилку Новою Поштою на адресу магазину, вкажіть номер ТТН.</p>
            <form class="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end" @submit.prevent="saveTracking">
              <BInput v-model="tracking" label="Номер ТТН" :placeholder="ret.trackingNumber || '20450000000000'" class="flex-1" />
              <BBtn type="submit" :loading="busy" :disabled="!tracking.trim()">{{ ret.trackingNumber ? 'Оновити' : 'Зберегти' }}</BBtn>
            </form>
            <p v-if="ret.trackingNumber" class="mt-2 text-sm text-secondary-600">Збережена ТТН: <b>{{ ret.trackingNumber }}</b></p>
          </div>
        </div>
      </section>
      <p v-else-if="ret.trackingNumber" class="text-sm text-secondary-600">ТТН посилки: <b>{{ ret.trackingNumber }}</b></p>

      <div class="grid gap-5 lg:grid-cols-[1fr_320px]">
        <section class="glass rounded-xl p-4 sm:p-5">
          <h2 class="mb-3 font-semibold text-secondary-900">Товари</h2>
          <ul class="divide-y divide-secondary-200">
            <li v-for="item in ret.items" :key="item.id" class="flex items-center gap-3 py-3">
              <ReturnThumb :image="item.image" :alt="item.productName" />
              <div class="min-w-0 flex-1 text-sm">
                <p class="font-medium text-secondary-900">{{ item.productName }}</p>
                <p class="text-secondary-500">{{ [item.sizeName, item.colorName, `${item.quantity} шт.`].filter(Boolean).join(' · ') }}</p>
              </div>
              <strong class="text-sm">{{ formatPrice(item.unitPrice * item.quantity) }}</strong>
            </li>
          </ul>
          <p class="mt-3 text-right text-sm text-secondary-600">Вартість товарів: <b class="text-secondary-900">{{ formatPrice(total) }}</b></p>
        </section>

        <aside class="space-y-5">
          <section class="glass space-y-2 rounded-xl p-4 text-sm sm:p-5">
            <h2 class="font-semibold text-secondary-900">Повернення коштів</h2>
            <p><span class="text-secondary-500">Реквізити:</span> {{ ret.refundDetails }}</p>
            <p v-if="ret.refundAmount != null"><span class="text-secondary-500">Сума:</span> <b>{{ formatPrice(ret.refundAmount) }}</b></p>
          </section>
          <section v-if="ret.managerComment" class="glass rounded-xl p-4 text-sm sm:p-5">
            <h2 class="mb-1 font-semibold text-secondary-900">Коментар менеджера</h2>
            <p class="whitespace-pre-line text-secondary-700">{{ ret.managerComment }}</p>
          </section>
        </aside>
      </div>

      <section class="glass space-y-3 rounded-xl p-4 text-sm sm:p-5">
        <h2 class="font-semibold text-secondary-900">Ваша заявка</h2>
        <p><span class="text-secondary-500">Причина:</span> {{ returnReasonLabels[ret.reason] }}</p>
        <p v-if="ret.comment" class="whitespace-pre-line"><span class="text-secondary-500">Коментар:</span> {{ ret.comment }}</p>
        <div v-if="ret.photos.length" class="flex flex-wrap gap-2">
          <a v-for="photo in ret.photos" :key="photo.id" :href="getFileUrl(photo, 'large')" target="_blank" rel="noopener">
            <img :src="getFileUrl(photo, 'thumb')" alt="Фото товару" class="size-20 rounded-lg object-cover">
          </a>
        </div>
      </section>

      <section v-if="ret.history.length" class="glass rounded-xl p-4 text-sm sm:p-5">
        <h2 class="mb-2 font-semibold text-secondary-900">Історія</h2>
        <div v-for="h in ret.history" :key="h.id" class="border-l-2 border-secondary-200 py-1 pl-3">
          {{ returnStatusLabels[h.status] }} · {{ new Date(h.createdAt).toLocaleString('uk-UA') }}
          <p v-if="h.comment" class="text-secondary-500">{{ h.comment }}</p>
        </div>
      </section>

      <div v-if="ret.status === 'NEW'" class="flex justify-end">
        <BBtn variant="outline" :loading="busy" @click="cancel">Скасувати заявку</BBtn>
      </div>
    </div>
  </div>
</template>
