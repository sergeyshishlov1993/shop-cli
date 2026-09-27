<script setup lang="ts">
import { rules, useFormValidation } from '~/modules/common/composables/useFormValidation'
import CartSummary from '~/modules/cart/components/CartSummary.vue'
import { useCartStore } from '~/modules/cart/cartStore'
import { useAuthStore } from '~/modules/auth/authStore'
import { useDeliveryStore } from '~/modules/delivery/deliveryStore'
import { useOrderStore } from '~/modules/order/orderStore'
import { couponApi } from '~/modules/coupon/couponApi'
import { clearOrderIdempotencyKey, getOrderIdempotencyKey } from '~/modules/order/idempotency'
import { useSettingsStore } from '~/modules/settings/settingsStore'

definePageMeta({ middleware: 'checkout' })

const cartStore = useCartStore()
const authStore = useAuthStore()
const deliveryStore = useDeliveryStore()
const orderStore = useOrderStore()
const { getUtmData } = useUtm()
const settingsStore = useSettingsStore()
const router = useRouter()
const storePhone = computed(() => settingsStore.settings?.storePhone ?? null)
const payable = computed(() => Math.max(0, cartStore.subtotal - coupon.discount))
const isCouponOpen = ref(false)
const isCommentOpen = ref(false)

const form = reactive({
  name: '',
  phone: '',
  email: '',
  deliveryProvider: 'NOVA_POSHTA',
  cityRef: null as string | null,
  warehouseRef: null as string | null,
  addressLine: '',
  comment: '',
})

const submitError = ref('')

const deliveryOptions = [
  { label: 'Нова Пошта', value: 'NOVA_POSHTA', hint: 'Доставка у відділення або поштомат', icon: 'lucide:package' },
  { label: 'Курʼєрська доставка', value: 'COURIER', hint: 'Доставка на вашу адресу', icon: 'lucide:truck' },
]

const cityOptions = computed(() => deliveryStore.cities.map(city => ({ value: city.ref, label: city.name })))
const warehouseOptions = computed(() => deliveryStore.warehouses.map(warehouse => ({ value: warehouse.ref, label: warehouse.name })))
const selectedCity = computed(() => deliveryStore.cities.find(city => city.ref === form.cityRef) ?? null)
const selectedWarehouse = computed(() => deliveryStore.warehouses.find(warehouse => warehouse.ref === form.warehouseRef) ?? null)

watch(
  () => form.cityRef,
  (cityRef) => {
    form.warehouseRef = null
    deliveryStore.resetWarehouses()
    if (cityRef) {
      deliveryStore.searchWarehouses(cityRef).catch(() => undefined)
    }
  },
)

// Правила як у shop-api create-order.dto; місто/відділення — для Нової Пошти, адреса — для курʼєра
const isNovaPoshta = () => form.deliveryProvider === 'NOVA_POSHTA'
const isCourier = () => form.deliveryProvider === 'COURIER'
const { errors, validate, touch, applyServerErrors } = useFormValidation({
  name: [() => form.name, [rules.required('Вкажіть імʼя та прізвище'), rules.maxLength(255)]],
  phone: [() => form.phone, [rules.required('Вкажіть номер телефону'), rules.phoneUa()]],
  email: [() => form.email, [rules.email(), rules.maxLength(255)]],
  city: [() => (isNovaPoshta() ? selectedCity.value : 'ok'), [rules.required('Оберіть місто')]],
  warehouse: [() => (isNovaPoshta() ? selectedWarehouse.value : 'ok'), [rules.required('Оберіть відділення')]],
  addressLine: [() => (isCourier() ? form.addressLine : 'ok'), [rules.required('Вкажіть адресу доставки'), rules.maxLength(500)]],
  comment: [() => form.comment, [rules.maxLength(1000)]],
})

onMounted(() => {
  const user = authStore.user
  if (user) {
    form.name = [user.firstName, user.lastName].filter(Boolean).join(' ')
    form.phone = user.phone ?? ''
    form.email = user.email
  }
})


const coupon = reactive({ code: '', applied: '', discount: 0, error: '', loading: false })

