<script setup lang="ts">
const selectedCity = ref('')
const cityOptions = [
  { label: 'Київ', value: 'kyiv' },
  { label: 'Львів', value: 'lviv' },
  { label: 'Одеса', value: 'odesa' },
]

const isModalOpen = ref(false)
const isModalLgOpen = ref(false)
const isModalPersistentOpen = ref(false)

const isDrawerRight = ref(false)
const isDrawerLeft = ref(false)

const inputText = ref('')
const inputEmail = ref('')
const inputPassword = ref('')
const inputPhone = ref('')
const inputSearch = ref('')
const searchResult = ref('')

const textareaValue = ref('')

const isChecked = ref(false)
const isCheckedDisabled = ref(true)

const radioValue = ref('option1')

const toggleValue = ref(false)
const toggleValueSm = ref(true)
const toggleDisabled = ref(false)

const isLoading = ref(false)
const toggleLoading = () => {
  isLoading.value = true
  setTimeout(() => { isLoading.value = false }, 2000)
}

function onSearch(value: string) {
  searchResult.value = value
}

const autocompleteValue = ref('')
const autocompleteValueError = ref('')
const autocompleteDisabledValue = ref('')
const autocompleteLoading = ref(false)
const autocompleteOptions = ref<{ label: string; value: string }[]>([])

const allCities = [
  { label: 'Київ', value: 'kyiv' },
  { label: 'Краків', value: 'krakow' },
  { label: 'Львів', value: 'lviv' },
  { label: 'Луцьк', value: 'lutsk' },
  { label: 'Одеса', value: 'odesa' },
  { label: 'Олександрія', value: 'oleksandria' },
  { label: 'Харків', value: 'kharkiv' },
  { label: 'Херсон', value: 'kherson' },
  { label: 'Дніпро', value: 'dnipro' },
  { label: 'Донецьк', value: 'donetsk' },
]

function onAutocompleteSearch(query: string) {
  autocompleteLoading.value = true
  setTimeout(() => {
    autocompleteOptions.value = allCities.filter(city =>
        city.label.toLowerCase().includes(query.toLowerCase()),
    )
    autocompleteLoading.value = false
  }, 500)
}

const ratingValue = ref(3)
const ratingReadonly = ref(4.5)

const priceRange = ref({ min: 200, max: 800 })

const tagVariants = ['primary', 'success', 'warning', 'danger', 'info', 'secondary'] as const
const closedTags = ref<Set<string>>(new Set())
function onTagClose(variant: string) {
  closedTags.value.add(variant)
}

const currentPage = ref(1)
const totalPages = ref(20)
const currentPageSmall = ref(3)

const activeTab = ref<string | number>('tab1')
const tabsList = [
  { key: 'tab1', label: 'Загальне' },
  { key: 'tab2', label: 'Відгуки', count: 12 },
  { key: 'tab3', label: 'Доставка' },
  { key: 'tab4', label: 'Архів', disabled: true },
]

const accordionItems = [
  { key: 'delivery', title: 'Доставка та оплата', content: 'Ми доставляємо по всій Україні через Нову Пошту та Укрпошту. Оплата при отриманні або онлайн.' },
  { key: 'returns', title: 'Повернення та обмін', content: 'Повернення товару протягом 14 днів з моменту отримання. Товар має бути в оригінальній упаковці.' },
  { key: 'warranty', title: 'Гарантія', content: 'На всі товари діє гарантія від виробника. Термін гарантії залежить від категорії товару.' },
  { key: 'sizes', title: 'Розмірна сітка', content: 'Ознайомтесь з розмірною сіткою в картці товару. Якщо сумніваєтесь — зв\'яжіться з нами.' },
]

const breadcrumbItems = [
  { label: 'Головна', to: '/' },
  { label: 'Каталог', to: '/catalog' },
  { label: 'Взуття', to: '/catalog/shoes' },
  { label: 'Кросівки Nike Air Max' },
]

const toast = useToast()

const { confirm } = useConfirm()
const confirmResult = ref<string>('')

