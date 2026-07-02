export const feedbackApi = {
  create(dto: CreateFeedbackDto) {
    const { $api } = useNuxtApp()
    return $api<Feedback>('/storefront/feedback', {
      method: 'POST',
      body: dto,
    })
  },
}
