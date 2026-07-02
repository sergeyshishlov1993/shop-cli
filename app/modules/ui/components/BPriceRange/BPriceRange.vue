<script setup lang="ts">
interface PriceRangeValue {
  min: number
  max: number
}

interface Props {
  modelValue: PriceRangeValue
  min: number
  max: number
  step?: number
}

const props = withDefaults(defineProps<Props>(), {
  step: 1,
})

const emit = defineEmits<{
  (event: 'update:modelValue', value: PriceRangeValue): void
}>()

const currentMin = computed(() => props.modelValue.min)
const currentMax = computed(() => props.modelValue.max)

const rangeMinPercent = computed(() => {
  if (props.max === props.min) return 0
  return ((currentMin.value - props.min) / (props.max - props.min)) * 100
})

const rangeMaxPercent = computed(() => {
  if (props.max === props.min) return 100
  return ((currentMax.value - props.min) / (props.max - props.min)) * 100
})

const updateMin = (event: Event) => {
  const nextMin = Number((event.target as HTMLInputElement).value)
  emit('update:modelValue', {
    min: Math.min(nextMin, currentMax.value),
    max: currentMax.value,
  })
}

const updateMax = (event: Event) => {
  const nextMax = Number((event.target as HTMLInputElement).value)
  emit('update:modelValue', {
    min: currentMin.value,
    max: Math.max(nextMax, currentMin.value),
  })
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <!-- Значения цен -->
    <div class="flex items-center justify-between text-sm text-secondary-600">
      <span>{{ currentMin }} ₴</span>
      <span>{{ currentMax }} ₴</span>
    </div>

    <!-- Слайдер -->
    <div class="relative mx-[5px] h-4">
      <div class="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-primary-200" />

      <div
          class="absolute top-1/2 h-px -translate-y-1/2 bg-primary-400"
          :style="{
          left: `${rangeMinPercent}%`,
          right: `${100 - rangeMaxPercent}%`,
        }"
      />

      <div
          class="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary-300 bg-white"
          :style="{ left: `${rangeMinPercent}%` }"
      />

      <div
          class="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary-300 bg-white"
          :style="{ left: `${rangeMaxPercent}%` }"
      />

      <input
          type="range"
          :min="min"
          :max="max"
          :step="step"
          :value="currentMin"
          class="price-range-input pointer-events-none absolute inset-0 h-full w-full appearance-none bg-transparent"
          @input="updateMin"
      >

      <input
          type="range"
          :min="min"
          :max="max"
          :step="step"
          :value="currentMax"
          class="price-range-input pointer-events-none absolute inset-0 h-full w-full appearance-none bg-transparent"
          @input="updateMax"
      >
    </div>
  </div>
</template>

<style scoped>
.price-range-input::-webkit-slider-thumb {
  pointer-events: auto;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 9999px;
  background: transparent;
  border: none;
  cursor: pointer;
}

.price-range-input::-moz-range-thumb {
  pointer-events: auto;
  width: 20px;
  height: 20px;
  border-radius: 9999px;
  background: transparent;
  border: none;
  cursor: pointer;
}

.price-range-input::-webkit-slider-runnable-track {
  background: transparent;
}

.price-range-input::-moz-range-track {
  background: transparent;
}
</style>