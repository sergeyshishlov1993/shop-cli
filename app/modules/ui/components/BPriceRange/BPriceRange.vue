<script setup lang="ts">
interface PriceRangeValue {
  min: number | null
  max: number | null
}

interface Props {
  modelValue: PriceRangeValue
  min?: number
  max?: number
  step?: number
}

const props = withDefaults(defineProps<Props>(), {
  min: 0,
  max: 1000,
  step: 1,
})

const emit = defineEmits<{
  'update:modelValue': [value: PriceRangeValue]
}>()

const track = useTemplateRef<HTMLElement>('track')
const dragging = ref<'min' | 'max' | null>(null)
// Під час перетягування тримаємо значення локально й емітимо лише на відпусканні — інакше кожен піксель = запит.
const draft = ref<PriceRangeValue | null>(null)

const currentMin = computed(() => clamp(draft.value?.min ?? props.modelValue.min ?? props.min))
const currentMax = computed(() => clamp(draft.value?.max ?? props.modelValue.max ?? props.max))

function clamp(value: number) {
  return Math.min(Math.max(value, props.min), props.max)
}

function snap(value: number) {
  const stepped = Math.round((value - props.min) / props.step) * props.step + props.min
  return clamp(Number(stepped.toFixed(2)))
}

function toPercent(value: number) {
  const span = props.max - props.min
  return span <= 0 ? 0 : ((value - props.min) / span) * 100
}

function update(handle: 'min' | 'max', value: number) {
  const nextValue = snap(value)
  const next = handle === 'min'
    ? { min: Math.min(nextValue, currentMax.value), max: currentMax.value }
    : { min: currentMin.value, max: Math.max(nextValue, currentMin.value) }

  if (dragging.value) draft.value = next
  else emit('update:modelValue', next)
}

function onInputChange(handle: 'min' | 'max', event: Event) {
  const input = event.target as HTMLInputElement
  const fallback = handle === 'min' ? props.min : props.max
  update(handle, input.value === '' ? fallback : Number(input.value))
  // Значення поза межами/порожнє: показуємо фактично застосоване, а не введене
  nextTick(() => { input.value = String(handle === 'min' ? currentMin.value : currentMax.value) })
}

function valueFromEvent(event: PointerEvent) {
  const rect = track.value?.getBoundingClientRect()
  if (!rect || rect.width === 0) return props.min

  const ratio = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1)
  return props.min + ratio * (props.max - props.min)
}

function onPointerDown(handle: 'min' | 'max', event: PointerEvent) {
  dragging.value = handle
  ;(event.target as HTMLElement).setPointerCapture(event.pointerId)
  update(handle, valueFromEvent(event))
}

function onPointerMove(event: PointerEvent) {
  if (!dragging.value) return
  event.preventDefault()
  update(dragging.value, valueFromEvent(event))
}

function onPointerUp() {
  dragging.value = null
  if (draft.value) emit('update:modelValue', draft.value)
  draft.value = null
}

function onTrackClick(event: PointerEvent) {
  if (dragging.value) return
  const value = valueFromEvent(event)
  const handle = Math.abs(value - currentMin.value) <= Math.abs(value - currentMax.value) ? 'min' : 'max'
  update(handle, value)
}

function onKeydown(handle: 'min' | 'max', event: KeyboardEvent) {
  const direction = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
  if (!direction) return

  event.preventDefault()
  const base = handle === 'min' ? currentMin.value : currentMax.value
  update(handle, base + direction * props.step)
}
</script>

<template>
  <div class="b-price-range flex flex-col gap-5">
    <div
      ref="track"
      class="relative mx-2 h-6 cursor-pointer touch-pan-y select-none"
      @pointerdown="onTrackClick"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
    >
      <span class="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-secondary-300" />
      <span
        class="absolute top-1/2 h-0.5 -translate-y-1/2 bg-secondary-900"
        :style="{ left: `${toPercent(currentMin)}%`, right: `${100 - toPercent(currentMax)}%` }"
      />

      <button
        v-for="handle in (['min', 'max'] as const)"
        :key="handle"
        type="button"
        class="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-secondary-900 bg-white transition-transform hover:scale-110"
        :style="{ left: `${toPercent(handle === 'min' ? currentMin : currentMax)}%` }"
        :aria-label="handle === 'min' ? 'Мінімальна ціна' : 'Максимальна ціна'"
        role="slider"
        :aria-valuemin="min"
        :aria-valuemax="max"
        :aria-valuenow="handle === 'min' ? currentMin : currentMax"
        style="touch-action: none"
        @pointerdown.stop="onPointerDown(handle, $event)"
        @pointermove.stop="onPointerMove"
        @pointerup.stop="onPointerUp"
        @pointercancel.stop="onPointerUp"
        @keydown="onKeydown(handle, $event)"
      />
    </div>

    <div class="grid grid-cols-2 gap-3">
      <input
        class="b-input"
        type="number"
        :min="min"
        :max="max"
        :step="step"
        :value="currentMin"
        aria-label="Ціна від"
        @change="onInputChange('min', $event)"
      >
      <input
        class="b-input"
        type="number"
        :min="min"
        :max="max"
        :step="step"
        :value="currentMax"
        aria-label="Ціна до"
        @change="onInputChange('max', $event)"
      >
    </div>
  </div>
</template>
