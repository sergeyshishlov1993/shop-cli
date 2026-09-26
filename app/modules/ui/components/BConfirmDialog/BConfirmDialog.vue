<script setup lang="ts">
import { useConfirm } from '~/modules/ui/composables/useConfirm'

const { state, accept, cancel } = useConfirm()

const isOpen = computed({
  get: () => state.value.isOpen,
  set: (value: boolean) => {
    if (!value) cancel()
  },
})

const icons = {
  danger: { name: 'lucide:trash-2', icon: 'text-danger', bg: 'bg-danger/10' },
  warning: { name: 'lucide:triangle-alert', icon: 'text-warning', bg: 'bg-warning/10' },
  primary: { name: 'lucide:circle-help', icon: 'text-primary-700', bg: 'bg-primary-100' },
}

const icon = computed(() => icons[state.value.options.variant ?? 'primary'])
</script>

<template>
  <BModal
    v-model="isOpen"
    :title="state.options.title"
    size="sm"
  >
    <div class="flex items-start gap-3">
      <div
        class="flex size-10 shrink-0 items-center justify-center rounded-full"
        :class="icon.bg"
      >
        <Icon :name="icon.name" class="size-5" :class="icon.icon" />
      </div>
      <p class="text-sm leading-6 text-secondary-600">
        {{ state.options.message }}
      </p>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <BBtn variant="ghost" @click="cancel">
          {{ state.options.cancelText }}
        </BBtn>
        <BBtn
          :variant="state.options.variant === 'danger' ? 'danger' : 'primary'"
          @click="accept"
        >
          {{ state.options.confirmText }}
        </BBtn>
      </div>
    </template>
  </BModal>
</template>
