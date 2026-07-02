<script setup lang="ts">
const selectedCity = ref('')
const cityOptions = [
  { label: 'Київ', value: 'kyiv' },
  { label: 'Львів', value: 'lviv' },
  { label: 'Одеса', value: 'odesa' },
  { label: 'Харків', value: 'kharkiv' },
  { label: 'Дніпро', value: 'dnipro' },
  { label: 'Запоріжжя', value: 'zaporizhzhia' },
  { label: 'Вінниця', value: 'vinnytsia' },
  { label: 'Полтава', value: 'poltava' },
  { label: 'Чернігів', value: 'chernihiv' },
  { label: 'Черкаси', value: 'cherkasy' },
]

const autocompleteValue = ref<string | number | null>(null)
const autocompleteOptions = ref<{ value: string | number; label: string }[]>([])
const autocompleteLoading = ref(false)

function onAutocompleteSearch(query: string) {
  autocompleteLoading.value = true
  setTimeout(() => {
    autocompleteOptions.value = cityOptions.filter((c) =>
      c.label.toLowerCase().includes(query.toLowerCase()),
    )
    autocompleteLoading.value = false
  }, 500)
}

const autocompleteValueError = ref<string | number | null>(null)
const autocompleteDisabledValue = ref<string | number | null>('kyiv')

const isModalOpen = ref(false)

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
  setTimeout(() => {
    isLoading.value = false
  }, 2000)
}

function onSearch(value: string) {
  searchResult.value = value
}
</script>

