<script setup lang="ts">
import { getApiError, returnReasonLabels, returnsApi, type ReturnReason } from '~/modules/returns/returns'
import { rules, useFormValidation } from '~/modules/common/composables/useFormValidation'
import ReturnThumb from '~/modules/returns/components/ReturnThumb.vue'

definePageMeta({ layout: 'account', middleware: ['auth', 'returns-enabled'] })
useSeoMeta({ title: 'Оформлення повернення', robots: 'noindex, nofollow' })

const MAX_PHOTOS = 3
const route = useRoute()
const toast = useToast()
const orderId = Number(route.query.orderId)

const { data: eligibility, error } = await useAsyncData(`return-eligibility-${orderId}`, () => returnsApi.eligibility(orderId), { immediate: Number.isFinite(orderId) && orderId > 0 })

// orderItemId -> selected quantity (0 = not selected)
const selected = reactive<Record<number, number>>({})
const reason = ref<ReturnReason | ''>('')
const comment = ref('')
const refundDetails = ref('')
const photos = ref<Array<{ id: number, url: string }>>([])
const photoFile = ref<File | null>(null)
const uploading = ref(false)
const submitting = ref(false)

const returnable = computed(() => eligibility.value?.items.filter(i => i.returnableQty > 0) ?? [])
const chosen = computed(() => Object.entries(selected).filter(([, qty]) => qty > 0).map(([orderItemId, quantity]) => ({ orderItemId: Number(orderItemId), quantity })))
const refundTotal = computed(() => chosen.value.reduce((sum, c) => sum + c.quantity * (eligibility.value?.items.find(i => i.orderItemId === c.orderItemId)?.unitPrice ?? 0), 0))
const reasonOptions = [{ value: '', label: 'Оберіть причину' }, ...Object.entries(returnReasonLabels).map(([value, label]) => ({ value, label }))]

const { errors, validate, touch, applyServerErrors } = useFormValidation({
  items: [() => chosen.value, [rules.required('Оберіть хоча б один товар')]],
  reason: [() => reason.value, [rules.required('Оберіть причину')]],
  comment: [() => comment.value, [rules.maxLength(2000)]],
  refundDetails: [() => refundDetails.value, [rules.required('Вкажіть IBAN або номер картки'), rules.minLength(8, 'Вкажіть IBAN або номер картки'), rules.maxLength(64)]],
})

function toggle(orderItemId: number, on: boolean) {
  selected[orderItemId] = on ? 1 : 0
}
function step(orderItemId: number, delta: number, max: number) {
  selected[orderItemId] = Math.min(max, Math.max(1, (selected[orderItemId] ?? 0) + delta))
}

watch(photoFile, async (file) => {
  if (!file) return
  if (photos.value.length >= MAX_PHOTOS) { photoFile.value = null; return }
  uploading.value = true
  try { photos.value.push(await returnsApi.uploadPhoto(file)) }
  catch (e) { toast.error(getApiError(e, 'Не вдалося завантажити фото')) }
  finally { uploading.value = false; photoFile.value = null }
})

async function submit() {
  if (!validate()) return
  submitting.value = true
  try {
    const created = await returnsApi.create({
      orderId,
      items: chosen.value,
      reason: reason.value as ReturnReason,
      comment: comment.value.trim() || undefined,
      refundDetails: refundDetails.value.trim(),
      photoFileIds: photos.value.length ? photos.value.map(p => p.id) : undefined,
    })
    toast.success(`Заявку ${created.number} створено`)
    await navigateTo(`/account/returns/${created.id}`)
  }
  catch (e) {
    const rest = applyServerErrors(e)
    if (rest.length || !Object.values(errors).some(Boolean)) toast.error(rest.join('. ') || getApiError(e, 'Не вдалося створити заявку'))
  }
  finally { submitting.value = false }
}
</script>

