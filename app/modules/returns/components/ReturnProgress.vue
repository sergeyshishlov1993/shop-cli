<script setup lang="ts">
// Прогрес повернення: смуга 0→100% по шляху Подано → … → Гроші повернено.
// Відхилено / Скасовано — смуга на всю ширину в іншому кольорі з підписом стану.
import { returnFlow, returnFlowLabels, returnStatusLabels, type ReturnStatus } from '~/modules/returns/returns'

const props = defineProps<{ status: ReturnStatus, compact?: boolean }>()

const isTerminal = computed(() => props.status === 'REJECTED' || props.status === 'CANCELLED')
const stepIndex = computed(() => Math.max(0, returnFlow.indexOf(props.status)))
const percent = computed(() => (isTerminal.value ? 100 : Math.round((stepIndex.value / (returnFlow.length - 1)) * 100)))
const barClass = computed(() => {
  if (props.status === 'REJECTED') return 'bg-danger'
  if (props.status === 'CANCELLED') return 'bg-secondary-400'
  if (props.status === 'REFUNDED') return 'bg-success'
  return 'bg-primary-500'
})
</script>

<template>
  <div class="w-full" role="progressbar" :aria-valuenow="percent" aria-valuemin="0" aria-valuemax="100" :aria-label="`Повернення: ${returnStatusLabels[status]}`">
    <div class="relative h-1.5 overflow-hidden rounded-full bg-secondary-200">
      <div class="h-full rounded-full transition-[width] duration-500" :class="barClass" :style="{ width: `${Math.max(percent, 4)}%` }" />
    </div>
    <p v-if="compact" class="mt-1.5 text-xs text-secondary-500">
      {{ isTerminal ? returnStatusLabels[status] : `Крок ${stepIndex + 1} з ${returnFlow.length}: ${returnFlowLabels[status]}` }}
    </p>
    <ol v-else class="mt-2 grid text-[11px] text-secondary-500" :style="{ gridTemplateColumns: `repeat(${returnFlow.length}, minmax(0, 1fr))` }">
      <li
        v-for="(step, index) in returnFlow"
        :key="step"
        class="truncate first:text-left last:text-right [&:not(:first-child):not(:last-child)]:text-center"
        :class="!isTerminal && index <= stepIndex ? 'font-medium text-secondary-900' : ''"
      >
        {{ returnFlowLabels[step] }}
      </li>
    </ol>
  </div>
</template>
