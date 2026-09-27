<script setup lang="ts">
import { catalogApi } from '~/modules/catalog/catalogApi'
import { contentApi } from '~/modules/content/contentApi'
import ProductCard from '~/modules/catalog/components/ProductCard.vue'
import { getDemoProductImage } from '~/modules/common/helpers/fileUrl'
import { focalVars } from '~/modules/common/helpers/focal'

async function resolveHomeRequest<T>(request: Promise<T>, fallback: T): Promise<T> {
  return await Promise.race([
    request.catch(() => fallback),
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), 800)),
  ])
}

const { data, pending } = await useAsyncData('home-storefront', async () => {
  const [
    heroSlides,
    promoBlocks,
    categories,
    newProducts,
    hitProducts,
    seasonalProducts,
  ] = await Promise.all([
    resolveHomeRequest(contentApi.getHeroSlides(), []),
    resolveHomeRequest(contentApi.getPromoBlocks(), []),
    resolveHomeRequest(catalogApi.getCategories(), []),
    resolveHomeRequest<ProductListResponse | null>(catalogApi.getProducts({ isNew: true, limit: 8 }), null),
    resolveHomeRequest<ProductListResponse | null>(catalogApi.getProducts({ isHit: true, limit: 8 }), null),
    resolveHomeRequest<ProductListResponse | null>(catalogApi.getProducts({ isSeasonal: true, limit: 8 }), null),
  ])

  return {
    heroSlides,
    promoBlocks,
    categories,
    newProducts: newProducts?.items ?? [],
    hitProducts: hitProducts?.items ?? [],
    seasonalProducts: seasonalProducts?.items ?? [],
  }
}, {
  default: () => ({
    heroSlides: [],
    promoBlocks: [],
    categories: [],
    newProducts: [],
    hitProducts: [],
    seasonalProducts: [],
  }),
})

const collectionTiles = [
  { title: 'Для нареченої', image: '/demo-media/stella-bride.jpg' },
  { title: 'Шовкові комплекти', image: '/demo-media/stella-silk.jpg' },
  { title: 'Шифонові комплекти', image: '/demo-media/stella-chiffon.jpg' },
  { title: 'Classic', image: '/demo-media/stella-classic.jpg' },
  { title: 'Білизняний стиль', image: '/demo-media/stella-lingerie-style.jpg' },
  { title: 'Вуличні костюми', image: '/demo-media/stella-street.jpg' },
]

// Реальні категорії з бекенду; поки їх немає — демо-плитки колекцій ведуть у загальний каталог.
const homeTiles = computed(() => {
  const roots = data.value.categories.filter((category) => !category.parentId && category.isActive).slice(0, 6)
  if (!roots.length) return collectionTiles.map((tile) => ({ ...tile, to: '/catalog' }))
  return roots.map((category, index) => ({
    title: category.name,
    image: getFileUrl(category.imageFile, 'large') || collectionTiles[index % collectionTiles.length]!.image,
    focal: focalVars(category),
    to: `/catalog/${category.slug}`,
  }))
})

// Мобільна головна як у Gepur: стрічка категорії → банер категорії. Тягнемо лише на мобільних.
const { isMobile } = useDevice()
const { data: categoryRails } = await useAsyncData('home-category-rails', async () => {
  if (!isMobile) return []
  const roots = data.value.categories.filter((category) => !category.parentId && category.isActive).slice(0, 3)
  return await Promise.all(roots.map(async (category, index) => {
    const products = await resolveHomeRequest<ProductListResponse | null>(catalogApi.getProducts({ category: category.slug, limit: 8 }), null)
    return {
      id: category.id,
      title: category.name,
      to: `/catalog/${category.slug}`,
      image: getFileUrl(category.imageFile, 'large') || collectionTiles[index % collectionTiles.length]!.image,
      focal: focalVars(category),
      products: products?.items ?? [],
    }
  }))
}, { default: () => [] })

