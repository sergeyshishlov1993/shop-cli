<script setup lang="ts">
import ReviewMediaPicker from '~/modules/review/components/ReviewMediaPicker.vue'
import { useToast } from '~/modules/ui/composables/useToast'
import { getFileUrl } from '~/modules/common/helpers/fileUrl'

// Inline form for replying to a review or editing own review
interface Props {
  initial?: Review
  withRating?: boolean
  submitLabel?: string
  action: (dto: { rating?: number; text: string; media: File[]; removeMediaIds: number[] }) => Promise<unknown>
}

const props = withDefaults(defineProps<Props>(), {
  submitLabel: 'Надіслати',
})

const emit = defineEmits<{
  cancel: []
}>()

const toast = useToast()
const MAX_MEDIA = 5
const text = ref(props.initial?.text ?? '')
const rating = ref(props.initial?.rating ?? 0)
const media = ref<File[]>([])
const removeMediaIds = ref<number[]>([])
const error = ref('')
const loading = ref(false)

const keptMedia = computed(() => (props.initial?.media ?? []).filter(m => !removeMediaIds.value.includes(m.id)))
const freeSlots = computed(() => MAX_MEDIA - keptMedia.value.length)

async function onSubmit() {
  error.value = ''
  if (!text.value.trim()) return
  loading.value = true
  try {
    await props.action({
      rating: props.withRating ? rating.value : undefined,
      text: text.value.trim(),
      media: media.value,
      removeMediaIds: removeMediaIds.value,
    })
  }
  catch {
    error.value = 'Не вдалося зберегти'
    toast.error(error.value)
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <form class="flex flex-col gap-3" @submit.prevent="onSubmit">
    <BRating v-if="withRating" v-model="rating" size="sm" />

    <BTextarea v-model="text" :rows="3" placeholder="Ваш текст" />

    <div v-if="keptMedia.length" class="flex flex-wrap gap-2">
      <BPreview
        v-for="item in keptMedia"
        :key="item.id"
        :src="getFileUrl(item.file, 'thumb')"
        size="sm"
        removable
        @remove="removeMediaIds.push(item.id)"
      />
    </div>

    <ReviewMediaPicker v-if="freeSlots > 0 || media.length" v-model="media" :max="freeSlots" @error="error = $event" />

    <p v-if="error" class="text-sm text-danger">
      {{ error }}
    </p>

    <div class="flex gap-2">
      <BBtn type="submit" variant="primary" size="sm" :loading="loading" :disabled="!text.trim()">
        {{ submitLabel }}
      </BBtn>
      <BBtn type="button" variant="ghost" size="sm" @click="emit('cancel')">
        Скасувати
      </BBtn>
    </div>
  </form>
</template>
