<script setup lang="ts">
interface Props {
  media: ProductMedia[]
  productName: string
}

const props = defineProps<Props>()
const activeIndex = ref(0)
const fullscreenIndex = ref(0)
const isFullscreen = ref(false)
const galleryRef = ref<HTMLElement | null>(null)

const items = computed(() => [...props.media].sort((a, b) => {
  if (a.isMain && !b.isMain) return -1
  if (!a.isMain && b.isMain) return 1
  return a.sortOrder - b.sortOrder
}))
const activeItem = computed(() => items.value[activeIndex.value] ?? null)

watch(items, () => { activeIndex.value = 0 })

function select(index: number) {
  activeIndex.value = index
  scrollToGalleryStart()
}

function scrollToGalleryStart() {
  if (!import.meta.client) return
  nextTick(() => {
    requestAnimationFrame(() => {
      const gallery = galleryRef.value
      if (!gallery) return
      const stickyHeader = document.querySelector<HTMLElement>('header')
      const headerHeight = stickyHeader?.getBoundingClientRect().height ?? 0
      const top = gallery.getBoundingClientRect().top + window.scrollY - headerHeight - 4
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
    })
  })
}

function onMainSlideChanged(index: number) {
  activeIndex.value = index
  scrollToGalleryStart()
}

function openFullscreen() {
  if (!activeItem.value) return
  fullscreenIndex.value = activeIndex.value
  isFullscreen.value = true
}

function closeFullscreen() {
  activeIndex.value = fullscreenIndex.value
  isFullscreen.value = false
}

function handleKeydown(event: KeyboardEvent) {
  if (!isFullscreen.value) return
  if (event.key === 'Escape') closeFullscreen()
}

watch(isFullscreen, (open) => {
  if (import.meta.client) document.body.style.overflow = open ? 'hidden' : ''
})

onMounted(() => window.addEventListener('keydown', handleKeydown))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  if (import.meta.client) document.body.style.overflow = ''
})
</script>

