<script setup lang="ts">
interface Props {
  productId: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  submit: [review: Review]
}>()

const reviewStore = useReviewStore()
const { submitting } = storeToRefs(reviewStore)

const rating = ref(0)
const text = ref('')
const error = ref('')

const isValid = computed(() => rating.value > 0 && text.value.trim().length > 0)

async function onSubmit() {
  error.value = ''
  if (!isValid.value) {
    error.value = 'Вкажіть рейтинг та текст відгуку'
    return
  }
  try {
    const review = await reviewStore.create(props.productId, {
      rating: rating.value,
      text: text.value.trim(),
    })
    rating.value = 0
    text.value = ''
    emit('submit', review)
  }
  catch {
    error.value = 'Не вдалося надіслати відгук'
  }
}
</script>

<template>
  <form class="flex flex-col gap-4 rounded-2xl border border-secondary-200 bg-white p-4" @submit.prevent="onSubmit">
    <h3 class="text-lg font-semibold text-secondary-900">
      Залишити відгук
    </h3>

    <div class="flex flex-col gap-2">
      <span class="text-sm font-medium text-secondary-700">Ваша оцінка</span>
      <BRating v-model="rating" size="md" />
    </div>

    <BTextarea
      v-model="text"
      label="Текст відгуку"
      placeholder="Поділіться враженнями"
      :rows="4"
    />

    <p v-if="error" class="text-sm text-danger">
      {{ error }}
    </p>

    <BBtn
      type="submit"
      variant="primary"
      :loading="submitting"
      :disabled="!isValid"
    >
      Надіслати
    </BBtn>
  </form>
</template>
