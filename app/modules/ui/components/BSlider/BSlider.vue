<script lang="ts" setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import type { SwiperContainer } from 'swiper/element'

type SliderMode = 'hero' | 'product' | 'gallery'

type Props = {
  items: ProductMedia[]
  mode?: SliderMode
  alt?: string
  initialIndex?: number
  autoplay?: boolean
  interval?: number
  aspectRatio?: string
  loop?: boolean
  withBtns?: boolean
  noBlur?: boolean
  speed?: number
}

type Emits = {
  (e: 'open-gallery', index: number): void
  (e: 'slide-change', index: number): void
  (e: 'close'): void
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'product',
  alt: '',
  initialIndex: 0,
  autoplay: false,
  interval: 5000,
  aspectRatio: '3/4',
  loop: true,
  withBtns: false,
  noBlur: false,
  speed: 300,
})

const emits = defineEmits<Emits>()

const containerRef = ref<SwiperContainer | null>(null)
const thumbsContainerRef = ref<SwiperContainer | null>(null)
const rightTargetIsVisible = ref(false)
const leftTargetIsVisible = ref(false)

const swiper = useSwiper(containerRef, {
  loop: props.loop,
  initialSlide: props.initialIndex,
  autoplay: props.autoplay ? { delay: props.interval, disableOnInteraction: false } : false,
  thumbs: props.mode === 'product' ? { swiper: thumbsContainerRef.value } : undefined,
})

const thumbsSwiper = useSwiper(thumbsContainerRef, {
  slidesPerView: 'auto',
  spaceBetween: 8,
  watchSlidesProgress: true,
})

const imageFit = computed(() => (props.mode === 'gallery' ? 'contain' : 'cover'))
const effectiveAspectRatio = computed(() => (props.mode === 'gallery' ? 'auto' : props.aspectRatio))

function onRightIntersectionObserver([{ isIntersecting }]: IntersectionObserverEntry[]) {
  rightTargetIsVisible.value = isIntersecting
}

function onLeftIntersectionObserver([{ isIntersecting }]: IntersectionObserverEntry[]) {
  leftTargetIsVisible.value = isIntersecting
}

function scrollByStep(direction: 'prev' | 'next') {
  const instance = swiper.instance.value
  if (!instance) return
  direction === 'prev' ? instance.slidePrev(props.speed) : instance.slideNext(props.speed)
}

function onSlideClick(index: number) {
  if (props.mode === 'product') emits('open-gallery', index)
}

onMounted(() => {
  nextTick(() => {
    if (props.initialIndex && swiper.instance.value) {
      swiper.instance.value.slideTo(props.initialIndex, 0)
    }

    swiper.instance.value?.on('slideChange', () => {
      emits('slide-change', swiper.instance.value?.realIndex ?? 0)
    })
  })
})

onBeforeUnmount(() => {
  swiper.instance.value?.off('slideChange')
})
</script>

<template>
  <div
      :class="{
      'b-slider': true,
      [`b-slider--${mode}`]: true,
      'b-slider--prev': !leftTargetIsVisible && !noBlur,
      'b-slider--next': !rightTargetIsVisible && !noBlur,
    }"
  >
    <button
        v-if="mode === 'gallery'"
        class="b-slider__close"
        @click="emits('close')"
    >
      <b-icon name="icon-close" />
    </button>

    <client-only>
      <swiper-container
          ref="containerRef"
          class="b-slider__main"
          :style="{ aspectRatio: effectiveAspectRatio }"
          :loop="loop"
          :initial-slide="initialIndex"
          :autoplay="autoplay ? { delay: interval, disableOnInteraction: false } : false"
          v-bind="$attrs"
      >
        <div
            v-intersection-observer="onLeftIntersectionObserver"
            class="b-slider__inner-target b-slider__inner-target--left"
        />

        <swiper-slide
            v-for="(item, index) in items"
            :key="item.id"
            class="b-slider__slide"
            :class="{ 'b-slider__slide--zoomable': mode === 'product' }"
            @click="onSlideClick(index)"
        >
          <template v-if="item.mediaType === 'VIDEO'">
            <video
                class="b-slider__image"
                :style="{ objectFit: imageFit }"
                autoplay
                muted
                loop
                playsinline
            >
              <source :src="getFileUrl(item.file)" />
            </video>
          </template>
          <template v-else>
            <img
                :src="getFileUrl(item.file, mode === 'gallery' ? 'large' : 'medium')"
                :alt="alt || `Slide ${index + 1}`"
                class="b-slider__image"
                :style="{ objectFit: imageFit }"
            />
          </template>
        </swiper-slide>

        <div
            v-intersection-observer="onRightIntersectionObserver"
            class="b-slider__inner-target b-slider__inner-target--right"
        />
      </swiper-container>

      <swiper-container
          v-if="mode === 'product'"
          ref="thumbsContainerRef"
          class="b-slider__thumbs"
          slides-per-view="auto"
          :space-between="8"
          watch-slides-progress
      >
        <swiper-slide
            v-for="(item, index) in items"
            :key="item.id"
            class="b-slider__thumb"
        >
          <img
              :src="getFileUrl(item.file, 'thumb')"
              :alt="alt || `Thumb ${index + 1}`"
              class="b-slider__thumb-image"
          />
        </swiper-slide>
      </swiper-container>

      <b-btn
          v-if="withBtns && items.length > 1 && $viewport.isGreaterThan('mobile')"
          variant="icon"
          class="b-slider__btn b-slider__btn--prev"
          :class="{ 'b-slider__btn--hidden': leftTargetIsVisible }"
          @click.stop="scrollByStep('prev')"
      >
        <b-icon name="icon-left" />
      </b-btn>

      <b-btn
          v-if="withBtns && items.length > 1 && $viewport.isGreaterThan('mobile')"
          variant="icon"
          class="b-slider__btn b-slider__btn--next"
          :class="{ 'b-slider__btn--hidden': rightTargetIsVisible }"
          @click.stop="scrollByStep('next')"
      >
        <b-icon name="icon-right" />
      </b-btn>
    </client-only>
  </div>
