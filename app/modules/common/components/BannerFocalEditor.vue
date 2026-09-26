<script setup lang="ts">
// Кадрування банера окремо для десктопа, планшета й телефона: фото перетягується мишею/пальцем
// всередині рамки з реальними пропорціями банера на головній (1440×736, 768×736, 375×432).
// Результат зберігається як object-position (0..1) — поля focalX/Y, focalX/YTablet, focalX/YMobile.
type FocalForm = {
  focalX: number, focalY: number
  focalXTablet: number, focalYTablet: number
  focalXMobile: number, focalYMobile: number
}

// ratios — ширина/висота кадру на кожному пристрої; дефолт — головний банер.
const props = withDefaults(defineProps<{
  src: string
  form: FocalForm
  ratios?: { desktop: number, tablet: number, mobile: number }
}>(), { ratios: () => ({ desktop: 2, tablet: 1, mobile: 7 / 8 }) })

const devices = computed(() => [
  { id: 'desktop', label: 'Десктоп', icon: 'lucide:monitor', ratio: props.ratios.desktop, x: 'focalX', y: 'focalY' },
  { id: 'tablet', label: 'Планшет', icon: 'lucide:tablet', ratio: props.ratios.tablet, x: 'focalXTablet', y: 'focalYTablet' },
  { id: 'mobile', label: 'Телефон', icon: 'lucide:smartphone', ratio: props.ratios.mobile, x: 'focalXMobile', y: 'focalYMobile' },
] as const)
type Device = (typeof devices.value)[number]

const active = ref<Device['id']>('desktop')
const current = computed(() => devices.value.find(d => d.id === active.value)!)
const natural = reactive({ w: 0, h: 0 })
const dragging = ref(false)
let start = { px: 0, py: 0, fx: 0, fy: 0 }

function onLoad(e: Event) {
  const img = e.target as HTMLImageElement
  natural.w = img.naturalWidth
  natural.h = img.naturalHeight
}

function onDown(e: PointerEvent) {
  const d = current.value
  dragging.value = true
  start = { px: e.clientX, py: e.clientY, fx: props.form[d.x], fy: props.form[d.y] }
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}

// object-fit: cover — фото більше рамки; зсув на 1px = 1/(надлишок у px) від object-position.
function onMove(e: PointerEvent) {
  if (!dragging.value || !natural.w) return
  const frame = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const scale = Math.max(frame.width / natural.w, frame.height / natural.h)
  const overflowX = natural.w * scale - frame.width
  const overflowY = natural.h * scale - frame.height
  const d = current.value
  const clamp = (v: number) => Math.round(Math.min(1, Math.max(0, v)) * 100) / 100
  if (overflowX > 0) props.form[d.x] = clamp(start.fx - (e.clientX - start.px) / overflowX)
  if (overflowY > 0) props.form[d.y] = clamp(start.fy - (e.clientY - start.py) / overflowY)
}

function onUp() {
  dragging.value = false
}

function position(d: Device) {
  return `${props.form[d.x] * 100}% ${props.form[d.y] * 100}%`
}

function copyToAll() {
  for (const d of devices.value) {
    props.form[d.x] = props.form[current.value.x]
    props.form[d.y] = props.form[current.value.y]
  }
}
</script>

<template>
  <div class="space-y-3">
    <div class="flex flex-wrap items-center gap-2">
      <button
          v-for="d in devices"
          :key="d.id"
          type="button"
          class="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors"
          :class="active === d.id ? 'border-primary-500 bg-primary-50 text-primary-800' : 'border-gray-200 text-gray-600'"
          @click="active = d.id"
      >
        <Icon :name="d.icon" size="16" /> {{ d.label }}
      </button>
      <button type="button" class="ml-auto text-xs text-gray-500 underline" @click="copyToAll">
        Застосувати до всіх
      </button>
    </div>

    <div class="grid items-end gap-4 md:grid-cols-[minmax(0,1fr)_auto]">
      <!-- Велика рамка обраного пристрою: затисніть і тягніть фото -->
      <div
          class="relative mx-auto w-full touch-none select-none overflow-hidden rounded-lg border-2 border-primary-500"
          :class="[dragging ? 'cursor-grabbing' : 'cursor-grab', current.id === 'mobile' ? 'max-w-56' : current.id === 'tablet' ? 'max-w-72' : '']"
          :style="{ aspectRatio: current.ratio }"
          @pointerdown="onDown"
          @pointermove="onMove"
          @pointerup="onUp"
          @pointercancel="onUp"
      >
        <img
            :src="src"
            alt="Кадр банера"
            draggable="false"
            class="pointer-events-none h-full w-full object-cover"
            :style="{ objectPosition: position(current) }"
            @load="onLoad"
        />
        <span class="glass pointer-events-none absolute bottom-2 left-2 rounded-full px-2 py-0.5 text-[11px] text-gray-700">
          Затисніть і тягніть
        </span>
      </div>

      <div class="flex items-end justify-center gap-3">
        <button
            v-for="d in devices"
            :key="d.id"
            type="button"
            class="flex flex-col items-center gap-1 text-[11px] text-gray-500"
            @click="active = d.id"
        >
          <span
              class="block overflow-hidden rounded border-2"
              :class="[active === d.id ? 'border-primary-500' : 'border-gray-200', d.id === 'mobile' ? 'w-14' : d.id === 'tablet' ? 'w-16' : 'w-28']"
              :style="{ aspectRatio: d.ratio }"
          >
            <img :src="src" alt="" class="h-full w-full object-cover" :style="{ objectPosition: position(d) }" />
          </span>
          {{ d.label }}
        </button>
      </div>
    </div>
  </div>
</template>