const activeHero = computed(() => data.value.heroSlides.find((slide) => slide.isActive) ?? data.value.heroSlides[0] ?? null)

const activePromoBlocks = computed(() => data.value.promoBlocks
  .filter((block) => block.isActive)
  .sort((a, b) => a.sortOrder - b.sortOrder)
  .slice(0, 3))

function getProductSectionLink(query: 'isNew' | 'isHit' | 'isSeasonal') {
  return `/catalog?${query}=true`
}

// Власне фото блоку (з кадруванням з адмінки) → фото першого товару → демо.
function getPromoImage(block: PromoBlock) {
  return getFileUrl(block.imageFile, 'large') || getFileUrl(block.products[0]?.product.mainImage, 'large') || getDemoProductImage(block.id)
}

// «Своє» веде в каталог саме цієї добірки (?promo=<id>), а не в увесь каталог
function getPromoBlockLink(block: PromoBlock) {
  if (block.type === 'NEW') return getProductSectionLink('isNew')
  if (block.type === 'HIT') return getProductSectionLink('isHit')
  if (block.type === 'SEASONAL') return getProductSectionLink('isSeasonal')
  return `/catalog?promo=${block.id}`
}

useHead({
  title: 'Жіночий одяг онлайн',
  meta: [
    {
      name: 'description',
      content: 'Інтернет-магазин жіночого одягу: новинки, хіти продажів та сезонні добірки.',
    },
  ],
})
</script>