async function onConfirmPrimary() {
  const result = await confirm({
    title: 'Зберегти зміни?',
    message: 'Ви впевнені, що хочете зберегти всі внесені зміни?',
    confirmText: 'Зберегти',
    cancelText: 'Відмінити',
  })
  confirmResult.value = result ? 'Підтверджено ✅' : 'Скасовано ❌'
}

async function onConfirmDanger() {
  const result = await confirm({
    title: 'Видалити товар?',
    message: 'Ця дія незворотна. Товар буде видалено назавжди.',
    confirmText: 'Видалити',
    cancelText: 'Скасувати',
    variant: 'danger',
  })
  confirmResult.value = result ? 'Видалено 🗑️' : 'Збережено 💾'
}

const fileValue = ref<File | null>(null)
const imageFileValue = ref<File | null>(null)

const previewUrl = computed(() => {
  if (!imageFileValue.value) return null
  return URL.createObjectURL(imageFileValue.value)
})
</script>

<template>
  <div class="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-4 py-10">

    <!-- BBtn -->
    <section class="flex flex-col gap-4 rounded-2xl border border-secondary-200 bg-white p-6">
      <h2 class="text-xl font-semibold text-secondary-900">BBtn</h2>
      <div class="flex flex-wrap items-center gap-3">
        <b-btn variant="primary">Primary</b-btn>
        <b-btn variant="secondary">Secondary</b-btn>
        <b-btn variant="outline">Outline</b-btn>
        <b-btn variant="ghost">Ghost</b-btn>
        <b-btn variant="danger">Danger</b-btn>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <b-btn size="sm">Small</b-btn>
        <b-btn size="md">Medium</b-btn>
        <b-btn size="lg">Large</b-btn>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <b-btn disabled>Disabled</b-btn>
        <b-btn :loading="isLoading" @click="toggleLoading">Loading</b-btn>
      </div>
      <b-btn block>Block</b-btn>
    </section>

    <!-- BInput Default -->
    <section class="flex flex-col gap-4 rounded-2xl border border-secondary-200 bg-white p-6">
      <h2 class="text-xl font-semibold text-secondary-900">BInput — Default</h2>
      <b-input v-model="inputText" label="Текст" placeholder="Введіть текст" />
      <b-input v-model="inputEmail" type="email" label="Email" placeholder="example@mail.com" required />
      <b-input model-value="Заблоковано" label="Disabled" disabled />
    </section>

    <!-- BInput Password -->
    <section class="flex flex-col gap-4 rounded-2xl border border-secondary-200 bg-white p-6">
      <h2 class="text-xl font-semibold text-secondary-900">BInput — Password</h2>
      <b-input v-model="inputPassword" mode="password" label="Пароль" placeholder="Введіть пароль" />
      <b-input model-value="secret123" mode="password" label="З помилкою" error="Мінімум 8 символів" />
      <b-input model-value="" mode="password" label="Disabled" placeholder="Пароль" disabled />
      <p class="text-sm text-secondary-600">Значення: {{ inputPassword }}</p>
    </section>

    <!-- BInput Phone -->
    <section class="flex flex-col gap-4 rounded-2xl border border-secondary-200 bg-white p-6">
      <h2 class="text-xl font-semibold text-secondary-900">BInput — Phone</h2>
      <b-input v-model="inputPhone" mode="phone" label="Телефон" />
      <b-input model-value="" mode="phone" label="З помилкою" error="Невірний формат" required />
      <b-input model-value="+38 (067) 123-45-67" mode="phone" label="Disabled" disabled />
      <p class="text-sm text-secondary-600">Значення: {{ inputPhone }}</p>
    </section>

    <!-- BInput Search -->
    <section class="flex flex-col gap-4 rounded-2xl border border-secondary-200 bg-white p-6">
      <h2 class="text-xl font-semibold text-secondary-900">BInput — Search</h2>
      <b-input v-model="inputSearch" mode="search" label="Пошук" :debounce="500" @search="onSearch" />
      <b-input model-value="" mode="search" label="Disabled" disabled />
      <p class="text-sm text-secondary-600">Значення: {{ inputSearch }}</p>
      <p class="text-sm text-secondary-600">Останній пошук: {{ searchResult || '—' }}</p>
    </section>

    <!-- BSelect -->
    <section class="flex flex-col gap-4 rounded-2xl border border-secondary-200 bg-white p-6">
      <h2 class="text-xl font-semibold text-secondary-900">BSelect</h2>
      <b-select v-model="selectedCity" label="Місто" placeholder="Оберіть місто" :options="cityOptions" />
      <b-select model-value="" label="Disabled" placeholder="Недоступно" :options="cityOptions" disabled />
      <b-select model-value="" label="З помилкою" placeholder="Оберіть місто" :options="cityOptions" error="Обов'язкове поле" />
      <p class="text-sm text-secondary-600">Значення: {{ selectedCity || 'не вибрано' }}</p>
    </section>

    <!-- BAutocomplete -->
    <section class="flex flex-col gap-4 rounded-2xl border border-secondary-200 bg-white p-6">
      <h2 class="text-xl font-semibold text-secondary-900">BAutocomplete</h2>
      <b-autocomplete v-model="autocompleteValue" :options="autocompleteOptions" :loading="autocompleteLoading" label="Місто (автодоповнення)" placeholder="Почніть вводити назву міста" :min-chars="1" @search="onAutocompleteSearch" />
      <p class="text-sm text-secondary-600">Значення: {{ autocompleteValue || 'не вибрано' }}</p>
      <b-autocomplete v-model="autocompleteValueError" :options="[]" label="З помилкою" placeholder="Введіть місто" error="Обов'язкове поле" required />
      <b-autocomplete v-model="autocompleteDisabledValue" :options="cityOptions" label="Disabled" placeholder="Недоступно" disabled />
    </section>

    <!-- BTextarea -->
    <section class="flex flex-col gap-4 rounded-2xl border border-secondary-200 bg-white p-6">
      <h2 class="text-xl font-semibold text-secondary-900">BTextarea</h2>
      <b-textarea v-model="textareaValue" label="Коментар" placeholder="Напишіть коментар..." />
      <b-textarea model-value="" label="З помилкою" placeholder="Текст..." error="Обов'язкове поле" required />
      <b-textarea model-value="Заблокований текст" label="Disabled" disabled />
    </section>

    <!-- BCheckbox -->
    <section class="flex flex-col gap-4 rounded-2xl border border-secondary-200 bg-white p-6">
      <h2 class="text-xl font-semibold text-secondary-900">BCheckbox</h2>
      <b-checkbox v-model="isChecked" label="Погоджуюсь з умовами" />
      <b-checkbox v-model="isCheckedDisabled" label="Disabled checked" disabled />
      <b-checkbox :model-value="false" label="Disabled unchecked" disabled />
      <p class="text-sm text-secondary-600">Значення: {{ isChecked }}</p>
    </section>

    <!-- BRadio -->
    <section class="flex flex-col gap-4 rounded-2xl border border-secondary-200 bg-white p-6">
      <h2 class="text-xl font-semibold text-secondary-900">BRadio</h2>
      <b-radio v-model="radioValue" name="demo-radio" value="option1" label="Варіант 1" />
      <b-radio v-model="radioValue" name="demo-radio" value="option2" label="Варіант 2" />
      <b-radio v-model="radioValue" name="demo-radio" value="option3" label="Варіант 3" />
      <b-radio model-value="" name="demo-radio-disabled" value="disabled" label="Disabled" disabled />
      <p class="text-sm text-secondary-600">Значення: {{ radioValue }}</p>
    </section>

    <!-- BToggle -->
    <section class="flex flex-col gap-4 rounded-2xl border border-secondary-200 bg-white p-6">
      <h2 class="text-xl font-semibold text-secondary-900">BToggle</h2>
      <b-toggle v-model="toggleValue" label="Сповіщення" />
      <b-toggle v-model="toggleValueSm" label="Маленький" size="sm" />
      <b-toggle v-model="toggleDisabled" label="Disabled" disabled />
      <p class="text-sm text-secondary-600">Значення: {{ toggleValue }}</p>
    </section>

    <!-- BBadge -->
    <section class="flex flex-col gap-4 rounded-2xl border border-secondary-200 bg-white p-6">
      <h2 class="text-xl font-semibold text-secondary-900">BBadge</h2>
      <div class="flex flex-wrap items-center gap-3">
        <b-badge type="text" variant="danger">new</b-badge>
        <b-badge variant="danger">renewal</b-badge>
        <b-badge variant="danger">exclusive</b-badge>
        <b-badge variant="danger" size="sm">top</b-badge>
        <b-badge variant="primary">Primary</b-badge>
        <b-badge variant="success">Success</b-badge>
        <b-badge variant="warning">Warning</b-badge>
        <b-badge variant="danger">Danger</b-badge>
        <b-badge variant="info">Info</b-badge>
        <b-badge variant="secondary">Secondary</b-badge>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <b-badge size="sm" variant="primary">Small</b-badge>
        <b-badge size="md" variant="primary">Medium</b-badge>
      </div>
    </section>

    <!-- BTag -->
    <section class="flex flex-col gap-4 rounded-2xl border border-secondary-200 bg-white p-6">
      <h2 class="text-xl font-semibold text-secondary-900">BTag</h2>
      <div class="flex flex-wrap items-center gap-3">
        <template v-for="variant in tagVariants" :key="variant">
          <b-tag v-if="!closedTags.has(variant)" :variant="variant" closable @close="onTagClose(variant)">{{ variant }}</b-tag>
        </template>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <b-tag variant="primary">Без закриття</b-tag>
        <b-tag variant="success" size="sm" closable @close="() => {}">Small closable</b-tag>
      </div>
      <b-btn v-if="closedTags.size > 0" variant="ghost" size="sm" @click="closedTags.clear()">Відновити теги</b-btn>
    </section>

    <!-- BAvatar -->
    <section class="flex flex-col gap-4 rounded-2xl border border-secondary-200 bg-white p-6">
      <h2 class="text-xl font-semibold text-secondary-900">BAvatar</h2>
      <div class="flex flex-wrap items-end gap-4">
        <b-avatar size="sm" alt="Іван Петренко" />
        <b-avatar size="md" alt="Олена Коваль" />
        <b-avatar size="lg" alt="Дмитро Шевченко" />
        <b-avatar size="xl" alt="Марія Бондар" />
      </div>
      <div class="flex flex-wrap items-end gap-4">
        <b-avatar size="lg" src="https://i.pravatar.cc/150?img=5" alt="User photo" />
        <b-avatar size="lg" src="https://broken-url.example/avatar.jpg" alt="Broken Image" />
        <b-avatar size="lg" fallback="АБ" />
        <b-avatar size="lg" />
      </div>
    </section>

    <!-- BRating -->
    <section class="flex flex-col gap-4 rounded-2xl border border-secondary-200 bg-white p-6">
      <h2 class="text-xl font-semibold text-secondary-900">BRating</h2>
      <div class="flex flex-col gap-3">
        <div class="flex items-center gap-3">
          <span class="w-28 text-sm text-secondary-600">Editable:</span>
          <b-rating v-model="ratingValue" />
          <span class="text-sm text-secondary-500">{{ ratingValue }}</span>
        </div>
        <div class="flex items-center gap-3">
          <span class="w-28 text-sm text-secondary-600">Readonly:</span>
          <b-rating :model-value="ratingReadonly" readonly />
          <span class="text-sm text-secondary-500">{{ ratingReadonly }}</span>
        </div>
        <div class="flex items-center gap-3">
          <span class="w-28 text-sm text-secondary-600">Readonly 0:</span>
          <b-rating :model-value="0" readonly />
        </div>
      </div>
      <div class="flex flex-wrap items-end gap-4">
        <div class="flex items-center gap-2">
          <span class="text-sm text-secondary-600">sm:</span>
          <b-rating :model-value="4" readonly size="sm" />
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm text-secondary-600">md:</span>
          <b-rating :model-value="4" readonly size="md" />
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm text-secondary-600">lg:</span>
          <b-rating :model-value="4" readonly size="lg" />
        </div>
      </div>
    </section>

    <!-- BCard -->
    <section class="flex flex-col gap-4 rounded-2xl border border-secondary-200 bg-white p-6">
      <h2 class="text-xl font-semibold text-secondary-900">BCard</h2>
      <div class="grid gap-4 sm:grid-cols-2">
        <b-card><p class="text-sm text-secondary-700">Default padding (md), border</p></b-card>
        <b-card padding="sm"><p class="text-sm text-secondary-700">Small padding, border</p></b-card>
        <b-card padding="lg" :border="false"><p class="text-sm text-secondary-700">Large padding, shadow (no border)</p></b-card>
        <b-card hover><p class="text-sm text-secondary-700">Hover effect — наведіть</p></b-card>
      </div>
      <b-card>
        <template #header><h3 class="text-base font-semibold text-secondary-900">Header slot</h3></template>
        <p class="text-sm text-secondary-700">Content slot з header та footer.</p>
        <template #footer>
          <div class="flex justify-end"><b-btn size="sm" variant="outline">Action</b-btn></div>
        </template>
      </b-card>
    </section>

    <!-- BEmptyState -->
    <section class="flex flex-col gap-4 rounded-2xl border border-secondary-200 bg-white p-6">
      <h2 class="text-xl font-semibold text-secondary-900">BEmptyState</h2>
      <b-empty-state title="Кошик порожній" description="Додайте товари до кошика, щоб оформити замовлення" icon="cart">
        <template #action><b-btn variant="primary" size="sm">До каталогу</b-btn></template>
      </b-empty-state>
    </section>

    <!-- BPagination -->
    <section class="flex flex-col gap-4 rounded-2xl border border-secondary-200 bg-white p-6">
      <h2 class="text-xl font-semibold text-secondary-900">BPagination</h2>
      <div>
        <p class="mb-2 text-sm text-secondary-600">20 сторінок, поточна: {{ currentPage }}</p>
        <b-pagination v-model:page="currentPage" :total-pages="totalPages" />
      </div>
      <div>
        <p class="mb-2 text-sm text-secondary-600">5 сторінок, поточна: {{ currentPageSmall }}</p>
        <b-pagination v-model:page="currentPageSmall" :total-pages="5" />
      </div>
      <div>
        <p class="mb-2 text-sm text-secondary-600">1 сторінка (не рендериться)</p>
        <b-pagination :page="1" :total-pages="1" />
      </div>
    </section>

    <!-- BTabs -->
    <section class="flex flex-col gap-4 rounded-2xl border border-secondary-200 bg-white p-6">
      <h2 class="text-xl font-semibold text-secondary-900">BTabs</h2>
      <b-tabs v-model="activeTab" :tabs="tabsList" />
      <div class="rounded-lg bg-secondary-50 p-4 text-sm text-secondary-700">
        <p v-if="activeTab === 'tab1'">Загальна інформація про товар: опис, характеристики, матеріал.</p>
        <p v-else-if="activeTab === 'tab2'">Тут будуть відгуки покупців (12 відгуків).</p>
        <p v-else-if="activeTab === 'tab3'">Інформація про доставку та оплату.</p>
      </div>
      <p class="text-sm text-secondary-600">Активна вкладка: {{ activeTab }}</p>
    </section>

    <!-- BAccordion -->
    <section class="flex flex-col gap-4 rounded-2xl border border-secondary-200 bg-white p-6">
      <h2 class="text-xl font-semibold text-secondary-900">BAccordion</h2>
      <div>
        <p class="mb-2 text-sm text-secondary-500">Single mode (default)</p>
        <b-accordion :items="accordionItems" />
      </div>
      <div>
        <p class="mb-2 text-sm text-secondary-500">Multiple mode</p>
        <b-accordion :items="accordionItems" multiple />
      </div>
      <div>
        <p class="mb-2 text-sm text-secondary-500">Custom slot</p>
        <b-accordion :items="[
          { key: 'custom1', title: 'Кастомний контент' },
          { key: 'custom2', title: 'Ще один кастомний' },
        ]">
          <template #item="{ item }">
            <div class="flex items-center gap-3">
              <b-badge variant="info" size="sm">{{ item.key }}</b-badge>
              <span>Кастомний контент для: <strong>{{ item.title }}</strong></span>
            </div>
          </template>
        </b-accordion>
      </div>
    </section>

    <!-- BBreadcrumbs -->
    <section class="flex flex-col gap-4 rounded-2xl border border-secondary-200 bg-white p-6">
      <h2 class="text-xl font-semibold text-secondary-900">BBreadcrumbs</h2>
      <b-breadcrumbs :items="breadcrumbItems" />
      <b-breadcrumbs :items="[{ label: 'Головна', to: '/' }, { label: 'Каталог' }]" />
      <b-breadcrumbs :items="[{ label: 'Один елемент' }]" />
    </section>

    <!-- BDropdown -->
    <section class="flex flex-col gap-4 rounded-2xl border border-secondary-200 bg-white p-6">
      <h2 class="text-xl font-semibold text-secondary-900">BDropdown</h2>
      <div class="flex flex-wrap gap-4">
        <b-dropdown align="left">
          <template #trigger><b-btn variant="outline" size="sm">Dropdown Left</b-btn></template>
          <div class="py-1">
            <button class="w-full px-4 py-2 text-left text-sm text-secondary-700 hover:bg-secondary-50">Профіль</button>
            <button class="w-full px-4 py-2 text-left text-sm text-secondary-700 hover:bg-secondary-50">Замовлення</button>
            <button class="w-full px-4 py-2 text-left text-sm text-secondary-700 hover:bg-secondary-50">Налаштування</button>
            <hr class="my-1 border-secondary-100">
            <button class="w-full px-4 py-2 text-left text-sm text-danger hover:bg-secondary-50">Вийти</button>
          </div>
        </b-dropdown>
        <b-dropdown align="right">
          <template #trigger><b-btn variant="outline" size="sm">Dropdown Right</b-btn></template>
          <div class="py-1">
            <button class="w-full px-4 py-2 text-left text-sm text-secondary-700 hover:bg-secondary-50">Опція 1</button>
            <button class="w-full px-4 py-2 text-left text-sm text-secondary-700 hover:bg-secondary-50">Опція 2</button>
          </div>
        </b-dropdown>
      </div>
    </section>

    <!-- BModal -->
    <section class="flex flex-col gap-4 rounded-2xl border border-secondary-200 bg-white p-6">
      <h2 class="text-xl font-semibold text-secondary-900">BModal</h2>
      <div class="flex flex-wrap gap-3">
        <b-btn variant="outline" @click="isModalOpen = true">Default (md)</b-btn>
        <b-btn variant="outline" @click="isModalLgOpen = true">Large</b-btn>
        <b-btn variant="outline" @click="isModalPersistentOpen = true">Persistent</b-btn>
      </div>
    </section>

    <b-modal v-model:model-value="isModalOpen" title="Тестова модалка">
      <p class="text-sm text-secondary-700">Контент модального вікна. Закрийте натиснувши ✕, Escape або клік по оверлею.</p>
      <template #footer>
        <div class="flex justify-end gap-3">
          <b-btn variant="ghost" size="sm" @click="isModalOpen = false">Скасувати</b-btn>
          <b-btn size="sm" @click="isModalOpen = false">Зберегти</b-btn>
        </div>
      </template>
    </b-modal>

    <b-modal v-model:model-value="isModalLgOpen" title="Велика модалка" size="lg">
      <div class="flex flex-col gap-3">
        <p class="text-sm text-secondary-700">Це модалка розміру lg (max-w-lg).</p>
        <b-input model-value="" label="Ім'я" placeholder="Введіть ім'я" />
        <b-input model-value="" label="Email" placeholder="example@mail.com" />
        <b-textarea model-value="" label="Коментар" placeholder="Ваш коментар..." />
      </div>
      <template #footer>
        <div class="flex justify-end gap-3">
          <b-btn variant="ghost" size="sm" @click="isModalLgOpen = false">Скасувати</b-btn>
          <b-btn size="sm" @click="isModalLgOpen = false">Надіслати</b-btn>
        </div>
      </template>
    </b-modal>

    <b-modal v-model:model-value="isModalPersistentOpen" title="Persistent модалка" persistent :closable="false">
      <p class="text-sm text-secondary-700">Цю модалку не можна закрити кліком по оверлею або Escape. Тільки кнопкою.</p>
      <template #footer>
        <div class="flex justify-end"><b-btn size="sm" @click="isModalPersistentOpen = false">Зрозуміло</b-btn></div>
      </template>
    </b-modal>

    <!-- BDrawer -->
    <section class="flex flex-col gap-4 rounded-2xl border border-secondary-200 bg-white p-6">
      <h2 class="text-xl font-semibold text-secondary-900">BDrawer</h2>
      <div class="flex flex-wrap gap-3">
        <b-btn variant="outline" @click="isDrawerRight = true">Drawer Right</b-btn>
        <b-btn variant="outline" @click="isDrawerLeft = true">Drawer Left</b-btn>
      </div>
    </section>

    <b-drawer v-model="isDrawerRight" title="Кошик" side="right">
      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-3 rounded-lg border border-secondary-100 p-3">
          <div class="h-16 w-16 shrink-0 rounded-lg bg-secondary-100" />
          <div class="flex-1">
            <p class="text-sm font-medium text-secondary-800">Кросівки Nike Air Max</p>
            <p class="text-xs text-secondary-500">Розмір: 42, Колір: Білий</p>
            <p class="text-sm font-semibold text-primary-700">2 400 ₴</p>
          </div>
        </div>
        <div class="flex items-center gap-3 rounded-lg border border-secondary-100 p-3">
          <div class="h-16 w-16 shrink-0 rounded-lg bg-secondary-100" />
          <div class="flex-1">
            <p class="text-sm font-medium text-secondary-800">Футболка Adidas</p>
            <p class="text-xs text-secondary-500">Розмір: M, Колір: Чорний</p>
            <p class="text-sm font-semibold text-primary-700">890 ₴</p>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex flex-col gap-2">
          <div class="flex items-center justify-between text-sm">
            <span class="text-secondary-600">Разом:</span>
            <span class="font-semibold text-secondary-900">3 290 ₴</span>
          </div>
          <b-btn block>Оформити замовлення</b-btn>
        </div>
      </template>
    </b-drawer>

    <b-drawer v-model="isDrawerLeft" title="Меню" side="left">
      <nav class="flex flex-col gap-1">
        <a v-for="item in ['Каталог', 'Новинки', 'Хіти продажів', 'Акції', 'Обране', 'Замовлення', 'Профіль']" :key="item" href="#" class="rounded-lg px-3 py-2.5 text-sm text-secondary-700 transition-colors hover:bg-primary-50 hover:text-primary-700">
          {{ item }}
        </a>
        <hr class="my-2 border-secondary-100">
        <a href="#" class="rounded-lg px-3 py-2.5 text-sm text-danger transition-colors hover:bg-danger/10">Вийти</a>
      </nav>
    </b-drawer>

    <!-- BToast -->
    <section class="flex flex-col gap-4 rounded-2xl border border-secondary-200 bg-white p-6">
      <h2 class="text-xl font-semibold text-secondary-900">BToast</h2>
      <div class="flex flex-wrap gap-3">
        <b-btn variant="primary" size="sm" @click="toast.success('Товар додано до кошика!')">Success</b-btn>
        <b-btn variant="danger" size="sm" @click="toast.error('Помилка при збереженні')">Error</b-btn>
        <b-btn variant="outline" size="sm" @click="toast.warning('Залишилось 2 товари')">Warning</b-btn>
        <b-btn variant="ghost" size="sm" @click="toast.info('Нове повідомлення')">Info</b-btn>
        <b-btn variant="secondary" size="sm" @click="toast.success('Швидкий тост', 2000)">Short (2s)</b-btn>
      </div>
    </section>

    <!-- BConfirmDialog -->
    <section class="flex flex-col gap-4 rounded-2xl border border-secondary-200 bg-white p-6">
      <h2 class="text-xl font-semibold text-secondary-900">BConfirmDialog</h2>
      <div class="flex flex-wrap gap-3">
        <b-btn variant="primary" size="sm" @click="onConfirmPrimary">Зберегти (primary)</b-btn>
        <b-btn variant="danger" size="sm" @click="onConfirmDanger">Видалити (danger)</b-btn>
      </div>
      <p v-if="confirmResult" class="text-sm text-secondary-600">Результат: {{ confirmResult }}</p>
    </section>

    <!-- BPriceRange -->
    <section class="flex flex-col gap-4 rounded-2xl border border-secondary-200 bg-white p-6">
      <h2 class="text-xl font-semibold text-secondary-900">BPriceRange</h2>
      <b-price-range v-model="priceRange" :min="0" :max="1000" :step="10" />
      <p class="text-sm text-secondary-600">Значення: {{ priceRange.min }} — {{ priceRange.max }}</p>
    </section>

    <!-- BFile -->
    <section class="flex flex-col gap-4 rounded-2xl border border-secondary-200 bg-white p-6">
      <h2 class="text-xl font-semibold text-secondary-900">BFile</h2>
      <b-file v-model="fileValue" label="Будь-який файл" />
      <b-file v-model="imageFileValue" label="Тільки зображення" accept="image/*" />
      <b-file :model-value="null" label="Disabled" disabled />
      <b-file :model-value="null" label="З помилкою" error="Файл обов'язковий" />
      <p class="text-sm text-secondary-600">Файл: {{ fileValue?.name || 'не обрано' }}</p>
      <p class="text-sm text-secondary-600">Зображення: {{ imageFileValue?.name || 'не обрано' }}</p>
    </section>

    <!-- BPreview -->
    <section class="flex flex-col gap-4 rounded-2xl border border-secondary-200 bg-white p-6">
      <h2 class="text-xl font-semibold text-secondary-900">BPreview</h2>
      <div class="flex flex-wrap items-end gap-4">
        <div class="flex flex-col items-center gap-1">
          <b-preview src="https://i.pravatar.cc/150?img=12" alt="Photo" size="sm" />
          <span class="text-xs text-secondary-500">sm</span>
        </div>
        <div class="flex flex-col items-center gap-1">
          <b-preview src="https://i.pravatar.cc/150?img=12" alt="Photo" size="md" />
          <span class="text-xs text-secondary-500">md</span>
        </div>
        <div class="flex flex-col items-center gap-1">
          <b-preview src="https://i.pravatar.cc/150?img=12" alt="Photo" size="lg" />
          <span class="text-xs text-secondary-500">lg</span>
        </div>
      </div>
      <div class="flex flex-wrap items-end gap-4">
        <div class="flex flex-col items-center gap-1">
          <b-preview :src="null" size="md" />
          <span class="text-xs text-secondary-500">no src</span>
        </div>
        <div class="flex flex-col items-center gap-1">
          <b-preview src="https://broken-url.example/img.jpg" size="md" />
          <span class="text-xs text-secondary-500">broken</span>
        </div>
        <div class="flex flex-col items-center gap-1">
          <b-preview src="https://i.pravatar.cc/150?img=5" size="md" rounded />
          <span class="text-xs text-secondary-500">rounded</span>
        </div>
        <div class="flex flex-col items-center gap-1">
          <b-preview src="https://i.pravatar.cc/150?img=8" size="md" removable @remove="toast.info('Remove clicked')" />
          <span class="text-xs text-secondary-500">removable</span>
        </div>
      </div>
      <div v-if="previewUrl" class="flex flex-col gap-2">
        <p class="text-sm text-secondary-600">Превью завантаженого файлу:</p>
        <b-preview :src="previewUrl" size="lg" removable @remove="imageFileValue = null" />
      </div>
    </section>

  </div>
</template>