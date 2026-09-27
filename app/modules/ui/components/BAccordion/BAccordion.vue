<script setup lang="ts">
interface AccordionItem {
  key: string | number
  title: string
  content?: string
  icon?: string
}

interface Props {
  items?: AccordionItem[]
  title?: string
  multiple?: boolean
  defaultOpen?: Array<string | number>
}

const props = withDefaults(defineProps<Props>(), {
  items: undefined,
  title: undefined,
  multiple: false,
  defaultOpen: () => [],
})

const singleItems = computed<AccordionItem[]>(() => props.items ?? [{ key: 'default', title: props.title ?? '' }])
const openKeys = ref<string[]>(props.defaultOpen.map(String))

function isOpen(key: string | number) {
  return openKeys.value.includes(String(key))
}

function toggle(key: string | number) {
  const stringKey = String(key)

  if (isOpen(stringKey)) {
    openKeys.value = openKeys.value.filter(item => item !== stringKey)
    return
  }

  openKeys.value = props.multiple ? [...openKeys.value, stringKey] : [stringKey]
}
</script>

<template>
  <div class="border-y border-secondary-200">
    <div
      v-for="(item, index) in singleItems"
      :key="item.key"
      :class="index > 0 ? 'border-t border-secondary-200' : ''"
    >
      <button
        type="button"
        class="flex w-full items-center justify-between gap-4 px-1 py-4 text-left transition-colors hover:text-primary-700"
        :aria-expanded="isOpen(item.key)"
        @click="toggle(item.key)"
      >
        <span class="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.14em] text-secondary-800">
          <Icon v-if="item.icon" :name="item.icon" class="size-4 text-primary-600" />
          {{ item.title }}
        </span>
        <Icon
          name="lucide:chevron-down"
          class="size-4 shrink-0 text-secondary-500 transition-transform"
          :class="isOpen(item.key) ? 'rotate-180' : ''"
        />
      </button>

      <div v-show="isOpen(item.key)" class="text-sm text-secondary-600">
        <slot
          name="item"
          :item="item"
          :is-open="isOpen(item.key)"
        >
          <div class="px-1 pb-4">
            <slot>{{ item.content }}</slot>
          </div>
        </slot>
      </div>
    </div>
  </div>
</template>