</template>

<style scoped>
.b-slider {
  position: relative;
  user-select: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.b-slider--gallery {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 16px;
}

.b-slider--prev::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 50px;
  background: linear-gradient(90deg, var(--color-secondary-50) 0%, rgba(255, 255, 255, 0) 100%);
  z-index: 2;
  opacity: 1;
  pointer-events: none;
  transition: all 0.2s;
}

.b-slider--next::after {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 50px;
  background: linear-gradient(270deg, var(--color-secondary-50) 0%, rgba(255, 255, 255, 0) 100%);
  z-index: 2;
  opacity: 1;
  pointer-events: none;
  transition: all 0.2s;
}

.b-slider__main {
  position: relative;
  width: 100%;
  border-radius: 8px;
  background: var(--color-secondary-100);
  overflow: hidden;
}

.b-slider--gallery .b-slider__main {
  height: 100%;
  background: transparent;
  border-radius: 0;
}

.b-slider__slide {
  height: 100%;
}

.b-slider__slide--zoomable {
  cursor: zoom-in;
}

.b-slider__image {
  width: 100%;
  height: 100%;
  display: block;
}

.b-slider__close {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  color: var(--color-secondary-50);
  cursor: pointer;
  transition: background 0.2s;
}

.b-slider__close:hover {
  background: rgba(0, 0, 0, 0.75);
}

.b-slider__thumbs {
  width: 100%;
  height: 64px;
  overflow: hidden;
}

.b-slider__thumb {
  width: 72px !important;
  height: 64px;
  flex-shrink: 0;
  border-radius: 6px;
  overflow: hidden;
  border: 2px solid transparent;
  opacity: 0.55;
  cursor: pointer;
  transition: opacity 0.2s, border-color 0.2s;
  background: var(--color-secondary-100);
}

.b-slider__thumb:hover {
  opacity: 0.8;
}

:deep(.swiper-slide-thumb-active.b-slider__thumb) {
  opacity: 1;
  border-color: var(--color-primary-500);
}

.b-slider__thumb-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.b-slider__btn {
  position: absolute;
  border: 1px solid var(--color-secondary-300) !important;
  top: 50%;
  transform: translateY(-50%);
  box-shadow: 0 5px 10px 0 rgba(0, 0, 0, 0.05);
  z-index: 10;
}

.b-slider__btn--prev {
  left: -10px;
}

.b-slider__btn--next {
  right: -10px;
}

.b-slider__btn--hidden {
  opacity: 0;
  pointer-events: none;
}

.b-slider__inner-target {
  position: absolute;
}

.b-slider__inner-target--left {
  left: 0;
}

.b-slider__inner-target--right {
  position: relative;
  right: 0;
  transform: translateX(-30px);
}

@media (max-width: 768px) {
  .b-slider__thumbs {
    height: 52px;
  }

  .b-slider__thumb {
    width: 56px !important;
    height: 52px;
  }
}
</style>