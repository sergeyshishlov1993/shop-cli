<script setup lang="ts">
export interface LinePoint { date: string, value: number, detail?: string }

const props = withDefaults(defineProps<{
  points: LinePoint[]
  format?: (value: number) => string
  emptyText?: string
  height?: number
}>(), {
  format: (value: number) => String(value),
  emptyText: 'Немає даних за період',
  height: 200,
})

// Ширина viewBox = реальна ширина контейнера, щоб підписи (font-size 11) були 11px і на телефоні
const wrapRef = ref<HTMLElement | null>(null)
const { width: wrapWidth } = useElementSize(wrapRef)
const W = computed(() => Math.max(280, Math.round(wrapWidth.value) || 600))
const PAD = { top: 12, right: 8, bottom: 22, left: 8 }
const uid = useId()

const max = computed(() => Math.max(0, ...props.points.map(p => p.value)))
const hasData = computed(() => props.points.length > 0 && max.value > 0)
const plotH = computed(() => props.height - PAD.top - PAD.bottom)
const x = (i: number) => PAD.left + (props.points.length > 1 ? (i / (props.points.length - 1)) * (W.value - PAD.left - PAD.right) : (W.value - PAD.left - PAD.right) / 2)
const y = (v: number) => PAD.top + plotH.value - (v / (max.value || 1)) * plotH.value

const line = computed(() => props.points.map((p, i) => `${i ? 'L' : 'M'}${x(i)},${y(p.value)}`).join(' '))
const area = computed(() => props.points.length
  ? `${line.value} L${x(props.points.length - 1)},${PAD.top + plotH.value} L${x(0)},${PAD.top + plotH.value} Z`
  : '')
const grid = computed(() => [0, 0.5, 1].map(f => ({ y: PAD.top + plotH.value * (1 - f), label: props.format(max.value * f) })))

const shortDate = (d: string) => new Date(`${d}T00:00:00`).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' })
const ticks = computed(() => {
  const n = props.points.length
  if (!n) return []
  const idx = n <= 2 ? [...Array(n).keys()] : [0, Math.floor((n - 1) / 2), n - 1]
  return idx.map(i => ({ x: x(i), label: shortDate(props.points[i]!.date), anchor: i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle' }))
})

const svgRef = ref<SVGSVGElement | null>(null)
const active = ref<number | null>(null)
function onMove(event: PointerEvent) {
  const rect = svgRef.value?.getBoundingClientRect()
  if (!rect || !props.points.length) return
  const vx = ((event.clientX - rect.left) / rect.width) * W.value
  const step = props.points.length > 1 ? (W.value - PAD.left - PAD.right) / (props.points.length - 1) : 1
  active.value = Math.min(props.points.length - 1, Math.max(0, Math.round((vx - PAD.left) / step)))
}
const activePoint = computed(() => active.value === null ? null : props.points[active.value] ?? null)
const tooltipLeft = computed(() => active.value === null ? 0 : (x(active.value) / W.value) * 100)
</script>

<template>
  <div v-if="!hasData" class="flex items-center justify-center text-sm text-secondary-500" :style="{ height: `${height}px` }">{{ emptyText }}</div>
  <div v-else ref="wrapRef" class="relative">
    <svg
      ref="svgRef"
      :viewBox="`0 0 ${W} ${height}`"
      class="block w-full touch-none"
      role="img"
      @pointermove="onMove"
      @pointerleave="active = null"
    >
      <defs>
        <linearGradient :id="`${uid}-fill`" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="var(--color-primary-500)" stop-opacity="0.22" />
          <stop offset="1" stop-color="var(--color-primary-500)" stop-opacity="0" />
        </linearGradient>
      </defs>
      <g v-for="g in grid" :key="g.y">
        <line :x1="PAD.left" :x2="W - PAD.right" :y1="g.y" :y2="g.y" stroke="var(--color-secondary-200)" stroke-width="1" vector-effect="non-scaling-stroke" />
        <text v-if="g.y < PAD.top + plotH" :x="PAD.left" :y="g.y - 4" font-size="11" fill="var(--color-secondary-600)">{{ g.label }}</text>
      </g>
      <text v-for="t in ticks" :key="t.x" :x="t.x" :y="height - 6" :text-anchor="t.anchor" font-size="11" fill="var(--color-secondary-600)">{{ t.label }}</text>
      <path :d="area" :fill="`url(#${uid}-fill)`" />
      <path :d="line" fill="none" stroke="var(--color-primary-500)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke" />
      <g v-if="activePoint && active !== null">
        <line :x1="x(active)" :x2="x(active)" :y1="PAD.top" :y2="PAD.top + plotH" stroke="var(--color-secondary-400)" stroke-dasharray="3 3" vector-effect="non-scaling-stroke" />
        <circle :cx="x(active)" :cy="y(activePoint.value)" r="4.5" fill="var(--color-primary-500)" stroke="var(--color-white, #fff)" stroke-width="2" />
      </g>
    </svg>
    <div
      v-if="activePoint"
      class="glass glass--strong pointer-events-none absolute top-0 z-10 rounded-lg px-3 py-2 text-xs whitespace-nowrap"
      :style="{ left: `${tooltipLeft}%`, transform: `translateX(${tooltipLeft > 70 ? '-100%' : tooltipLeft < 30 ? '0' : '-50%'})` }"
    >
      <div class="text-secondary-500">{{ shortDate(activePoint.date) }}</div>
      <div class="font-semibold text-secondary-900">{{ format(activePoint.value) }}</div>
      <div v-if="activePoint.detail" class="text-secondary-600">{{ activePoint.detail }}</div>
    </div>
  </div>
</template>