async function applyCoupon() {
  coupon.error = ''
  coupon.loading = true
  try {
    const res = await couponApi.validate(coupon.code.trim(), cartStore.subtotal)
    coupon.applied = res.code
    coupon.discount = res.discountAmount
  }
  catch (e) {
    coupon.applied = ''
    coupon.discount = 0
    coupon.error = (e as { data?: { message?: string } })?.data?.message || 'Промокод недійсний'
  }
  finally {
    coupon.loading = false
  }
}

function removeCoupon() {
  coupon.code = ''
  coupon.applied = ''
  coupon.discount = 0
  coupon.error = ''
}

async function submitOrder() {
  submitError.value = ''
  if (!validate() || cartStore.isEmpty) return

  try {
    const payload = {
      customerName: form.name.trim(),
      customerPhone: form.phone,
      customerEmail: form.email.trim() || undefined,
      deliveryProvider: form.deliveryProvider,
      city: selectedCity.value?.name,
      warehouse: selectedWarehouse.value?.name,
      addressLine: form.addressLine.trim() || undefined,
      comment: form.comment.trim() || undefined,
      couponCode: coupon.applied || undefined,
      ...getUtmData(),
    }
    const idempotencyKey = await getOrderIdempotencyKey(payload, cartStore.cart?.items ?? [])
    const order = await orderStore.createOrder(payload, idempotencyKey)

    useAnalytics().track('purchase', {
      transaction_id: order?.orderNumber,
      value: order?.totalAmount,
      currency: 'UAH',
    })

    cartStore.clearCart()
    clearOrderIdempotencyKey()
    return order
  }
  catch (error) {
    // Помилки бекенду по полях — під полями; решта — загальним повідомленням
    if (applyServerErrors(error).length || !(error as { data?: unknown })?.data) submitError.value = 'Не вдалося оформити замовлення. Перевірте дані та спробуйте ще раз.'
  }
}

useSeoMeta({
  title: 'Оформлення замовлення',
  description: 'Оформлення та доставка замовлення.',
  robots: 'noindex, nofollow',
})
</script>

