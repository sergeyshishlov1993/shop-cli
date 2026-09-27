<script setup lang="ts">
import { adminApi, getAdminError, type AdminProduct, type AdminVariant } from '~/modules/admin/adminApi'
import { useFormValidation, type Rule } from '~/modules/common/composables/useFormValidation'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const toast = useToast()
const search = ref('')
const products = ref<AdminProduct[]>([])
const searching = ref(false)
const selectedProduct = ref<AdminProduct | null>(null)
const variants = ref<AdminVariant[]>([])
const copies = reactive<Record<number, number>>({})
const printing = ref(false)

const isValidCopies = (n: unknown) => n === '' || n == null || (Number.isInteger(Number(n)) && Number(n) >= 0)
const copiesRule: Rule = v => ((v as unknown[]).every(isValidCopies) ? '' : 'Кількість — ціле число ≥ 0')
const atLeastOne: Rule = v => ((v as unknown[]).some(n => Number(n) > 0) ? '' : 'Вкажіть кількість ярликів')
const { errors, validate, applyServerErrors } = useFormValidation({
  copies: [() => variants.value.map(v => copies[v.id]), [copiesRule, atLeastOne]],
})

async function doSearch() {
  searching.value = true
  try {
    products.value = (await adminApi.products({ search: search.value, limit: 20 })).items
  }
  catch (e) {
    toast.error(getAdminError(e))
  }
  finally {
    searching.value = false
  }
}

async function pickProduct(p: AdminProduct) {
  selectedProduct.value = p
  variants.value = await adminApi.variants(p.id)
  for (const v of variants.value) copies[v.id] = copies[v.id] ?? 1
}

async function print() {
  if (!validate()) {
    if (errors.copies && !variants.value.some(v => !isValidCopies(copies[v.id]))) toast.error(errors.copies)
    return
  }
  const items = variants.value
    .filter(v => (copies[v.id] ?? 0) > 0)
    .map(v => ({ variantId: v.id, copies: copies[v.id] }))
  printing.value = true
  try {
    const html = await adminApi.printLabels(items)
    const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }))
    window.open(url, '_blank')
    setTimeout(() => URL.revokeObjectURL(url), 10000)
  }
  catch (e) {
    const rest = applyServerErrors(e)
    if (rest.length || !errors.copies) toast.error(getAdminError(e))
  }
  finally {
    printing.value = false
  }
}
</script>

<template>
  <div class="p-4">
    <h1 class="mb-1 text-xl font-semibold">Друк цінників</h1>
    <p class="mb-4 text-sm text-secondary-500">Знайдіть товар, вкажіть кількість ярликів на варіант — і роздрукуйте цінники з фото, короткими ТТХ та штрихкодом.</p>

    <div class="mb-4 flex flex-col gap-2 sm:flex-row">
      <BInput v-model="search" placeholder="Пошук товару (назва / SKU)" class="w-full sm:max-w-sm" @keydown.enter.prevent="doSearch" />
      <BBtn :loading="searching" @click="doSearch">Знайти</BBtn>
    </div>

    <div v-if="products.length" class="mb-6" :aria-busy="searching">
      <ul class="loading-blur divide-y divide-secondary-100 rounded-xl border border-secondary-200">
        <li v-for="p in products" :key="p.id" class="flex items-center justify-between px-3 py-2 text-sm">
          <span>{{ p.name }} <span class="text-secondary-500">· {{ p.basePrice }} ₴</span></span>
          <BBtn variant="ghost" size="sm" @click="pickProduct(p)">Обрати</BBtn>
        </li>
      </ul>
    </div>

    <div v-if="selectedProduct && variants.length" class="space-y-3">
      <h2 class="font-medium">{{ selectedProduct.name }} — варіанти</h2>
      <table class="admin-table w-full text-sm">
        <thead class="text-left text-secondary-500">
          <tr><th class="py-1">SKU / штрихкод</th><th>Розмір/Колір</th><th>Ціна</th><th>Ярликів</th></tr>
        </thead>
        <tbody>
          <tr v-for="v in variants" :key="v.id" class="border-t border-secondary-100">
            <td data-label="SKU / штрихкод" class="py-1"><div>{{ v.sku }}</div><div class="text-xs text-secondary-500">{{ v.barcode || 'штрихкод = SKU' }}</div></td>
            <td data-label="Розмір/Колір">{{ [v.size?.name, v.color?.name].filter(Boolean).join(' · ') || '—' }}</td>
            <td data-label="Ціна">{{ v.price ?? '—' }}</td>
            <td data-label="Ярликів"><BInput v-model.number="copies[v.id]" type="number" class="w-20" :error="errors.copies && !isValidCopies(copies[v.id]) ? errors.copies : ''" /></td>
          </tr>
        </tbody>
      </table>
      <BBtn :loading="printing" @click="print">Друкувати</BBtn>
    </div>
  </div>
</template>