<template>
  <div class="store-page store-container py-6 lg:py-10">
    <NuxtLink to="/account/orders" class="mb-4 inline-flex items-center gap-1 text-sm text-secondary-600 hover:text-primary-700"><Icon name="lucide:arrow-left" size="16" /> Мої замовлення</NuxtLink>
    <h1 class="store-title mb-6 text-2xl lg:text-3xl">Оформлення повернення</h1>

    <BEmptyState v-if="error || !eligibility" title="Замовлення не знайдено" description="Оберіть замовлення зі списку, щоб оформити повернення.">
      <template #action><BBtn to="/account/orders">Мої замовлення</BBtn></template>
    </BEmptyState>

    <BEmptyState v-else-if="!eligibility.eligible || !returnable.length" title="Повернення недоступне" :description="eligibility.reason || 'Усі товари з цього замовлення вже повернено або заявлено до повернення.'">
      <template #action><BBtn to="/account/returns" variant="outline">Мої повернення</BBtn></template>
    </BEmptyState>

    <form v-else class="grid gap-5 lg:grid-cols-[1fr_340px]" novalidate @submit.prevent="submit">
      <div class="space-y-5">
        <section class="glass rounded-xl p-4 sm:p-5">
          <h2 class="font-semibold text-secondary-900">Що повертаємо?</h2>
          <p v-if="eligibility.deadline" class="mt-1 text-sm text-secondary-500">Повернення можливе до {{ new Date(eligibility.deadline).toLocaleDateString('uk-UA') }}</p>
          <ul class="mt-3 divide-y divide-secondary-200">
            <li v-for="item in returnable" :key="item.orderItemId" class="flex flex-wrap items-center gap-3 py-3">
              <BCheckbox :model-value="(selected[item.orderItemId] ?? 0) > 0" :aria-label="`Повернути ${item.productName}`" @update:model-value="toggle(item.orderItemId, $event)" />
              <ReturnThumb :image="item.image" :alt="item.productName" />
              <div class="min-w-0 flex-1 text-sm">
                <p class="font-medium text-secondary-900">{{ item.productName }}</p>
                <p class="text-secondary-500">{{ [item.sizeName, item.colorName].filter(Boolean).join(' · ') || '—' }} · {{ formatPrice(item.unitPrice) }}</p>
                <p class="text-xs text-secondary-500">Можна повернути: {{ item.returnableQty }} з {{ item.quantity }}</p>
              </div>
              <div v-if="(selected[item.orderItemId] ?? 0) > 0" class="flex items-center rounded-full border border-secondary-200">
                <button type="button" class="flex size-9 items-center justify-center text-secondary-700 disabled:opacity-40" aria-label="Менше" :disabled="selected[item.orderItemId]! <= 1" @click="step(item.orderItemId, -1, item.returnableQty)"><Icon name="lucide:minus" size="16" /></button>
                <span class="w-8 text-center text-sm font-semibold" aria-live="polite">{{ selected[item.orderItemId] }}</span>
                <button type="button" class="flex size-9 items-center justify-center text-secondary-700 disabled:opacity-40" aria-label="Більше" :disabled="selected[item.orderItemId]! >= item.returnableQty" @click="step(item.orderItemId, 1, item.returnableQty)"><Icon name="lucide:plus" size="16" /></button>
              </div>
            </li>
          </ul>
          <p v-if="errors.items" class="b-field__error mt-2">{{ errors.items }}</p>
        </section>

        <section class="glass space-y-4 rounded-xl p-4 sm:p-5">
          <BSelect v-model="reason" label="Причина повернення" :options="reasonOptions" :error="errors.reason" required />
          <BTextarea v-model="comment" label="Коментар (необовʼязково)" placeholder="Опишіть, що саме не так" :error="errors.comment" />
          <div>
            <p class="mb-2 text-sm font-medium text-secondary-700">Фото (до {{ MAX_PHOTOS }})</p>
            <div class="flex flex-wrap gap-2">
              <div v-for="(photo, idx) in photos" :key="photo.id" class="relative">
                <img :src="getPublicMediaUrl(photo.url)" alt="Фото товару" class="size-20 rounded-lg object-cover">
                <button type="button" class="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-secondary-900 text-white" aria-label="Видалити фото" @click="photos.splice(idx, 1)"><Icon name="lucide:x" size="14" /></button>
              </div>
            </div>
            <BFile v-if="photos.length < MAX_PHOTOS" v-model="photoFile" accept="image/*" :disabled="uploading" :button-text="uploading ? 'Завантаження…' : 'Додати фото'" class="mt-2" />
          </div>
        </section>
      </div>

      <aside class="glass h-fit space-y-4 rounded-xl p-4 sm:p-5 lg:sticky lg:top-24">
        <BInput v-model="refundDetails" label="IBAN або номер картки" placeholder="UA… або 4149 …" :error="errors.refundDetails" required @blur="touch('refundDetails')" />
        <p class="text-xs text-secondary-500">Кошти повернемо на ці реквізити після отримання та перевірки товару.</p>
        <p class="flex justify-between text-sm"><span class="text-secondary-500">Вартість обраних товарів</span><b>{{ formatPrice(refundTotal) }}</b></p>
        <BBtn type="submit" class="w-full" :loading="submitting" :disabled="uploading">Надіслати заявку</BBtn>
      </aside>
    </form>
  </div>
</template>
