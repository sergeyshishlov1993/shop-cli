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
