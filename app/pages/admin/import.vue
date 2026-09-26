<script setup lang="ts">
import { adminApi, getAdminError } from '~/modules/admin/adminApi'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const toast = useToast()
const file = shallowRef<File | null>(null)
const preview = ref<{ headers: string[], sampleRows: string[][], totalRows: number } | null>(null)
const previewing = ref(false)
const running = ref(false)
const report = ref<{ updated: number, notFoundCount: number, notFound: string[] } | null>(null)

const ymlFile = shallowRef<File | null>(null)
const ymlRunning = ref(false)
const ymlReport = ref<{ created: number, updated: number, errors: string[] } | null>(null)

async function doYml() {
  if (!ymlFile.value) return
  ymlRunning.value = true
  ymlReport.value = null
  try {
    ymlReport.value = await adminApi.importYml(ymlFile.value)
    toast.success(`Створено: ${ymlReport.value.created}, оновлено: ${ymlReport.value.updated}`)
  }
  catch (e) {
    toast.error(getAdminError(e))
  }
  finally {
    ymlRunning.value = false
  }
}

// Индексы колонок (-1 = не выбрано)
const map = reactive({ sku: -1, price: -1, stockQty: -1 })

const columnOptions = computed(() => [
  { label: '— не використовувати —', value: -1 },
  ...(preview.value?.headers ?? []).map((h, i) => ({ label: `${i}: ${h}`, value: i })),
])

function guessMapping(headers: string[]) {
  headers.forEach((h, i) => {
    const s = h.trim().toLowerCase()
    if (map.sku === -1 && /sku|артикул|код/.test(s)) map.sku = i
    if (map.price === -1 && /price|ціна|цена/.test(s)) map.price = i
    if (map.stockQty === -1 && /stock|залиш|остат|кільк|колич|qty/.test(s)) map.stockQty = i
  })
}

async function doPreview() {
  if (!file.value) return
  previewing.value = true
  report.value = null
  try {
    preview.value = await adminApi.importPreview(file.value)
    Object.assign(map, { sku: -1, price: -1, stockQty: -1 })
    guessMapping(preview.value.headers)
  }
  catch (e) {
    toast.error(getAdminError(e))
  }
  finally {
    previewing.value = false
  }
}

async function doRun() {
  if (!file.value || map.sku === -1) {
    toast.error('Оберіть колонку SKU')
    return
  }
  if (map.price === -1 && map.stockQty === -1) {
    toast.error('Оберіть колонку ціни або залишку')
    return
  }
  running.value = true
  try {
    report.value = await adminApi.importStock(file.value, {
      sku: map.sku,
      price: map.price === -1 ? undefined : map.price,
      stockQty: map.stockQty === -1 ? undefined : map.stockQty,
    })
    toast.success(`Оновлено: ${report.value.updated}`)
  }
  catch (e) {
    toast.error(getAdminError(e))
  }
  finally {
    running.value = false
  }
}
</script>

<template>
  <div class="p-4">
    <h1 class="mb-1 text-xl font-semibold">Імпорт залишків / цін</h1>
    <p class="mb-4 text-sm text-secondary-500">CSV або XLSX з колонкою SKU. Оновлює наявні варіанти за артикулом (ціна та/або залишок).</p>

    <div class="mb-4 flex flex-col items-stretch gap-3 sm:flex-row sm:items-end">
      <BFile v-model="file" label="CSV / XLSX" accept=".csv,text/csv,.xlsx" class="w-full sm:w-auto" />
      <BBtn :loading="previewing" :disabled="!file" @click="doPreview">Показати превью</BBtn>
    </div>

    <div v-if="preview" class="space-y-4">
      <p class="text-sm text-secondary-600">Рядків з даними: {{ preview.totalRows }}</p>

      <div class="grid gap-3 sm:grid-cols-3">
        <BSelect v-model.number="map.sku" label="Колонка SKU *" :options="columnOptions" />
        <BSelect v-model.number="map.price" label="Колонка ціни" :options="columnOptions" />
        <BSelect v-model.number="map.stockQty" label="Колонка залишку" :options="columnOptions" />
      </div>

      <div class="lg:overflow-x-auto">
        <table class="admin-table w-full text-xs">
          <thead class="text-left text-secondary-500">
            <tr><th v-for="(h, i) in preview.headers" :key="i" class="px-2 py-1">{{ i }}: {{ h }}</th></tr>
          </thead>
          <tbody>
            <tr v-for="(row, ri) in preview.sampleRows" :key="ri" class="border-t border-secondary-100">
              <td v-for="(cell, ci) in row" :key="ci" class="px-2 py-1" :data-label="`${ci}: ${preview.headers[ci]}`">{{ cell }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <BBtn :loading="running" @click="doRun">Запустити імпорт</BBtn>
    </div>

    <div v-if="report" class="mt-6 rounded-xl border border-secondary-200 p-4 text-sm">
      <p class="font-medium text-green-700">Оновлено варіантів: {{ report.updated }}</p>
      <p v-if="report.notFoundCount" class="mt-1 text-amber-700">
        Не знайдено за SKU: {{ report.notFoundCount }}
        <span v-if="report.notFound.length" class="text-secondary-500">({{ report.notFound.join(', ') }})</span>
      </p>
    </div>

    <h2 class="mb-1 mt-10 text-lg font-semibold">Імпорт товарів з YML</h2>
    <p class="mb-4 text-sm text-secondary-500">Фід Rozetka / Prom. Створює нові товари та оновлює наявні за SKU (vendorCode).</p>
    <div class="flex flex-col items-stretch gap-3 sm:flex-row sm:items-end">
      <BFile v-model="ymlFile" label="YML / XML" accept=".yml,.xml" class="w-full sm:w-auto" />
      <BBtn :loading="ymlRunning" :disabled="!ymlFile" @click="doYml">Імпортувати</BBtn>
    </div>
    <div v-if="ymlReport" class="mt-4 rounded-xl border border-secondary-200 p-4 text-sm">
      <p class="font-medium text-green-700">Створено варіантів: {{ ymlReport.created }}, оновлено: {{ ymlReport.updated }}</p>
      <ul v-if="ymlReport.errors.length" class="mt-2 list-disc pl-5 text-amber-700">
        <li v-for="(err, i) in ymlReport.errors" :key="i">{{ err }}</li>
      </ul>
    </div>
  </div>
</template>