<template>
  <div ref="galleryRef" class="product-gallery">
    <div v-if="!items.length" class="product-gallery__empty">
      <Icon name="lucide:image" size="42" />
      <span>Немає медіа</span>
    </div>

    <template v-else>
      <!-- Десктоп: вертикальна стрічка мініатюр праворуч від фото -->
      <div class="product-gallery__rail" role="list">
        <button
          v-for="(item, index) in items"
          :key="item.id"
          type="button"
          role="listitem"
          class="product-gallery__thumb"
          :class="{ 'product-gallery__thumb--active': activeIndex === index }"
          :aria-label="`Показати медіа ${index + 1}`"
          @click="select(index)"
        >
          <span v-if="item.externalUrl" class="product-gallery__play"><Icon name="lucide:instagram" size="18" /></span>
          <video v-else-if="item.mediaType === 'VIDEO'" :src="getFileUrl(item.file)" muted playsinline preload="metadata" />
          <img v-else :src="getFileUrl(item.file, 'thumb')" :alt="`${productName} — мініатюра ${index + 1}`" />
        </button>
      </div>

      <BSlider
        v-model="activeIndex"
        class="product-gallery__main"
        :slides-per-view="1"
        :gap="0"
        :with-btns="items.length > 1"
        :is-remove-btns="true"
        no-blur
        with-keyboard
        @slide-changed="onMainSlideChanged"
      >
        <swiper-slide v-for="(item, index) in items" :key="item.id">
          <button type="button" class="product-gallery__media" :aria-label="`Відкрити медіа ${index + 1} на весь екран`" @click="openFullscreen">
            <iframe
              v-if="item.externalUrl"
              :src="getInstagramEmbedUrl(item.externalUrl) ?? undefined"
              class="product-gallery__asset"
              loading="lazy"
              allowfullscreen
              :title="`${productName} — Instagram`"
            />
            <video
              v-else-if="item.mediaType === 'VIDEO'"
              :src="getFileUrl(item.file)"
              class="product-gallery__asset"
              autoplay
              muted
              loop
              playsinline
              preload="metadata"
            />
            <img
              v-else
              :src="getFileUrl(item.file, 'large')"
              :alt="`${productName} — фото ${index + 1}`"
              class="product-gallery__asset"
              :style="{ objectPosition: focalPosition(item.focalX, item.focalY) }"
            />
            <span class="product-gallery__expand"><Icon name="lucide:maximize-2" size="18" /></span>
          </button>
        </swiper-slide>
      </BSlider>

      <div class="product-gallery__footer">
        <BSlider
          class="product-gallery__thumb-slider"
          slides-per-view="auto"
          :gap="8"
          :with-btns="items.length > 6"
          :is-remove-btns="true"
          :scroll-step="4"
          no-blur
        >
          <swiper-slide v-for="(item, index) in items" :key="item.id">
            <button
              type="button"
              class="product-gallery__thumb"
              :class="{ 'product-gallery__thumb--active': activeIndex === index }"
              :aria-label="`Показати медіа ${index + 1}`"
              :aria-current="activeIndex === index ? 'true' : undefined"
              @click="select(index)"
            >
              <span v-if="item.externalUrl" class="product-gallery__play"><Icon name="lucide:instagram" size="18" /></span>
          <video v-else-if="item.mediaType === 'VIDEO'" :src="getFileUrl(item.file)" muted playsinline preload="metadata" />
              <img v-else :src="getFileUrl(item.file, 'thumb')" :alt="`${productName} — мініатюра ${index + 1}`" />
              <span v-if="item.mediaType === 'VIDEO' && !item.externalUrl" class="product-gallery__play"><Icon name="lucide:play" size="15" /></span>
            </button>
          </swiper-slide>
        </BSlider>
        <span class="product-gallery__counter">{{ activeIndex + 1 }} / {{ items.length }}</span>
      </div>
    </template>

    <Teleport to="body">
      <Transition name="gallery-fade">
        <div v-if="isFullscreen" class="product-gallery-fullscreen" role="dialog" aria-modal="true" :aria-label="`Медіа товару ${productName}`">
          <button type="button" class="product-gallery-fullscreen__close" aria-label="Закрити" @click="closeFullscreen">
            <Icon name="lucide:x" size="26" />
          </button>

          <BSlider
            v-model="fullscreenIndex"
            class="product-gallery-fullscreen__main"
            :slides-per-view="1"
            :gap="0"
            :with-btns="items.length > 1"
            :is-remove-btns="false"
            no-blur
            with-keyboard
          >
            <swiper-slide v-for="(item, index) in items" :key="item.id">
              <div class="product-gallery-fullscreen__media">
                <iframe
                  v-if="item.externalUrl"
                  :src="getInstagramEmbedUrl(item.externalUrl) ?? undefined"
                  class="product-gallery-fullscreen__asset product-gallery-fullscreen__embed"
                  allowfullscreen
                  :title="`${productName} — Instagram`"
                />
                <video
                  v-else-if="item.mediaType === 'VIDEO'"
                  :src="getFileUrl(item.file)"
                  class="product-gallery-fullscreen__asset"
                  controls
                  autoplay
                  muted
                  loop
                  playsinline
                />
                <img
                  v-else
                  :src="getFileUrl(item.file, 'original')"
                  :alt="`${productName} — фото ${index + 1}`"
                  class="product-gallery-fullscreen__asset"
                />
              </div>
            </swiper-slide>
          </BSlider>

          <div class="product-gallery-fullscreen__bottom">
            <BSlider
              class="product-gallery-fullscreen__thumbs"
              slides-per-view="auto"
              :gap="8"
              :with-btns="items.length > 8"
              :is-remove-btns="true"
              :scroll-step="5"
              no-blur
            >
              <swiper-slide v-for="(item, index) in items" :key="item.id">
                <button
                  type="button"
                  class="product-gallery__thumb product-gallery__thumb--dark"
                  :class="{ 'product-gallery__thumb--active': fullscreenIndex === index }"
                  :aria-label="`Показати медіа ${index + 1}`"
                  @click="fullscreenIndex = index"
                >
                  <span v-if="item.externalUrl" class="product-gallery__play"><Icon name="lucide:instagram" size="18" /></span>
          <video v-else-if="item.mediaType === 'VIDEO'" :src="getFileUrl(item.file)" muted playsinline preload="metadata" />
                  <img v-else :src="getFileUrl(item.file, 'thumb')" :alt="`${productName} — мініатюра ${index + 1}`" />
                  <span v-if="item.mediaType === 'VIDEO' && !item.externalUrl" class="product-gallery__play"><Icon name="lucide:play" size="15" /></span>
                </button>
              </swiper-slide>
            </BSlider>
            <span>{{ fullscreenIndex + 1 }} / {{ items.length }}</span>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.product-gallery {
  width: 100%;
  min-width: 0;
}

.product-gallery__empty {
  display: flex;
  aspect-ratio: 3 / 4;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 8px;
  border-radius: 12px;
  background: #f5ede8;
  color: #8c7f79;
}

.product-gallery__main :deep(swiper-container),
.product-gallery__main :deep(.b-slider__inner) {
  width: 100%;
  height: auto;
  aspect-ratio: 3 / 4;
  background: #fff;
}

.product-gallery__main :deep(swiper-slide) {
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;
}

.product-gallery__main :deep(.b-slider__btn--prev) {
  left: 10px;
}

.product-gallery__main :deep(.b-slider__btn--next) {
  right: 10px;
}

.product-gallery__media {
  position: relative;
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  cursor: zoom-in;
}

