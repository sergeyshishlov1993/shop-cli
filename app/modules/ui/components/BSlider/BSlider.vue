<script setup lang="ts">
import type { SwiperContainer } from 'swiper/element'
import { useMediaQuery } from '@vueuse/core'

type Props = {
  slidesPerView?: number | 'auto'
  withBtns?: boolean
  isRemoveBtns?: boolean
  step?: number | string
  gap?: number | string
  noBlur?: boolean
  swiping?: boolean
  scrollStep?: number
  speed?: number
  withKeyboard?: boolean
}

type Emits = {
  (e: 'slide-changed', index: number): void
  (e: 'reach-end'): void
}

const modelValue = defineModel<number | undefined>({ default: 0 })
const props = withDefaults(defineProps<Props>(), {
  slidesPerView: 'auto',
  withBtns: false,
  isRemoveBtns: false,
  gap: 5,
  noBlur: false,
  swiping: true,
  scrollStep: 1,
  speed: 300,
  withKeyboard: false,
})
const emit = defineEmits<Emits>()

const containerRef = ref<SwiperContainer | null>(null)
const atBeginning = ref(true)
const atEnd = ref(false)
const isDesktop = useMediaQuery('(min-width: 769px)')
let reachEndLocked = false
let reachEndTimer: ReturnType<typeof setTimeout> | undefined

const swiper = useSwiper(containerRef, {
  allowSlideNext: props.swiping,
  allowSlidePrev: props.swiping,
})

function updateEdges() {
  const instance = swiper.instance.value
  if (!instance) return
  atBeginning.value = instance.isBeginning
  atEnd.value = instance.isEnd
}

function handleSlideChange() {
  const instance = swiper.instance.value
  if (!instance) return

  const index = instance.activeIndex ?? 0
  updateEdges()

  if (modelValue.value !== index) modelValue.value = index
  emit('slide-changed', index)
}

function handleProgress() {
  const instance = swiper.instance.value
  if (!instance) return

  updateEdges()

  if ((instance.progress ?? 0) > 0.85 && !reachEndLocked) {
    reachEndLocked = true
    emit('reach-end')
    reachEndTimer = setTimeout(() => { reachEndLocked = false }, 1000)
  }
}

function scrollByStep(direction: 'prev' | 'next') {
  const instance = swiper.instance.value
  if (!instance) return

  const delta = direction === 'prev' ? -props.scrollStep : props.scrollStep
  instance.slideTo(Math.max(0, instance.activeIndex + delta), props.speed)
}

function handleKeydown(event: KeyboardEvent) {
  if (!props.withKeyboard) return
  if (event.key === 'ArrowRight') scrollByStep('next')
  else if (event.key === 'ArrowLeft') scrollByStep('prev')
}

watch(modelValue, (index) => {
  const instance = swiper.instance.value
  if (index !== undefined && instance && instance.activeIndex !== index) {
    instance.slideTo(index, props.speed)
  }
})

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)

  nextTick(() => {
    const instance = swiper.instance.value
    if (!instance) return
    if (modelValue.value) instance.slideTo(modelValue.value, 0)
    instance.on('slideChange', handleSlideChange)
    instance.on('progress', handleProgress)
    instance.on('resize', updateEdges)
    updateEdges()
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  if (reachEndTimer) clearTimeout(reachEndTimer)
  swiper.instance.value?.off('slideChange', handleSlideChange)
  swiper.instance.value?.off('progress', handleProgress)
  swiper.instance.value?.off('resize', updateEdges)
})
</script>

<template>
  <div
    class="b-slider"
    :class="{
      'b-slider--prev': !atBeginning && !noBlur,
      'b-slider--next': !atEnd && !noBlur,
    }"
  >
    <ClientOnly>
      <swiper-container
        ref="containerRef"
        class="b-slider__inner"
        :slides-per-view="slidesPerView"
        :space-between="gap"
        touch-events-target="container"
        v-bind="$attrs"
      >
        <slot />
      </swiper-container>

      <BBtn
        v-if="withBtns && isDesktop && (!isRemoveBtns || !atBeginning)"
        variant="icon"
        type="button"
        class="b-slider__btn b-slider__btn--prev"
        :class="{ 'b-slider__btn--hidden': atBeginning }"
        aria-label="Попередній слайд"
        @click.stop="scrollByStep('prev')"
      >
        <Icon name="lucide:chevron-left" size="20" />
      </BBtn>

      <BBtn
        v-if="withBtns && isDesktop && (!isRemoveBtns || !atEnd)"
        variant="icon"
        type="button"
        class="b-slider__btn b-slider__btn--next"
        :class="{ 'b-slider__btn--hidden': atEnd }"
        aria-label="Наступний слайд"
        @click.stop="scrollByStep('next')"
      >
        <Icon name="lucide:chevron-right" size="20" />
      </BBtn>
    </ClientOnly>
  </div>
</template>

<style scoped>
.b-slider {
  position: relative;
  display: flex;
  width: 100%;
  min-width: 0;
  gap: 15px;
  user-select: none;
}

.b-slider--prev::before,
.b-slider--next::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: 2;
  width: 50px;
  pointer-events: none;
  opacity: 1;
  transition: opacity 0.2s ease;
}

.b-slider--prev::before {
  left: 0;
  background: linear-gradient(90deg, #fff 0%, rgba(255, 255, 255, 0) 100%);
}

.b-slider--next::after {
  right: 0;
  background: linear-gradient(270deg, #fff 0%, rgba(255, 255, 255, 0) 100%);
}

.b-slider__inner {
  position: relative;
  display: flex;
  width: 100%;
  min-width: 0;
  overflow: hidden;
  cursor: grab;
  user-select: none;
  scrollbar-width: none;
}

.b-slider__inner:active {
  cursor: grabbing;
}

.b-slider__inner::-webkit-scrollbar {
  display: none;
}

.b-slider__btn {
  position: absolute !important;
  top: 50%;
  z-index: 10;
  width: 42px !important;
  height: 42px !important;
  min-width: 42px !important;
  transform: translateY(-50%);
  border: 1px solid rgba(17, 17, 17, 0.12) !important;
  background: rgba(255, 255, 255, 0.94) !important;
  color: #111 !important;
  box-shadow: 0 5px 14px rgba(0, 0, 0, 0.08);
  transition: opacity 0.2s ease, transform 0.2s ease !important;
}

.b-slider__btn:hover {
  transform: translateY(-50%) scale(1.04);
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
</style>
