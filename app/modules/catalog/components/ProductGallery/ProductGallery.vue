<script setup lang="ts">
import type { SwiperContainer } from 'swiper/element'

interface Props {
  media: ProductMedia[]
  productName: string
}

const props = defineProps<Props>()

const images = computed(() => {
  return [...props.media]
    .filter(item => item.mediaType === 'IMAGE')
    .sort((a, b) => {
      if (a.isMain && !b.isMain) return -1
      if (!a.isMain && b.isMain) return 1
      return a.sortOrder - b.sortOrder
    })
})

const activeIndex = ref(0)

watch(images, () => {
  activeIndex.value = 0
})

const activeImage = computed(() => images.value[activeIndex.value] || null)

const selectImage = (index: number) => {
  activeIndex.value = index
}

const mobileSwiperRef = ref<SwiperContainer | null>(null)
const { activeIndex: mobileActiveIndex } = useSwiper(mobileSwiperRef, {
  slidesPerView: 1,
  spaceBetween: 8,
  pagination: { clickable: true },
})

watch(mobileActiveIndex, (index) => {
  if (index !== activeIndex.value) activeIndex.value = index
})

const isLightboxOpen = ref(false)

const openLightbox = () => {
  if (!activeImage.value) return
  isLightboxOpen.value = true
}

const closeLightbox = () => {
  isLightboxOpen.value = false
}

const showPrev = () => {
  if (activeIndex.value > 0) {
    activeIndex.value--
  } else {
    activeIndex.value = images.value.length - 1
  }
}

const showNext = () => {
  if (activeIndex.value < images.value.length - 1) {
    activeIndex.value++
  } else {
    activeIndex.value = 0
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (!isLightboxOpen.value) return

  if (event.key === 'Escape') {
    closeLightbox()
  } else if (event.key === 'ArrowLeft') {
    showPrev()
  } else if (event.key === 'ArrowRight') {
    showNext()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})

watch(isLightboxOpen, (value) => {
  if (import.meta.server) return
  document.body.style.overflow = value ? 'hidden' : ''
})
</script>

<template>
  <div class="w-full">
    <div v-if="images.length === 0" class="flex aspect-square w-full items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
      <div class="flex flex-col items-center gap-2">
        <Icon name="mdi:image-outline" size="48" />
        <span class="text-sm">Немає фото</span>
      </div>
    </div>

    <div v-else>
      <div class="hidden md:flex md:gap-4">
        <div class="flex w-20 flex-col gap-2">
          <button
            v-for="(image, index) in images"
            :key="image.id"
            type="button"
            class="relative aspect-square overflow-hidden rounded-lg border-2 bg-gray-100 transition-all"
            :class="index === activeIndex ? 'border-primary-600' : 'border-transparent hover:border-gray-300'"
            @click="selectImage(index)"
            @mouseenter="selectImage(index)"
          >
            <img
              :src="getFileUrl(image.file, 'thumb')"
              :alt="`${productName} ${index + 1}`"
              class="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
          </button>
        </div>

        <div class="relative flex-1">
          <button
            type="button"
            class="group relative block aspect-square w-full overflow-hidden rounded-2xl bg-gray-100"
            @click="openLightbox"
          >
            <img
              v-if="activeImage"
              :src="getFileUrl(activeImage.file, 'large')"
              :alt="productName"
              class="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />

            <div class="pointer-events-none absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-700 opacity-0 transition-opacity group-hover:opacity-100">
              <Icon name="mdi:magnify-plus-outline" size="20" />
            </div>
          </button>
        </div>
      </div>

      <div class="md:hidden">
        <swiper-container
          ref="mobileSwiperRef"
          :init="false"
          class="aspect-square w-full overflow-hidden rounded-2xl bg-gray-100"
        >
          <swiper-slide
            v-for="image in images"
            :key="image.id"
          >
            <img
              :src="getFileUrl(image.file, 'large')"
              :alt="productName"
              class="h-full w-full object-cover"
              loading="lazy"
            />
          </swiper-slide>
        </swiper-container>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="isLightboxOpen && activeImage"
          class="fixed inset-0 z-[100] flex items-center justify-center bg-black/90"
          @click.self="closeLightbox"
        >
          <button
            type="button"
            class="absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label="Закрити"
            @click="closeLightbox"
          >
            <Icon name="mdi:close" size="24" />
          </button>

          <button
            v-if="images.length > 1"
            type="button"
            class="absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label="Попереднє"
            @click="showPrev"
          >
            <Icon name="mdi:chevron-left" size="24" />
          </button>

          <button
            v-if="images.length > 1"
            type="button"
            class="absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label="Наступне"
            @click="showNext"
          >
            <Icon name="mdi:chevron-right" size="24" />
          </button>

          <img
            :src="getFileUrl(activeImage.file, 'original')"
            :alt="productName"
            class="max-h-[90vh] max-w-[90vw] object-contain"
          />

          <div
            v-if="images.length > 1"
            class="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-2 text-sm text-white"
          >
            {{ activeIndex + 1 }} / {{ images.length }}
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
