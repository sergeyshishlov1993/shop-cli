export interface CouponValidateResult {
  code: string
  discountType: 'PERCENT' | 'FIXED'
  discountValue: number
  discountAmount: number
}

export const couponApi = {
  validate(code: string, subtotal: number) {
    const { $api } = useNuxtApp()
    return $api<CouponValidateResult>('/storefront/coupons/validate', {
      method: 'POST',
      body: { code, subtotal },
    })
  },
}