<template>
  <div class="store-page">
    <!-- Мобільна шапка оформлення -->
    <header class="glass sticky top-0 z-40 flex h-14 items-center justify-between px-4 lg:hidden">
      <button type="button" class="flex size-9 items-center justify-center" aria-label="Назад" @click="router.back()">
        <Icon name="lucide:arrow-left" size="20" />
      </button>
      <NuxtLink to="/" class="store-wordmark text-xl">Stella</NuxtLink>
      <a v-if="storePhone" :href="`tel:${storePhone}`" class="flex size-9 items-center justify-center" aria-label="Подзвонити">
        <Icon name="lucide:phone" size="19" />
      </a>
      <span v-else class="size-9" />
    </header>

    <div class="store-container py-4 max-lg:pb-40 lg:py-10">
      <div class="max-lg:hidden"><BBreadcrumbs :items="[{ label: 'Головна', to: '/' }, { label: 'Кошик', to: '/cart' }, { label: 'Оформлення' }]" /></div>

      <BEmptyState
        v-if="orderStore.lastOrder"
        title="Замовлення оформлено"
        :description="`Номер замовлення: ${orderStore.lastOrder.orderNumber}`"
        class="mt-8"
      >
        <template #action>
          <BBtn to="/catalog">Продовжити покупки</BBtn>
        </template>
      </BEmptyState>

      <template v-else>
        <h1 class="mb-4 text-xl font-medium text-secondary-900 lg:mb-8 lg:mt-4 lg:text-3xl lg:font-semibold">Оформлення замовлення</h1>

        <form id="checkout-form" novalidate class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-8" @submit.prevent="submitOrder">
          <div class="space-y-4 lg:space-y-8">
            <section class="checkout-card lg:hidden">
              <h2 class="checkout-card__title">
                <Icon name="lucide:shopping-bag" size="20" /> Кошик
                <NuxtLink to="/cart" class="ml-auto text-secondary-500" aria-label="Редагувати кошик"><Icon name="lucide:pencil" size="17" /></NuxtLink>
              </h2>
              <div v-for="item in cartStore.cart?.items" :key="item.id" class="flex gap-3 py-2">
                <img :src="getFileUrl(item.variant.mainImage, 'thumb')" :alt="item.product.name" class="h-20 w-14 shrink-0 object-cover" />
                <div class="min-w-0 text-sm">
                  <p class="truncate text-secondary-800">{{ item.product.name }}</p>
                  <p class="font-semibold text-secondary-900">{{ formatPrice(item.currentUnitPrice) }}</p>
                  <p class="text-xs text-secondary-500">{{ [item.variant.color?.name, item.variant.size?.name, `${item.quantity} шт`].filter(Boolean).join(' • ') }}</p>
                </div>
              </div>
            </section>

            <section class="checkout-card">
              <h2 class="checkout-card__title"><Icon name="lucide:user" size="20" /> Контактні дані</h2>
              <div class="grid gap-4 sm:grid-cols-2">
                <BInput v-model="form.name" label="Імʼя та прізвище" :error="errors.name" required @blur="touch('name')" />
                <BPhoneInput v-model="form.phone" label="Телефон" :error="errors.phone" required />
                <BInput v-model="form.email" type="email" label="Email" :error="errors.email" class="sm:col-span-2" @blur="touch('email')" />
              </div>
            </section>

            <section class="checkout-card">
              <h2 class="checkout-card__title"><Icon name="lucide:truck" size="20" /> Доставка</h2>
              <div class="grid gap-3">
                <BRadio
                    v-for="option in deliveryOptions"
                    :key="option.value"
                    v-model="form.deliveryProvider"
                    name="delivery"
                    variant="card"
                    :value="option.value"
                    :label="option.label"
                    :hint="option.hint"
                    :icon="option.icon"
                />
              </div>

              <div class="mt-4 grid gap-4 sm:grid-cols-2">
                <template v-if="form.deliveryProvider === 'NOVA_POSHTA'">
                  <BAutocomplete
                    v-model="form.cityRef"
                    :options="cityOptions"
                    :loading="deliveryStore.citiesLoading"
                    label="Місто"
                    placeholder="Почніть вводити назву"
                    :error="errors.city"
                    required
                    @search="deliveryStore.searchCities"
                  />
                  <BAutocomplete
                    v-model="form.warehouseRef"
                    :options="warehouseOptions"
                    :loading="deliveryStore.warehousesLoading"
                    :disabled="!form.cityRef"
                    label="Відділення"
                    placeholder="Оберіть відділення"
                    :error="errors.warehouse"
                    required
                    @search="query => form.cityRef && deliveryStore.searchWarehouses(form.cityRef, query)"
                  />
                </template>

                <BInput
                  v-else
                  v-model="form.addressLine"
                  label="Адреса доставки"
                  :error="errors.addressLine"
                  required
                  class="sm:col-span-2"
                />

                <BTextarea v-model="form.comment" label="Коментар до замовлення" :error="errors.comment" class="max-lg:hidden sm:col-span-2" />
              </div>
            </section>

            <!-- Мобільні згортані рядки: промокод і коментар -->
            <section class="checkout-card divide-y divide-secondary-200 !py-1 lg:hidden">
              <div class="py-3">
                <button type="button" class="flex w-full items-center gap-2 text-sm text-secondary-800" @click="isCouponOpen = !isCouponOpen">
                  <Icon name="lucide:ticket-percent" size="18" class="text-primary-600" />
                  {{ coupon.applied ? `Промокод ${coupon.applied}` : 'Додати промокод' }}
                  <Icon name="lucide:chevron-down" size="16" class="ml-auto transition-transform" :class="{ 'rotate-180': isCouponOpen }" />
                </button>
                <div v-if="isCouponOpen" class="mt-3">
                  <div v-if="coupon.applied" class="flex items-center justify-between text-sm">
                    <span>Знижка {{ formatPrice(coupon.discount) }}</span>
                    <button type="button" class="text-danger underline" @click="removeCoupon">Прибрати</button>
                  </div>
                  <div v-else class="flex gap-2">
                    <BInput v-model="coupon.code" placeholder="Промокод" class="flex-1" :error="coupon.error" @keydown.enter.prevent="applyCoupon" />
                    <BBtn type="button" variant="outline" :loading="coupon.loading" :disabled="!coupon.code.trim()" @click="applyCoupon">OK</BBtn>
                  </div>
                </div>
              </div>
              <div class="py-3">
                <button type="button" class="flex w-full items-center gap-2 text-sm text-secondary-800" @click="isCommentOpen = !isCommentOpen">
                  <Icon name="lucide:message-square-text" size="18" class="text-primary-600" />
                  Коментар до замовлення
                  <Icon name="lucide:chevron-down" size="16" class="ml-auto transition-transform" :class="{ 'rotate-180': isCommentOpen }" />
                </button>
                <BTextarea v-if="isCommentOpen" v-model="form.comment" :error="errors.comment" class="mt-3" />
              </div>
            </section>

            <!-- Мобільний підсумок -->
            <section class="checkout-card space-y-2 text-sm lg:hidden">
              <div class="flex justify-between text-secondary-600"><span>{{ cartStore.itemsCount }} од.</span><span>{{ formatPrice(cartStore.subtotal) }}</span></div>
              <div v-if="coupon.discount" class="flex justify-between text-secondary-600"><span>Знижка</span><span>−{{ formatPrice(coupon.discount) }}</span></div>
              <div class="flex justify-between text-secondary-600"><span>Доставка</span><span>за тарифами перевізника</span></div>
              <div class="flex justify-between border-t border-secondary-200 pt-2 text-base font-semibold text-secondary-900"><span>До сплати</span><span>{{ formatPrice(payable) }}</span></div>
            </section>
          </div>

          <aside class="max-lg:hidden">
            <div class="sticky top-36">
              <CartSummary hide-action />

              <div class="mt-4">
                <div v-if="coupon.applied" class="flex items-center justify-between rounded border border-green-300 bg-green-50 px-3 py-2 text-sm">
                  <span>Промокод <b>{{ coupon.applied }}</b> — знижка {{ coupon.discount }}</span>
                  <button type="button" class="text-danger underline" @click="removeCoupon">Прибрати</button>
                </div>
                <div v-else class="flex gap-2">
                  <BInput v-model="coupon.code" placeholder="Промокод" class="flex-1" :error="coupon.error" @keydown.enter.prevent="applyCoupon" />
                  <BBtn type="button" variant="secondary" :loading="coupon.loading" :disabled="!coupon.code.trim()" @click="applyCoupon">
                    Застосувати
                  </BBtn>
                </div>
              </div>

              <p v-if="submitError" class="mt-3 text-sm text-danger">{{ submitError }}</p>
              <BBtn type="submit" block size="lg" :loading="orderStore.creating" :disabled="cartStore.isEmpty" class="mt-4">
                Підтвердити замовлення
              </BBtn>
            </div>
          </aside>
        </form>

        <!-- Мобільна закріплена кнопка -->
        <div class="glass fixed inset-x-0 bottom-0 z-30 rounded-t-2xl px-4 pb-4 pt-3 lg:hidden">
          <p v-if="submitError" class="mb-2 text-sm text-danger">{{ submitError }}</p>
          <BBtn type="submit" form="checkout-form" block size="lg" :loading="orderStore.creating" :disabled="cartStore.isEmpty">
            Оформити замовлення · {{ formatPrice(payable) }}
          </BBtn>
          <p class="mt-2 text-center text-[11px] text-secondary-500">
            Натискаючи кнопку, ви погоджуєтеся з <NuxtLink to="/privacy" class="underline">політикою конфіденційності</NuxtLink>
          </p>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
@media (max-width: 1023px) {
  .checkout-card {
    border: 1px solid var(--color-secondary-200);
    border-radius: 1rem;
    background: var(--surface);
    padding: 1rem;
  }
}

@media (min-width: 1024px) {
  .checkout-card {
    border: 1px solid var(--color-secondary-200);
    border-radius: 0.75rem;
    background: var(--surface);
    padding: 1.5rem;
  }
}

.checkout-card__title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 1.0625rem;
  font-weight: 500;
  color: var(--color-primary-700);
}
</style>
