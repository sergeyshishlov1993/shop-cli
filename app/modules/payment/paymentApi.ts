// Онлайн-оплата (0.1) — метод-заглушка под будущего провайдера.
// Пока онлайн-оплата скрыта фиче-флагом, этот метод в UI не вызывается.
export const paymentApi = {
  createPayment(orderId: number) {
    const { $api } = useNuxtApp()
    return $api<PaymentInitResult>('/storefront/payments', {
      method: 'POST',
      body: { orderId },
    })
  },
}
