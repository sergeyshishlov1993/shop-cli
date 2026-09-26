<script setup lang="ts">
// Повноекранний пошук (як у Gepur): велике поле, історія запитів, живі результати сіткою карток,
// Enter / «Усі результати» → каталог із ?search=.
import { catalogApi } from '~/modules/catalog/catalogApi'
import ProductCard from '~/modules/catalog/components/ProductCard.vue'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

const router = useRouter()
const query = ref('')
const results = ref<ProductListItem[]>([])
const total = ref(0)
const loading = ref(false)
const input = useTemplateRef<HTMLInputElement>('input')
const history = useLocalStorage<string[]>('search-history', [])
const suggestions = ['Шовкова піжама', 'Пеньюар', 'Халат', 'Для нареченої', 'Велюровий костюм']

// Ефект «друкування» підказки в порожньому полі: друкує слово, стирає, переходить до наступного
const typed = ref('')
let typingTimer: ReturnType<typeof setTimeout> | null = null
let wordIndex = 0
let charIndex = 0
let deleting = false
function typeStep() {
  const word = suggestions[wordIndex]!.toLowerCase()
  charIndex += deleting ? -1 : 1
  typed.value = word.slice(0, charIndex)
  let delay = deleting ? 45 : 90
  if (!deleting && charIndex === word.length) {
    deleting = true
    delay = 1400
  }
  else if (deleting && charIndex === 0) {
    deleting = false
    wordIndex = (wordIndex + 1) % suggestions.length
    delay = 300
  }
  typingTimer = setTimeout(typeStep, delay)
}
function stopTyping() {
  if (typingTimer) clearTimeout(typingTimer)
  typingTimer = null
}
const placeholder = computed(() => `Пошук: ${typed.value}`)

let requestId = 0
const runSearch = useDebounceFn(async (value: string) => {
  const id = ++requestId
  if (!value) {
    results.value = []
    total.value = 0
    loading.value = false
    return
  }
  try {
    const response = await catalogApi.getProducts({ search: value, limit: 8 })
    if (id !== requestId) return
    results.value = response.items
    total.value = response.totalCount
  }
  catch {
    if (id === requestId) results.value = []
  }
  finally {
    if (id === requestId) loading.value = false
  }
}, 300)

watch(query, (value) => {
  loading.value = Boolean(value.trim())
  runSearch(value.trim())
})

const close = () => emit('update:modelValue', false)

async function submit(value = query.value) {
  const trimmed = value.trim()
  if (!trimmed) return
  history.value = [trimmed, ...history.value.filter(item => item !== trimmed)].slice(0, 8)
  close()
  await router.push({ path: '/catalog', query: { search: trimmed, page: '1' } })
}

watch(() => props.modelValue, async (open) => {
  if (import.meta.client) document.body.style.overflow = open ? 'hidden' : ''
  stopTyping()
  if (open) {
    typeStep()
    await nextTick()
    input.value?.focus()
  }
})

const route = useRoute()
watch(() => route.fullPath, close)

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.modelValue) close()
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  stopTyping()
  if (import.meta.client) document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="b-fade">
      <div v-if="modelValue" class="search-overlay fixed inset-0 z-[110] overflow-y-auto" role="dialog" aria-modal="true" aria-label="Пошук">
        <div class="store-container py-5 lg:py-8">
          <form class="flex items-center gap-3 border-b border-secondary-300 pb-3" @submit.prevent="submit()">
            <Icon name="lucide:search" size="24" class="shrink-0 text-secondary-500" />
            <input
              ref="input"
              v-model="query"
              type="search"
              :placeholder="placeholder"
              class="min-w-0 flex-1 bg-transparent text-xl text-secondary-900 outline-none placeholder:text-secondary-400 lg:text-3xl"
              aria-label="Пошук товарів"
            >
            <button type="button" class="flex size-10 shrink-0 items-center justify-center rounded-full text-secondary-600 transition hover:bg-secondary-100" aria-label="Закрити пошук" @click="close">
              <Icon name="lucide:x" size="24" />
            </button>
          </form>

          <!-- Порожній запит: історія + популярне -->
          <div v-if="!query.trim()" class="mt-6 space-y-6">
            <section v-if="history.length">
              <div class="mb-3 flex items-center justify-between">
                <h2 class="search-overlay__title">Ви шукали</h2>
                <button type="button" class="text-xs text-secondary-500 hover:text-primary-700" @click="history = []">Очистити</button>
              </div>
              <div class="flex flex-wrap gap-2">
                <button v-for="item in history" :key="item" type="button" class="glass rounded-full px-4 py-2 text-sm text-secondary-800 hover:text-primary-700" @click="submit(item)">
                  {{ item }}
                </button>
              </div>
            </section>
            <section>
              <h2 class="search-overlay__title mb-3">Популярне</h2>
              <div class="flex flex-wrap gap-2">
                <button v-for="item in suggestions" :key="item" type="button" class="glass rounded-full px-4 py-2 text-sm text-secondary-800 hover:text-primary-700" @click="query = item">
                  {{ item }}
                </button>
              </div>
            </section>
          </div>

          <!-- Результати -->
          <div v-else class="mt-6" :aria-busy="loading">
            <p v-if="!loading && !results.length" class="py-10 text-center text-secondary-500">
              Нічого не знайдено за «{{ query.trim() }}»
            </p>
            <template v-else>
              <div class="loading-blur grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
                <ProductCard v-for="product in results" :key="product.id" :product="product" compact />
              </div>
              <div v-if="total > 0" class="mt-8 text-center">
                <BBtn variant="primary" size="lg" @click="submit()">
                  Усі результати ({{ total }})
                  <Icon name="lucide:arrow-right" size="18" />
                </BBtn>
              </div>
            </template>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.search-overlay {
  /* Рідке скло: крізь оверлей видно сторінку, розмиту й насичену */
  /* Щільніше за звичайне скло — текст на ньому має читатися поверх будь-якого фото */
  background: color-mix(in srgb, var(--surface) 72%, transparent);
  -webkit-backdrop-filter: blur(32px) saturate(180%);
  backdrop-filter: blur(32px) saturate(180%);
  box-shadow: inset 0 1px 0 var(--glass-highlight);
}
.search-overlay__title {
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-secondary-900);
}
</style>
