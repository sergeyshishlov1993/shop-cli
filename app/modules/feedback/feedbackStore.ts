export const useFeedbackStore = defineStore('feedback', () => {
  const sending = ref(false)
  const sent = ref(false)

  async function send(dto: CreateFeedbackDto) {
    sending.value = true
    try {
      await feedbackApi.create(dto)
      sent.value = true
    }
    finally {
      sending.value = false
    }
  }

  function reset() {
    sent.value = false
  }

  return {
    sending,
    sent,
    send,
    reset,
  }
})
