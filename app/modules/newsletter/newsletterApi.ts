export const newsletterApi = {
  subscribe(email: string, source?: string) {
    const { $api } = useNuxtApp()
    return $api<{ status: string }>('/storefront/newsletter/subscribe', {
      method: 'POST',
      body: { email, source },
    })
  },
  confirm(token: string) {
    const { $api } = useNuxtApp()
    return $api<{ confirmed: boolean }>('/storefront/newsletter/confirm', { params: { token } })
  },
  unsubscribe(token: string) {
    const { $api } = useNuxtApp()
    return $api<{ unsubscribed: boolean }>('/storefront/newsletter/unsubscribe', { params: { token } })
  },
}
