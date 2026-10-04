<script setup lang="ts">
import { adminReturnsApi, getAdminError } from '~/modules/admin/adminApi'
import { returnReasonLabels, returnStatusLabels, returnStatusVariants, returnTransitions, type ReturnDetail, type ReturnStatus } from '~/modules/returns/returns'
import ReturnThumb from '~/modules/returns/components/ReturnThumb.vue'
import { useConfirm } from '~/modules/ui/composables/useConfirm'
import { useToast } from '~/modules/ui/composables/useToast'
import { rules, useFormValidation } from '~/modules/common/composables/useFormValidation'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const route = useRoute()
const toast = useToast()
const { confirm } = useConfirm()
const id = Number(route.params.id)

const ret = ref<ReturnDetail | null>(null)
const isLoading = ref(true)
const saving = ref(false)
const form = reactive({ status: '' as ReturnStatus | '', comment: '', managerComment: '', rejectReason: '', refundAmount: '' as string | number })

useSeoMeta({ title: () => ret.value ? `Повернення ${ret.value.number}` : 'Повернення' })

const itemsTotal = computed(() => ret.value?.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0) ?? 0)
const nextStatuses = computed(() => ret.value ? returnTransitions[ret.value.status] : [])
// Із «Отримано» назад у «Схвалено» — це відкат помилки, підписуємо окремо
const isRollback = (s: string) => ret.value?.status === 'RECEIVED' && s === 'APPROVED'
const statusOptions = computed(() => [{ value: '', label: 'Оберіть новий статус' }, ...nextStatuses.value.map(s => ({ value: s, label: isRollback(s) ? '↩ Скасувати «Отримано» (помилка)' : returnStatusLabels[s] }))])
const refundNumber = computed(() => Number(String(form.refundAmount).replace(',', '.')))
const { errors, validate, touch, reset, applyServerErrors } = useFormValidation({
  status: [() => form.status, [rules.required('Оберіть новий статус')]],
  rejectReason: [() => form.rejectReason, [v => (form.status === 'REJECTED' ? rules.required('Вкажіть причину відмови')(v) : ''), rules.maxLength(2000)]],
  refundAmount: [() => form.refundAmount, [v => (form.status === 'REFUNDED' ? rules.required('Вкажіть суму повернення')(v) : ''), rules.number(), rules.positive()]],
  comment: [() => form.comment, [rules.maxLength(2000)]],
  managerComment: [() => form.managerComment, [rules.maxLength(2000)]],
})

function resetForm(r: ReturnDetail) {
  Object.assign(form, { status: '', comment: '', rejectReason: '', managerComment: r.managerComment || '', refundAmount: r.refundAmount ?? itemsTotal.value })
  reset()
}

async function load() {
  isLoading.value = true
  try { ret.value = await adminReturnsApi.get(id); resetForm(ret.value) }
  catch (e) { toast.error(getAdminError(e, 'Не вдалося завантажити заявку')) }
  finally { isLoading.value = false }
}

async function submit() {
  if (!ret.value || !validate() || !form.status) return
  const status = form.status
  if (isRollback(status)) {
    if (!(await confirm({ title: 'Скасувати «Отримано на складі»?', message: 'Заявка повернеться в статус «Схвалено», а додані на склад залишки буде списано назад.', confirmText: 'Скасувати отримання', variant: 'warning' }))) return
  }
  else if (status === 'REJECTED' || status === 'REFUNDED') {
    if (!(await confirm(status === 'REJECTED'
      ? { title: 'Відхилити заявку?', message: `Заявку ${ret.value.number} буде відхилено, клієнт отримає лист із причиною.${ret.value.status === 'RECEIVED' ? ' Залишки, додані при отриманні, буде списано назад.' : ''}`, confirmText: 'Відхилити', variant: 'danger' }
      : { title: 'Підтвердити повернення коштів?', message: `Буде зафіксовано повернення ${formatPrice(refundNumber.value)} та створено витрату.`, confirmText: 'Гроші повернено', variant: 'warning' }))) return
  }
  saving.value = true
  try {
    ret.value = await adminReturnsApi.updateStatus(ret.value.id, {
      status,
      comment: form.comment.trim() || undefined,
      managerComment: form.managerComment.trim() || undefined,
      rejectReason: status === 'REJECTED' ? form.rejectReason.trim() : undefined,
      refundAmount: status === 'REFUNDED' ? refundNumber.value : undefined,
    })
    useState('admin-badges-tick', () => 0).value++
    resetForm(ret.value)
    toast.success(`Статус: ${returnStatusLabels[ret.value.status]}`)
  }
  catch (e) {
    const rest = applyServerErrors(e)
    if (rest.length || !Object.values(errors).some(Boolean)) toast.error(getAdminError(e))
  }
  finally { saving.value = false }
}

