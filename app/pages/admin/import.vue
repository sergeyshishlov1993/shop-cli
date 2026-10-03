<script setup lang="ts">
import { adminApi, getAdminError } from '~/modules/admin/adminApi'
import { rules, useFormValidation } from '~/modules/common/composables/useFormValidation'

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

// Режим: оновити ціни/залишки наявних варіантів або створити/оновити товари з таблиці
const mode = ref<'stock' | 'products'>('stock')
const modeOptions = [
  { label: 'Оновити ціни / залишки', value: 'stock' },
  { label: 'Товари: створити / оновити', value: 'products' },
]

// Поля імпорту товарів; порядок важливий для автопідбору (стара ціна раніше за ціну)
const productFields = [
  { key: 'sku', label: 'SKU / артикул', required: true, re: /sku|артикул|код/ },
  { key: 'name', label: 'Назва', required: true, re: /name|назв|наймен|товар/ },
  { key: 'category', label: 'Категорія (Жінкам > Сукні)', re: /categ|катег|розділ|раздел/ },
  { key: 'oldPrice', label: 'Стара ціна', re: /old|стара|старая/ },
  { key: 'price', label: 'Ціна', re: /price|ціна|цена/ },
  { key: 'stockQty', label: 'Залишок', re: /stock|залиш|остат|кільк|колич|qty/ },
  { key: 'size', label: 'Розмір', re: /size|розмір|размер/ },
  { key: 'color', label: 'Колір', re: /colou?r|колір|цвет/ },
  { key: 'brand', label: 'Бренд', re: /brand|бренд|vendor|виробн/ },
  { key: 'description', label: 'Опис', re: /desc|опис/ },
  { key: 'group', label: 'Модель (обʼєднує варіанти)', re: /group|модел|model/ },
  { key: 'pictures', label: 'Посилання на фото', re: /photo|фото|image|picture|картин/ },
] as const
const pmap = reactive<Record<string, number>>(Object.fromEntries(productFields.map(f => [f.key, -1])))
const productsReport = ref<{ created: number, updated: number, errors: string[] } | null>(null)

function guessProductMapping(headers: string[]) {
  headers.forEach((h, i) => {
    const s = h.trim().toLowerCase()
    const field = productFields.find(f => pmap[f.key] === -1 && f.re.test(s))
    if (field) pmap[field.key] = i
  })
}

async function doRunProducts() {
  if (!file.value) return
  if (pmap.sku === -1 || pmap.name === -1) {
    toast.error('Оберіть колонки SKU та назви')
    return
  }
  running.value = true
  productsReport.value = null
  try {
    productsReport.value = await adminApi.importProducts(file.value, Object.fromEntries(
      Object.entries(pmap).map(([k, v]) => [k, v === -1 ? undefined : v]),
    ))
    toast.success(`Створено: ${productsReport.value.created}, оновлено: ${productsReport.value.updated}`)
  }
  catch (e) {
    toast.error(getAdminError(e))
  }
  finally {
    running.value = false
  }
}

// Фото пачкою: імʼя файлу = SKU. Шлемо частинами, щоб не тримати сотні МБ в одному запиті.
const photoFiles = shallowRef<File[]>([])
const photosRunning = ref(false)
const photosReport = ref<{ attached: number, notFound: string[], errors: string[] } | null>(null)

async function doPhotos() {
  if (!photoFiles.value.length) return
  photosRunning.value = true
  const total = { attached: 0, notFound: [] as string[], errors: [] as string[] }
  photosReport.value = null
  try {
    for (let i = 0; i < photoFiles.value.length; i += 20) {
      const res = await adminApi.importPhotos(photoFiles.value.slice(i, i + 20))
      total.attached += res.attached
      total.notFound.push(...res.notFound)
      total.errors.push(...res.errors)
    }
    toast.success(`Додано фото: ${total.attached}`)
  }
  catch (e) {
    toast.error(getAdminError(e))
  }
  finally {
    photosReport.value = total
    photosRunning.value = false
  }
}

// Индексы колонок (-1 = не выбрано)
const map = reactive({ sku: -1, price: -1, stockQty: -1 })
const col = (i: number) => (i === -1 ? '' : i)
const { errors, validate, reset, applyServerErrors } = useFormValidation({
  sku: [() => col(map.sku), [rules.required('Оберіть колонку SKU')]],
  price: [() => col(map.price) === '' ? col(map.stockQty) : map.price, [rules.required('Оберіть колонку ціни або залишку')]],
})

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
    for (const f of productFields) pmap[f.key] = -1
    productsReport.value = null
    reset()
    guessMapping(preview.value.headers)
    guessProductMapping(preview.value.headers)
  }
  catch (e) {
    toast.error(getAdminError(e))
  }
  finally {
    previewing.value = false
  }
}

