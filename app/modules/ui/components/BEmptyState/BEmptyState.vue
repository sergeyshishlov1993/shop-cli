<script setup lang="ts">
interface Props {
  title: string
  description?: string
  icon?: string
}

const props = withDefaults(defineProps<Props>(), {
  description: '',
  icon: 'inbox',
})

const iconName = computed(() => {
  if (props.icon === 'cart') return 'lucide:shopping-bag'
  if (props.icon === 'search') return 'lucide:search'
  if (props.icon === 'heart') return 'lucide:heart'
  if (props.icon.includes(':')) return props.icon
  return 'lucide:inbox'
})
</script>

<template>
  <div class="b-card">
    <div class="flex flex-col items-center justify-center gap-4 px-6 py-12 text-center">
      <Icon :name="iconName" class="size-10 text-secondary-300" />
      <div class="flex flex-col gap-1.5">
        <h3 class="store-title text-lg">{{ title }}</h3>
        <p v-if="description" class="text-sm text-secondary-500">{{ description }}</p>
      </div>
      <slot name="action" />
    </div>
  </div>
</template>
