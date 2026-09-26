export type ReturnStatus = 'NEW' | 'UNDER_REVIEW' | 'APPROVED' | 'RECEIVED' | 'REFUNDED' | 'REJECTED' | 'CANCELLED'
export type ReturnReason = 'WRONG_SIZE' | 'DEFECT' | 'NOT_AS_DESCRIBED' | 'CHANGED_MIND' | 'OTHER'
type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary'

export interface ReturnFile { id: number, s3Key: string, s3KeyThumb: string | null, s3KeyMedium: string | null, s3KeyLarge: string | null }
export interface ReturnItem { id: number, orderItemId: number, productName: string, sizeName: string | null, colorName: string | null, quantity: number, unitPrice: number, image: ReturnFile | null }
export interface ReturnHistoryEntry { id: number, status: ReturnStatus, comment: string | null, createdAt: string, byAdmin: boolean }
export interface ReturnSummary { id: number, number: string, status: ReturnStatus, reason: ReturnReason, createdAt: string, updatedAt: string, refundAmount: number | null, order: { id: number, orderNumber: string }, items: ReturnItem[] }
export interface ReturnCustomer { name: string, email: string | null, phone: string }
export interface ReturnDetail extends ReturnSummary {
  comment: string | null
  refundDetails: string
  trackingNumber: string | null
  managerComment: string | null
  rejectReason: string | null
  photos: ReturnFile[]
  history: ReturnHistoryEntry[]
  customer: ReturnCustomer
}
export interface ReturnEligibilityItem { orderItemId: number, productName: string, sizeName: string | null, colorName: string | null, quantity: number, returnableQty: number, unitPrice: number, image: ReturnFile | null }
export interface ReturnEligibility { eligible: boolean, reason: string | null, deadline: string | null, items: ReturnEligibilityItem[] }
export interface CreateReturnDto { orderId: number, items: Array<{ orderItemId: number, quantity: number }>, reason: ReturnReason, comment?: string, refundDetails: string, photoFileIds?: number[] }

export const returnStatusLabels: Record<ReturnStatus, string> = {
  NEW: 'Нова',
  UNDER_REVIEW: 'На розгляді',
  APPROVED: 'Схвалено — чекаємо посилку',
  RECEIVED: 'Отримано на складі',
  REFUNDED: 'Гроші повернено',
  REJECTED: 'Відхилено',
  CANCELLED: 'Скасовано',
}

export const returnStatusVariants: Record<ReturnStatus, BadgeVariant> = {
  NEW: 'info',
  UNDER_REVIEW: 'warning',
  APPROVED: 'primary',
  RECEIVED: 'primary',
  REFUNDED: 'success',
  REJECTED: 'danger',
  CANCELLED: 'secondary',
}

export const returnReasonLabels: Record<ReturnReason, string> = {
  WRONG_SIZE: 'Не підійшов розмір',
  DEFECT: 'Брак / пошкодження',
  NOT_AS_DESCRIBED: 'Не відповідає опису',
  CHANGED_MIND: 'Передумала',
  OTHER: 'Інше',
}

export const returnTransitions: Record<ReturnStatus, ReturnStatus[]> = {
  NEW: ['UNDER_REVIEW', 'REJECTED'],
  UNDER_REVIEW: ['APPROVED', 'REJECTED'],
  APPROVED: ['RECEIVED', 'REJECTED'],
  RECEIVED: ['REFUNDED', 'REJECTED', 'APPROVED'],
  REFUNDED: [],
  REJECTED: [],
  CANCELLED: [],
}

/** Linear happy path for the timeline. */
export const returnFlow: ReturnStatus[] = ['NEW', 'UNDER_REVIEW', 'APPROVED', 'RECEIVED', 'REFUNDED']
export const returnFlowLabels: Record<string, string> = { NEW: 'Подано', UNDER_REVIEW: 'На розгляді', APPROVED: 'Схвалено', RECEIVED: 'Отримано', REFUNDED: 'Гроші повернено' }

export const returnsApi = {
  list() {
    return useNuxtApp().$api<ReturnSummary[]>('/storefront/account/returns')
  },
  get(id: number) {
    return useNuxtApp().$api<ReturnDetail>(`/storefront/account/returns/${id}`)
  },
  eligibility(orderId: number) {
    return useNuxtApp().$api<ReturnEligibility>(`/storefront/account/orders/${orderId}/return-eligibility`)
  },
  create(dto: CreateReturnDto) {
    return useNuxtApp().$api<ReturnDetail>('/storefront/account/returns', { method: 'POST', body: dto })
  },
  uploadPhoto(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    return useNuxtApp().$api<{ id: number, url: string }>('/storefront/account/returns/photos', { method: 'POST', body: formData })
  },
  cancel(id: number) {
    return useNuxtApp().$api<ReturnDetail>(`/storefront/account/returns/${id}/cancel`, { method: 'POST' })
  },
  setTracking(id: number, trackingNumber: string) {
    return useNuxtApp().$api<ReturnDetail>(`/storefront/account/returns/${id}/tracking`, { method: 'PATCH', body: { trackingNumber } })
  },
}

export function getApiError(error: unknown, fallback = 'Не вдалося виконати дію') {
  const message = (error as { data?: { message?: string | string[] } })?.data?.message
  if (Array.isArray(message)) return message.join(', ')
  return message || fallback
}