<template>
  <div class="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-4 py-10">
    <!-- BBtn -->
    <section class="flex flex-col gap-4 rounded-2xl border border-secondary-200 bg-white p-6">
      <h2 class="text-xl font-semibold text-secondary-900">
        BBtn
      </h2>

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

    <!-- BInput — Default -->
    <section class="flex flex-col gap-4 rounded-2xl border border-secondary-200 bg-white p-6">
      <h2 class="text-xl font-semibold text-secondary-900">
        BInput — Default
      </h2>

      <b-input
        v-model="inputText"
        label="Текст"
        placeholder="Введіть текст"
      />

      <b-input
        v-model="inputEmail"
        type="email"
        label="Email"
        placeholder="example@mail.com"
        required
      />

      <b-input
        model-value="Заблоковано"
        label="Disabled"
        disabled
      />
    </section>

    <!-- BInput — Password -->
    <section class="flex flex-col gap-4 rounded-2xl border border-secondary-200 bg-white p-6">
      <h2 class="text-xl font-semibold text-secondary-900">
        BInput — Password
      </h2>

      <b-input
        v-model="inputPassword"
        mode="password"
        label="Пароль"
        placeholder="Введіть пароль"
      />

      <b-input
        model-value="secret123"
        mode="password"
        label="З помилкою"
        error="Мінімум 8 символів"
      />

      <b-input
        model-value=""
        mode="password"
        label="Disabled"
        placeholder="Пароль"
        disabled
      />

      <p class="text-sm text-secondary-600">
        Значення: {{ inputPassword }}
      </p>
    </section>

    <!-- BInput — Phone -->
    <section class="flex flex-col gap-4 rounded-2xl border border-secondary-200 bg-white p-6">
      <h2 class="text-xl font-semibold text-secondary-900">
        BInput — Phone
      </h2>

      <b-input
        v-model="inputPhone"
        mode="phone"
        label="Телефон"
      />

      <b-input
        model-value=""
        mode="phone"
        label="З помилкою"
        error="Невірний формат"
        required
      />

      <b-input
        model-value="+38 (067) 123-45-67"
        mode="phone"
        label="Disabled"
        disabled
      />

      <p class="text-sm text-secondary-600">
        Значення: {{ inputPhone }}
      </p>
    </section>

    <!-- BInput — Search -->
    <section class="flex flex-col gap-4 rounded-2xl border border-secondary-200 bg-white p-6">
      <h2 class="text-xl font-semibold text-secondary-900">
        BInput — Search
      </h2>

      <b-input
        v-model="inputSearch"
        mode="search"
        label="Пошук"
        :debounce="500"
        @search="onSearch"
      />

      <b-input
        model-value=""
        mode="search"
        label="Disabled"
        disabled
      />

      <p class="text-sm text-secondary-600">
        Значення: {{ inputSearch }}
      </p>
      <p class="text-sm text-secondary-600">
        Останній пошук: {{ searchResult || '—' }}
      </p>
    </section>

    <!-- BSelect -->
    <section class="flex flex-col gap-4 rounded-2xl border border-secondary-200 bg-white p-6">
      <h2 class="text-xl font-semibold text-secondary-900">
        BSelect
      </h2>

      <b-select
        v-model="selectedCity"
        label="Місто"
        placeholder="Оберіть місто"
        :options="cityOptions"
      />

      <b-select
        model-value=""
        label="Disabled"
        placeholder="Недоступно"
        :options="cityOptions"
        disabled
      />

      <b-select
        model-value=""
        label="З помилкою"
        placeholder="Оберіть місто"
        :options="cityOptions"
        error="Обов'язкове поле"
      />

      <p class="text-sm text-secondary-600">
        Значення: {{ selectedCity || 'не вибрано' }}
      </p>
    </section>

    <!-- BAutocomplete -->
    <section class="flex flex-col gap-4 rounded-2xl border border-secondary-200 bg-white p-6">
      <h2 class="text-xl font-semibold text-secondary-900">
        BAutocomplete
      </h2>

      <b-autocomplete
        v-model="autocompleteValue"
        :options="autocompleteOptions"
        :loading="autocompleteLoading"
        label="Місто (автодоповнення)"
        placeholder="Почніть вводити назву міста"
        :min-chars="1"
        @search="onAutocompleteSearch"
      />

      <p class="text-sm text-secondary-600">
        Значення: {{ autocompleteValue || 'не вибрано' }}
      </p>

      <b-autocomplete
        v-model="autocompleteValueError"
        :options="[]"
        label="З помилкою"
        placeholder="Введіть місто"
        error="Обов'язкове поле"
        required
      />

      <b-autocomplete
        v-model="autocompleteDisabledValue"
        :options="cityOptions"
        label="Disabled"
        placeholder="Недоступно"
        disabled
      />
    </section>

    <!-- BTextarea -->
    <section class="flex flex-col gap-4 rounded-2xl border border-secondary-200 bg-white p-6">
      <h2 class="text-xl font-semibold text-secondary-900">
        BTextarea
      </h2>

      <b-textarea
        v-model="textareaValue"
        label="Коментар"
        placeholder="Напишіть коментар..."
      />

      <b-textarea
        model-value=""
        label="З помилкою"
        placeholder="Текст..."
        error="Обов'язкове поле"
        required
      />

      <b-textarea
        model-value="Заблокований текст"
        label="Disabled"
        disabled
      />
    </section>

    <!-- BCheckbox -->
    <section class="flex flex-col gap-4 rounded-2xl border border-secondary-200 bg-white p-6">
      <h2 class="text-xl font-semibold text-secondary-900">
        BCheckbox
      </h2>

      <b-checkbox
        v-model="isChecked"
        label="Погоджуюсь з умовами"
      />

      <b-checkbox
        v-model="isCheckedDisabled"
        label="Disabled checked"
        disabled
      />

      <b-checkbox
        :model-value="false"
        label="Disabled unchecked"
        disabled
      />

      <p class="text-sm text-secondary-600">
        Значення: {{ isChecked }}
      </p>
    </section>

    <!-- BRadio -->
    <section class="flex flex-col gap-4 rounded-2xl border border-secondary-200 bg-white p-6">
      <h2 class="text-xl font-semibold text-secondary-900">
        BRadio
      </h2>

      <b-radio
        v-model="radioValue"
        name="demo-radio"
        value="option1"
        label="Варіант 1"
      />

      <b-radio
        v-model="radioValue"
        name="demo-radio"
        value="option2"
        label="Варіант 2"
      />

      <b-radio
        v-model="radioValue"
        name="demo-radio"
        value="option3"
        label="Варіант 3"
      />

      <b-radio
        model-value=""
        name="demo-radio-disabled"
        value="disabled"
        label="Disabled"
        disabled
      />

      <p class="text-sm text-secondary-600">
        Значення: {{ radioValue }}
      </p>
    </section>

    <!-- BToggle -->
    <section class="flex flex-col gap-4 rounded-2xl border border-secondary-200 bg-white p-6">
      <h2 class="text-xl font-semibold text-secondary-900">
        BToggle
      </h2>

      <b-toggle
        v-model="toggleValue"
        label="Сповіщення"
      />

      <b-toggle
        v-model="toggleValueSm"
        label="Маленький"
        size="sm"
      />

      <b-toggle
        v-model="toggleDisabled"
        label="Disabled"
        disabled
      />

      <p class="text-sm text-secondary-600">
        Значення: {{ toggleValue }}
      </p>
    </section>

    <!-- BModal -->
    <section class="flex flex-col gap-4 rounded-2xl border border-secondary-200 bg-white p-6">
      <h2 class="text-xl font-semibold text-secondary-900">
        BModal
      </h2>

      <b-btn variant="outline" @click="isModalOpen = true">
        Відкрити модалку
      </b-btn>
    </section>

    <b-modal
      v-model:model-value="isModalOpen"
      title="Тестова модалка"
    >
      <p class="text-sm text-secondary-700">
        Контент модального вікна
      </p>

      <template #footer>
        <div class="flex justify-end">
          <b-btn variant="outline" @click="isModalOpen = false">
            Закрити
          </b-btn>
        </div>
      </template>
    </b-modal>
  </div>
</template>
