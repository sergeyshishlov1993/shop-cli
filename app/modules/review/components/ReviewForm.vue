<script setup lang="ts">
import { useReviewStore } from '~/modules/review/reviewStore'
import { useToast } from '~/modules/ui/composables/useToast'
import { rules, useFormValidation } from '~/modules/common/composables/useFormValidation'
import ReviewMediaPicker from '~/modules/review/components/ReviewMediaPicker.vue'

interface Props {
  productId: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  submit: [review: Review]
}>()

const reviewStore = useReviewStore()
const toast = useToast()
const { submitting } = storeToRefs(reviewStore)

const rating = ref(0)
const text = ref('')
const error = ref('')
const media = ref<File[]>([])
const MAX_MEDIA = 5

const { errors, validate, reset, applyServerErrors } = useFormValidation({
  rating: [() => rating.value, [rules.required('Вкажіть оцінку'), rules.min(1, 'Вкажіть оцінку'), rules.max(5, 'Оцінка від 1 до 5')]],
  text: [() => text.value, [rules.required('Напишіть текст відгуку'), rules.maxLength(2000)]],
})

async function onSubmit() {
  error.value = ''
  if (!validate()) return
  try {
    const review = await reviewStore.create(props.productId, {
      rating: rating.value,
      text: text.value.trim(),
      media: media.value,
    })
    rating.value = 0
    text.value = ''
    media.value = []
    reset()
    toast.success('Відгук опубліковано')
    emit('submit', review)
  }
  catch (e) {
    if ((e as { statusCode?: number })?.statusCode === 409) {
      error.value = 'Ви вже залишили відгук на цей товар — його можна відредагувати у списку відгуків'
      toast.error(error.value)
      return
    }
    const rest = applyServerErrors(e)
    if (rest.length || !Object.values(errors).some(Boolean)) {
      error.value = rest.join('. ') || 'Не вдалося надіслати відгук'
      toast.error(error.value)
    }
  }
}
</script>

<template>
  <form novalidate class="flex flex-col gap-4 rounded-2xl border border-secondary-200 bg-white p-4" @submit.prevent="onSubmit">
    <h3 class="text-lg font-semibold text-secondary-900">
      Залишити відгук
    </h3>

    <div class="flex flex-col gap-2">
      <span class="text-sm font-medium text-secondary-700">Ваша оцінка</span>
      <BRating v-model="rating" size="md" />
      <p v-if="errors.rating" class="b-field__error">{{ errors.rating }}</p>
    </div>

    <BTextarea
      v-model="text"
      label="Текст відгуку"
      placeholder="Поділіться враженнями"
      :rows="4"
      required
      :error="errors.text"
    />

    <ReviewMediaPicker v-model="media" :max="MAX_MEDIA" @error="error = $event" />

    <p v-if="error" class="text-sm text-danger">
      {{ error }}
    </p>

    <BBtn
      type="submit"
      variant="primary"
      :loading="submitting"
    >
      Надіслати
    </BBtn>
  </form>
</template>
