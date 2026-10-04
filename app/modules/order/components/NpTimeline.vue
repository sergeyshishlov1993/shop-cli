<script setup lang="ts">
// Прогрес-бар доставки в стилі додатка Нової пошти. НП віддає лише поточний статус, тож етапи виводимо з його коду.
const props = defineProps<{
  statusCode: string
  statusDescription: string
  citySender?: string
  cityRecipient?: string
  warehouseRecipient?: string
  dateCreated?: string
  scheduledDeliveryDate?: string
  actualDeliveryDate?: string
}>()

const stages = ['Створено', 'В дорозі', 'У місті одержувача', 'У відділенні', 'Отримано']
const stageByCode: Record<string, number> = { 1: 0, 12: 0, 4: 1, 41: 1, 5: 1, 101: 1, 6: 2, 7: 3, 8: 3, 9: 4, 10: 4, 11: 4 }
const returned = computed(() => ['102', '103', '108'].includes(props.statusCode))
const current = computed(() => stageByCode[props.statusCode] ?? 0)
const lastIndex = stages.length - 1
const pos = computed(() => `${current.value * 100 / lastIndex}%`)
// Прозорий проміжок ±18px довкола машинки
const gap = computed(() => `linear-gradient(to right, #000 calc(${pos.value} - 18px), transparent calc(${pos.value} - 18px), transparent calc(${pos.value} + 18px), #000 calc(${pos.value} + 18px))`)
const endDate = computed(() => props.actualDeliveryDate || props.scheduledDeliveryDate)
</script>

<template>
  <div>
    <div v-if="dateCreated || endDate" class="flex items-center gap-2 text-sm text-secondary-500">
      <span>{{ dateCreated }}</span>
      <span class="size-1.5 rounded-full bg-secondary-300" />
      <span class="h-px flex-1 bg-secondary-200" />
      <span class="size-1.5 rounded-full bg-secondary-300" />
      <span>{{ endDate }}</span>
    </div>
    <div v-if="citySender || cityRecipient" class="mt-1 flex justify-between gap-3 font-medium">
      <span>{{ citySender }}</span>
      <span class="text-right">{{ cityRecipient }}</span>
    </div>

    <!-- Вузли на 0/25/50/75/100% доріжки: пройдені — крапки, поточний — машинка, далі — сірі крапки.
         Лінію вирізаємо маскою навколо машинки, щоб їй не потрібен був фон (контейнер може мати будь-який колір) -->
    <div class="relative mx-4 my-5 h-7">
      <div class="absolute inset-0" :style="{ maskImage: gap, WebkitMaskImage: gap }">
        <div class="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-secondary-200" />
        <div class="absolute left-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full" :class="returned ? 'bg-danger' : 'bg-success'" :style="{ width: pos }" />
      </div>
      <span
        v-for="(label, i) in stages"
        :key="label"
        class="absolute top-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center"
        :style="{ left: `${i * 100 / lastIndex}%` }"
        :title="label"
      >
        <Icon v-if="i === current" name="lucide:truck" size="26" :class="returned ? 'text-danger' : 'text-success'" />
        <span v-else class="size-2.5 rounded-full" :class="i < current ? (returned ? 'bg-danger' : 'bg-success') : 'bg-secondary-300'" />
      </span>
    </div>

    <p class="text-center font-semibold" :class="returned ? 'text-danger' : ''">{{ returned ? 'Повернення' : stages[current] }}</p>
    <p class="mt-1 text-center text-sm text-secondary-500">{{ statusDescription }}</p>
    <p v-if="warehouseRecipient" class="mt-1 text-center text-xs text-secondary-500">{{ warehouseRecipient }}</p>
  </div>
</template>