<template>
  <div class="home-page">
    <section class="relative overflow-hidden bg-secondary-100">
      <div v-if="activeHero" class="home-hero relative">
        <img
          v-if="activeHero.mediaType === 'IMAGE'"
          :src="getFileUrl(activeHero.mediaFile, 'large')"
          :alt="activeHero.title"
          class="focal-media absolute inset-0 h-full w-full object-cover"
          :style="focalVars(activeHero)"
        />
        <video
          v-else
          class="focal-media absolute inset-0 h-full w-full object-cover"
          :style="focalVars(activeHero)"
          autoplay
          muted
          loop
          playsinline
        >
          <source :src="getFileUrl(activeHero.mediaFile)" />
        </video>

        <div class="absolute inset-0 bg-black/20" />

        <div class="home-hero__inner store-container relative flex md:min-h-[min(46rem,100svh)] items-end pb-8 pt-20 md:pb-16">
          <div class="max-w-xl text-white">
            <p class="store-eyebrow mb-4 !text-white/85">
              Нова колекція
            </p>
            <h1 class="store-title !text-white text-[2rem] sm:text-6xl lg:text-7xl">
              {{ activeHero.title }}
            </h1>
            <p v-if="activeHero.subtitle" class="mt-4 hidden max-w-lg md:block text-base leading-7 text-white/90 sm:text-lg">
              {{ activeHero.subtitle }}
            </p>
            <BBtn
              v-if="activeHero.buttonText && activeHero.buttonLink"
              :to="activeHero.buttonLink"
              class="mt-6 md:mt-8"
              variant="primary"
              size="lg"
            >
              {{ activeHero.buttonText }}
            </BBtn>
          </div>
        </div>
      </div>

      <div v-else class="home-hero relative">
        <img src="/demo-media/stella-hero.jpg" alt="Нова колекція Stella" class="absolute inset-0 h-full w-full object-cover object-[center_27%] md:object-[center_24%]" />
        <div class="absolute inset-0 bg-black/25" />
        <div class="home-hero__inner store-container relative flex md:min-h-[min(46rem,100svh)] items-end pb-8 pt-20 md:pb-16">
          <div class="max-w-xl text-white">
          <p class="store-eyebrow mb-4 !text-white/85">
            Stella · шовк і мереживо
          </p>
          <h1 class="store-title !text-white text-[2rem] sm:text-6xl lg:text-7xl">
            Жіночність у деталях
          </h1>
          <p class="mt-4 hidden max-w-lg text-base leading-7 text-white/90 sm:text-lg md:block">
            Шовкові комплекти, сукні та костюми для особливих і щоденних образів.
          </p>
          <BBtn to="/catalog" class="mt-6 md:mt-8" variant="primary" size="lg">
            Перейти в каталог
          </BBtn>
          </div>
        </div>
      </div>
    </section>

    <section class="store-container hidden pt-12 md:block lg:pt-16">
      <div class="mb-8 text-center">
        <p class="store-eyebrow">Колекції</p>
        <h2 class="store-title mt-3 text-3xl sm:text-4xl"><NuxtLink to="/catalog" class="transition-colors hover:text-primary-700">Обирайте свій образ</NuxtLink></h2>
      </div>
      <div class="grid grid-cols-3 gap-3 lg:grid-cols-6 lg:gap-4">
        <NuxtLink v-for="tile in homeTiles" :key="tile.title" :to="tile.to" class="home-tile">
          <img :src="tile.image" :alt="tile.title" loading="lazy" class="focal-media" :style="'focal' in tile ? tile.focal : undefined" />
          <span class="home-tile__label">{{ tile.title }}</span>
        </NuxtLink>
      </div>
    </section>

    <section class="store-container py-6 md:py-10 lg:py-14">
      <div class="mb-3 flex items-end justify-between gap-4 md:mb-6">
        <div>
          <p class="store-eyebrow">
            New in
          </p>
          <h2 class="store-title mt-2 text-xl md:text-3xl">
            <NuxtLink :to="getProductSectionLink('isNew')" class="inline-flex items-center gap-1">Новинки<Icon name="lucide:chevron-right" size="18" class="md:hidden" /></NuxtLink>
          </h2>
        </div>
        <BBtn :to="getProductSectionLink('isNew')" variant="ghost" size="sm" class="max-md:!hidden">
          Дивитися всі
          <Icon name="lucide:arrow-right" size="18" class="home-cta-arrow" />
        </BBtn>
      </div>

      <div v-if="pending" class="home-product-rail">
        <div
          v-for="index in 8"
          :key="index"
          class="aspect-[3/4] animate-pulse rounded-xl bg-secondary-100"
        />
      </div>
      <ProductRail v-else-if="data.newProducts.length">
        <ProductCard
          v-for="product in data.newProducts"
          :key="product.id"
          :product="product"
          compact
        />
      </ProductRail>
    </section>

    <template v-for="rail in categoryRails" :key="rail.id">
      <section v-if="rail.products.length" class="store-container py-6 md:hidden">
        <h2 class="store-title mb-3 text-xl">
          <NuxtLink :to="rail.to" class="inline-flex items-center gap-1">{{ rail.title }}<Icon name="lucide:chevron-right" size="18" /></NuxtLink>
        </h2>
        <ProductRail>
          <ProductCard v-for="product in rail.products" :key="product.id" :product="product" compact />
        </ProductRail>
      </section>
      <NuxtLink :to="rail.to" class="home-promo block md:hidden" :aria-label="rail.title">
        <img :src="rail.image" :alt="rail.title" loading="lazy" class="focal-media absolute inset-0" :style="rail.focal" />
      </NuxtLink>
    </template>

    <section v-for="block in activePromoBlocks" :key="block.id" class="store-container py-4 max-md:px-0 lg:py-6">
      <NuxtLink :to="getPromoBlockLink(block)" class="home-promo group block">
        <img :src="getPromoImage(block)" :alt="block.title" class="focal-media" :style="block.imageFile ? focalVars(block) : undefined" />
        <span class="home-promo__overlay">
          <span>
            <span class="block text-sm font-semibold text-white/75">{{ block.type === 'CUSTOM' ? 'Stella' : 'Колекція' }}</span>
            <span class="store-title mt-2 block !text-white text-3xl sm:text-5xl">{{ block.title }} <span aria-hidden="true">→</span></span>
          </span>
        </span>
      </NuxtLink>
      <div v-if="block.products.length" v-drag-scroll class="home-product-rail mt-5">
        <NuxtLink
          v-for="item in block.products.slice(0, 5)"
          :key="item.product.id"
          :to="`/product/${item.product.slug}`"
          class="group block overflow-hidden bg-secondary-100"
        >
          <img :src="getFileUrl(item.product.mainImage, 'medium') || getDemoProductImage(item.product.id)" :alt="item.product.name" class="aspect-[3/4] h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
        </NuxtLink>
      </div>
    </section>

    <section class="store-container py-6 md:py-10 lg:py-14">
      <div class="mb-3 flex items-end justify-between gap-4 md:mb-6">
        <div>
          <p class="store-eyebrow">
            Best sellers
          </p>
          <h2 class="store-title mt-2 text-xl md:text-3xl">
            <NuxtLink :to="getProductSectionLink('isHit')" class="inline-flex items-center gap-1">Хіти продажів<Icon name="lucide:chevron-right" size="18" class="md:hidden" /></NuxtLink>
          </h2>
        </div>
        <BBtn :to="getProductSectionLink('isHit')" variant="ghost" size="sm" class="max-md:!hidden">
          Дивитися всі
          <Icon name="lucide:arrow-right" size="18" class="home-cta-arrow" />
        </BBtn>
      </div>

      <div v-if="pending" class="home-product-rail">
        <div
          v-for="index in 8"
          :key="index"
          class="aspect-[3/4] animate-pulse rounded-xl bg-secondary-100"
        />
      </div>
      <ProductRail v-else-if="data.hitProducts.length">
        <ProductCard
          v-for="product in data.hitProducts"
          :key="product.id"
          :product="product"
          compact
        />
      </ProductRail>
    </section>

    <section v-if="data.seasonalProducts.length" class="store-container py-6 md:py-10 lg:py-14">
      <div class="mb-6 flex items-end justify-between gap-4">
        <h2 class="store-title text-xl md:text-3xl"><NuxtLink :to="getProductSectionLink('isSeasonal')" class="group inline-flex items-center gap-1 transition-colors hover:text-primary-700">Сезонна добірка <Icon name="lucide:chevron-right" size="20" class="transition-transform group-hover:translate-x-0.5" /></NuxtLink></h2>
        <NuxtLink :to="getProductSectionLink('isSeasonal')" class="store-link hidden sm:inline-flex">Дивитися все</NuxtLink>
      </div>
      <ProductRail>
        <ProductCard v-for="product in data.seasonalProducts" :key="product.id" :product="product" compact />
      </ProductRail>
    </section>

    <section class="store-container hidden py-10 md:block lg:py-14">
      <div class="grid gap-8 bg-primary-100 px-6 py-12 text-center sm:px-12 lg:py-16">
        <div>
          <p class="store-eyebrow">
            Про Stella
          </p>
          <h2 class="store-title mt-3 text-3xl sm:text-4xl">
            <NuxtLink to="/about" class="transition-colors hover:text-primary-700">Ніжність у кожній деталі</NuxtLink>
          </h2>
        </div>
        <p class="mx-auto max-w-2xl text-base leading-8 text-secondary-600">
          Шовкові та шифонові комплекти, пеньюари, піжами й образи для нареченої. Речі, в яких хочеться прокидатися, зустрічати ранок і святкувати найважливіші дні.
        </p>
        <div><BBtn to="/about" variant="outline">Детальніше</BBtn></div>
      </div>
    </section>

    <InstagramSection />
  </div>
</template>

<style scoped>
.home-cta-arrow {
  color: currentColor;
  animation: home-cta-arrow-pulse 1.6s ease-in-out infinite;
}

@keyframes home-cta-arrow-pulse {
  0%,
  100% {
    opacity: 0.72;
    transform: translateX(0) scale(1);
  }

  50% {
    opacity: 1;
    transform: translateX(3px) scale(1.08);
  }
}
</style>
