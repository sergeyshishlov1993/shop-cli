<script setup lang="ts">
interface Props {
  modelValue?: number
  readonly?: boolean
  max?: number
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
  readonly: false,
  max: 5,
  size: 'md',
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const hoverValue = ref(0)

const sizeClasses: Record<NonNullable<Props['size']>, string> = {
  sm: 'size-4',
  md: 'size-5',
  lg: 'size-6',
}

const gapClasses: Record<NonNullable<Props['size']>, string> = {
  sm: 'gap-0.5',
  md: 'gap-1',
  lg: 'gap-1',
}

function getStarFill(index: number): 'full' | 'half' | 'empty' {
  const value = hoverValue.value > 0 ? hoverValue.value : props.modelValue
  if (value >= index) return 'full'
  if (value >= index - 0.5) return 'half'
  return 'empty'
}

function onClick(index: number) {
  if (props.readonly) return
  const newValue = props.modelValue === index ? 0 : index
  emit('update:modelValue', newValue)
}

function onMouseEnter(index: number) {
  if (props.readonly) return
  hoverValue.value = index
}

function onMouseLeave() {
  if (props.readonly) return
  hoverValue.value = 0
}
</script>

<template>
  <div
    :class="[
      'inline-flex items-center',
      gapClasses[size],
      readonly ? '' : 'cursor-pointer',
    ]"
    @mouseleave="onMouseLeave"
  >
    <button
      v-for="index in max"
      :key="index"
      type="button"
      :disabled="readonly"
      :class="[
        'relative shrink-0 transition-transform',
        readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110',
        sizeClasses[size],
      ]"
      :aria-label="`${index} з ${max}`"
      @click="onClick(index)"
      @mouseenter="onMouseEnter(index)"
    >
      <!-- Empty star -->
      <svg
        v-if="getStarFill(index) === 'empty'"
        :class="['size-full text-secondary-300', sizeClasses[size]]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
        />
      </svg>

      <!-- Full star -->
      <svg
        v-else-if="getStarFill(index) === 'full'"
        :class="['size-full text-warning', sizeClasses[size]]"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path
          d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
        />
      </svg>

      <!-- Half star -->
      <svg
        v-else
        :class="['size-full', sizeClasses[size]]"
        viewBox="0 0 24 24"
      >
        <defs>
          <clipPath :id="`half-left-${index}`">
            <rect x="0" y="0" width="12" height="24" />
          </clipPath>
          <clipPath :id="`half-right-${index}`">
            <rect x="12" y="0" width="12" height="24" />
          </clipPath>
        </defs>

        <!-- Left filled half -->
        <path
          class="text-warning"
          fill="currentColor"
          :clip-path="`url(#half-left-${index})`"
          d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
        />

        <!-- Right empty half -->
        <path
          class="text-secondary-300"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          :clip-path="`url(#half-right-${index})`"
          d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
        />
      </svg>
    </button>
  </div>
</template>