async function copyDetails() {
  if (!ret.value) return
  try { await navigator.clipboard.writeText(ret.value.refundDetails); toast.success('Реквізити скопійовано') }
  catch { toast.error('Не вдалося скопіювати') }
}

onMounted(load)
</script>

<template>
  <div class="mx-auto max-w-7xl space-y-6">
    <NuxtLink to="/admin/returns" class="inline-flex items-center gap-1 text-sm text-secondary-600 hover:text-primary-700"><Icon name="lucide:arrow-left" size="16" /> Усі повернення</NuxtLink>

    <div v-if="isLoading && !ret" class="flex justify-center py-20"><BSpinner size="lg" /></div>
    <div v-else-if="!ret" class="rounded-xl border border-secondary-200 bg-white p-10 text-center text-secondary-500">Заявку не знайдено</div>

    <template v-else>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 class="text-2xl font-bold text-secondary-900 sm:text-3xl">{{ ret.number }}</h1>
          <p class="mt-1 text-sm text-secondary-500">
            {{ new Date(ret.createdAt).toLocaleString('uk-UA') }} · замовлення
            <NuxtLink :to="`/admin/orders?search=${encodeURIComponent(ret.order.orderNumber)}`" class="text-primary-700 hover:underline">{{ ret.order.orderNumber }}</NuxtLink>
          </p>
        </div>
        <BBadge :variant="returnStatusVariants[ret.status]">{{ returnStatusLabels[ret.status] }}</BBadge>
      </div>

      <div class="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,.7fr)]" :aria-busy="saving">
        <div class="space-y-6">
          <section class="rounded-xl border border-secondary-200 bg-white p-4 sm:p-5">
            <h2 class="mb-3 font-semibold text-secondary-900">Товари</h2>
            <ul class="divide-y divide-secondary-100">
              <li v-for="item in ret.items" :key="item.id" class="flex items-center gap-3 py-3">
                <ReturnThumb :image="item.image" :alt="item.productName" />
                <div class="min-w-0 flex-1 text-sm">
                  <p class="font-medium text-secondary-900">{{ item.productName }}</p>
                  <p class="text-secondary-500">{{ [item.sizeName, item.colorName].filter(Boolean).join(' · ') || '—' }} · {{ item.quantity }} × {{ formatPrice(item.unitPrice) }}</p>
                </div>
                <strong class="text-sm">{{ formatPrice(item.unitPrice * item.quantity) }}</strong>
              </li>
            </ul>
            <p class="mt-3 text-right text-sm">Разом: <b>{{ formatPrice(itemsTotal) }}</b></p>
          </section>

          <section class="space-y-3 rounded-xl border border-secondary-200 bg-white p-4 text-sm sm:p-5">
            <h2 class="font-semibold text-secondary-900">Заявка клієнта</h2>
            <p><span class="text-secondary-500">Причина:</span> {{ returnReasonLabels[ret.reason] }}</p>
            <p class="whitespace-pre-line"><span class="text-secondary-500">Коментар:</span> {{ ret.comment || '—' }}</p>
            <div v-if="ret.photos.length" class="flex flex-wrap gap-2">
              <a v-for="photo in ret.photos" :key="photo.id" :href="getFileUrl(photo, 'large')" target="_blank" rel="noopener">
                <img :src="getFileUrl(photo, 'thumb')" alt="Фото від клієнта" class="size-24 rounded-lg object-cover transition hover:opacity-80">
              </a>
            </div>
            <p v-if="ret.rejectReason" class="rounded-lg bg-red-50 p-3 text-red-800 dark:bg-red-950/40 dark:text-red-200">Причина відмови: {{ ret.rejectReason }}</p>
          </section>

          <section class="rounded-xl border border-secondary-200 bg-white p-4 text-sm sm:p-5">
            <h2 class="mb-2 font-semibold text-secondary-900">Історія</h2>
            <div v-for="h in ret.history" :key="h.id" class="border-l-2 py-1 pl-3" :class="h.byAdmin ? 'border-primary-300' : 'border-secondary-200'">
              <b>{{ returnStatusLabels[h.status] }}</b> · {{ new Date(h.createdAt).toLocaleString('uk-UA') }} · <span class="text-secondary-500">{{ h.byAdmin ? 'менеджер' : 'клієнт' }}</span>
              <p v-if="h.comment" class="text-secondary-500">{{ h.comment }}</p>
            </div>
          </section>
        </div>

        <div class="space-y-6">
          <section class="space-y-2 rounded-xl border border-secondary-200 bg-white p-4 text-sm sm:p-5">
            <h2 class="font-semibold text-secondary-900">Клієнт</h2>
            <p>{{ ret.customer.name }}</p>
            <p><a :href="`tel:${ret.customer.phone}`" class="text-primary-700">{{ ret.customer.phone }}</a></p>
            <p v-if="ret.customer.email"><a :href="`mailto:${ret.customer.email}`" class="text-primary-700">{{ ret.customer.email }}</a></p>
            <div class="pt-2">
              <p class="text-secondary-500">Реквізити для повернення</p>
              <div class="mt-1 flex items-center gap-2">
                <code class="min-w-0 flex-1 break-all rounded-lg bg-secondary-50 px-3 py-2">{{ ret.refundDetails }}</code>
                <BBtn variant="icon" size="sm" title="Копіювати" @click="copyDetails"><Icon name="lucide:copy" /></BBtn>
              </div>
            </div>
            <p><span class="text-secondary-500">ТТН клієнта:</span> {{ ret.trackingNumber || '—' }}</p>
            <p v-if="ret.refundAmount != null"><span class="text-secondary-500">Повернено:</span> <b>{{ formatPrice(ret.refundAmount) }}</b></p>
          </section>

          <section class="rounded-xl border border-secondary-200 bg-white p-4 sm:p-5">
            <h2 class="mb-3 font-semibold text-secondary-900">Змінити статус</h2>
            <p v-if="!nextStatuses.length" class="text-sm text-secondary-500">Заявка у фінальному статусі.</p>
            <form novalidate v-else class="space-y-3" @submit.prevent="submit">
              <BSelect v-model="form.status" label="Новий статус" :options="statusOptions" required :error="errors.status" />
              <BTextarea v-if="form.status === 'REJECTED'" v-model="form.rejectReason" label="Причина відмови (бачить клієнт)" required :error="errors.rejectReason" />
              <BInput v-if="form.status === 'REFUNDED'" v-model="form.refundAmount" type="number" min="0" step="0.01" label="Сума повернення, грн" required :error="errors.refundAmount" @blur="touch('refundAmount')" />
              <BTextarea v-model="form.comment" label="Коментар до зміни (в історію)" :error="errors.comment" />
              <BTextarea v-model="form.managerComment" label="Коментар менеджера (бачить клієнт)" :error="errors.managerComment" />
              <BBtn type="submit" class="w-full" :loading="saving" :disabled="!form.status" :variant="form.status === 'REJECTED' ? 'danger' : 'primary'">Зберегти</BBtn>
            </form>
          </section>
        </div>
      </div>
    </template>
  </div>
</template>