.product-gallery__asset {
  display: block;
  border: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-gallery__expand {
  position: absolute;
  right: 14px;
  bottom: 14px;
  display: flex;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.9);
  color: #3a3230;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.product-gallery__media:hover .product-gallery__expand {
  opacity: 1;
}

.product-gallery__footer {
  display: flex;
  align-items: center;
  gap: 20px;
  max-width: 100%;
  padding: 20px 0 20px 20px;
  overflow: hidden;
  border-bottom: 1px solid #ebe0da;
}

.product-gallery__thumb-slider {
  min-width: 0;
  flex: 1;
}

.product-gallery__thumb-slider :deep(swiper-slide),
.product-gallery-fullscreen__thumbs :deep(swiper-slide) {
  width: 80px !important;
}

.product-gallery__thumb {
  position: relative;
  display: block;
  width: 80px;
  height: 80px;
  overflow: hidden;
  border: 1px solid transparent;
  border-radius: 4px;
  background: #f5ede8;
  opacity: 0.58;
  transition: opacity 0.2s ease, border-color 0.2s ease;
}

.product-gallery__thumb:hover {
  opacity: 0.82;
}

.product-gallery__thumb--active {
  border-color: #3a3230;
  opacity: 1;
}

.product-gallery__thumb img,
.product-gallery__thumb video {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-gallery__play {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.22);
  color: #fff;
}

.product-gallery__counter {
  flex-shrink: 0;
  color: #6b605b;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

.product-gallery-fullscreen {
  position: fixed;
  inset: 0;
  z-index: 1200;
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  gap: 14px;
  padding: 28px 72px 18px;
  background: #3a3230;
}

.product-gallery-fullscreen__close {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 20;
  display: flex;
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  transition: background 0.2s ease;
}

.product-gallery-fullscreen__close:hover {
  background: rgba(255, 255, 255, 0.2);
}

.product-gallery-fullscreen__main {
  min-height: 0;
  align-self: stretch;
}

.product-gallery-fullscreen__main :deep(.b-slider__inner),
.product-gallery-fullscreen__main :deep(swiper-container) {
  height: 100%;
  min-height: 0;
}

.product-gallery-fullscreen__main :deep(swiper-slide) {
  height: 100%;
}

.product-gallery-fullscreen__main :deep(.b-slider__btn--prev) {
  left: -52px;
}

.product-gallery-fullscreen__main :deep(.b-slider__btn--next) {
  right: -52px;
}

.product-gallery-fullscreen__media {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
}

.product-gallery-fullscreen__asset {
  display: block;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.product-gallery-fullscreen__embed {
  width: min(540px, 100%);
  height: 100%;
  border: 0;
  background: #fff;
}

.product-gallery-fullscreen__bottom {
  display: flex;
  width: min(720px, 100%);
  align-items: center;
  justify-self: center;
  gap: 18px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

.product-gallery-fullscreen__thumbs {
  min-width: 0;
  flex: 1;
}

.product-gallery__thumb--dark {
  border-color: rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.08);
}

.product-gallery__thumb--dark.product-gallery__thumb--active {
  border-color: #fff;
}

.gallery-fade-enter-active,
.gallery-fade-leave-active {
  transition: opacity 0.2s ease;
}

.gallery-fade-enter-from,
.gallery-fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .product-gallery__main :deep(swiper-container),
  .product-gallery__main :deep(.b-slider__inner) {
    height: auto;
    min-height: 0;
    aspect-ratio: 3 / 4;
  }

  .product-gallery__asset {
    width: 100%;
    height: 100%;
    max-height: none;
    object-fit: cover;
  }

  .product-gallery__expand {
    display: none;
  }

  /* Галерея на мобільному на всю ширину — мініатюрам і лічильнику потрібні поля */
  .product-gallery__footer {
    gap: 10px;
    padding: 10px 1rem;
  }

  .product-gallery__thumb-slider :deep(swiper-slide),
  .product-gallery-fullscreen__thumbs :deep(swiper-slide) {
    width: 52px !important;
  }

  .product-gallery__thumb {
    width: 52px;
    height: 52px;
  }

  .product-gallery-fullscreen {
    padding: 64px 12px 12px;
  }

  .product-gallery-fullscreen__bottom {
    gap: 10px;
  }
}

.product-gallery__rail {
  display: none;
}

@media (min-width: 1024px) {
  /* Мініатюри праворуч від фото */
  .product-gallery {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 72px;
    gap: 12px;
    align-items: start;
  }

  .product-gallery__rail {
    order: 2;
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: calc(100svh - 14rem);
    overflow-y: auto;
    scrollbar-width: none;
  }

  .product-gallery__rail .product-gallery__thumb {
    width: 72px;
    height: 96px;
    flex: none;
  }

  .product-gallery__footer {
    display: none;
  }
}
</style>