async function doRun() {
  if (!validate() || !file.value) return
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
    const rest = applyServerErrors(e)
    if (rest.length || !Object.values(errors).some(Boolean)) toast.error(getAdminError(e))
  }
  finally {
    running.value = false
  }
}
</script>

<template>
  <div class="p-4">
    <h1 class="mb-1 text-xl font-semibold">Імпорт з таблиці</h1>
    <p class="mb-4 text-sm text-secondary-500">
      CSV або XLSX (Google Таблиці: Файл → Завантажити; 1С / Excel — будь-яка вивантажка з колонкою артикулу).
      Можна оновити ціни й залишки наявних товарів або завести нові товари з варіантами.
    </p>

    <div class="mb-4 flex flex-col items-stretch gap-3 sm:flex-row sm:items-end">
      <BFile v-model="file" label="CSV / XLSX" accept=".csv,text/csv,.xlsx" class="w-full sm:w-auto" />
      <BBtn :loading="previewing" :disabled="!file" @click="doPreview">Показати превью</BBtn>
    </div>

    <div v-if="preview" class="space-y-4">
      <p class="text-sm text-secondary-600">Рядків з даними: {{ preview.totalRows }}</p>

      <BSelect v-model="mode" label="Що робимо" class="sm:w-80" :options="modeOptions" />

      <div v-if="mode === 'products'" class="grid gap-3 sm:grid-cols-3">
        <BSelect
          v-for="f in productFields"
          :key="f.key"
          v-model.number="pmap[f.key]"
          :label="f.label"
          :required="'required' in f"
          :options="columnOptions"
        />
      </div>

      <div v-else class="grid gap-3 sm:grid-cols-3">
        <BSelect v-model.number="map.sku" label="Колонка SKU" required :error="errors.sku" :options="columnOptions" />
        <BSelect v-model.number="map.price" label="Колонка ціни" :error="errors.price" :options="columnOptions" />
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

      <BBtn :loading="running" @click="mode === 'products' ? doRunProducts() : doRun()">Запустити імпорт</BBtn>
    </div>

    <div v-if="productsReport" class="mt-6 rounded-xl border border-secondary-200 p-4 text-sm">
      <p class="font-medium text-green-700">Створено варіантів: {{ productsReport.created }}, оновлено: {{ productsReport.updated }}</p>
      <ul v-if="productsReport.errors.length" class="mt-2 list-disc pl-5 text-amber-700">
        <li v-for="(err, i) in productsReport.errors" :key="i">{{ err }}</li>
      </ul>
    </div>

    <div v-if="report" class="mt-6 rounded-xl border border-secondary-200 p-4 text-sm">
      <p class="font-medium text-green-700">Оновлено варіантів: {{ report.updated }}</p>
      <p v-if="report.notFoundCount" class="mt-1 text-amber-700">
        Не знайдено за SKU: {{ report.notFoundCount }}
        <span v-if="report.notFound.length" class="text-secondary-500">({{ report.notFound.join(', ') }})</span>
      </p>
    </div>

    <h2 class="mb-1 mt-10 text-lg font-semibold">Фото до товарів за SKU</h2>
    <p class="mb-4 text-sm text-secondary-500">
      Назва файлу = артикул варіанта: <code>D-1-S.jpg</code>, друге фото — <code>D-1-S_2.jpg</code>.
      Фото додаються в кінець галереї товару; перше фото товару без медіа стає головним.
    </p>
    <div class="flex flex-col items-stretch gap-3 sm:flex-row sm:items-end">
      <label class="block text-sm">
        <span class="mb-1 block font-medium text-gray-700">Фото (JPG / PNG / WebP, до 10 МБ)</span>
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          class="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-secondary-100 file:px-3 file:py-2"
          @change="photoFiles = [...(($event.target as HTMLInputElement).files ?? [])]"
        >
      </label>
      <BBtn :loading="photosRunning" :disabled="!photoFiles.length" @click="doPhotos">Завантажити {{ photoFiles.length || '' }}</BBtn>
    </div>
    <div v-if="photosReport" class="mt-4 rounded-xl border border-secondary-200 p-4 text-sm">
      <p class="font-medium text-green-700">Додано фото: {{ photosReport.attached }}</p>
      <p v-if="photosReport.notFound.length" class="mt-1 text-amber-700">Не знайдено SKU: {{ photosReport.notFound.join(', ') }}</p>
      <ul v-if="photosReport.errors.length" class="mt-2 list-disc pl-5 text-amber-700">
        <li v-for="(err, i) in photosReport.errors" :key="i">{{ err }}</li>
      </ul>
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
