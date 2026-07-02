type OrderStatus = 'NEW' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED'

interface OrderItem {
  id: number
  orderId: number
  productVariantId: number | null
  productName: string
  categoryName: string | null
  productType: ProductType | null
  sku: string
  sizeName: string | null
  colorName: string | null
  salePrice: number
  purchaseCost: number
  quantity: number
  lineRevenue: number
  lineCost: number
  lineProfit: number
  createdAt: string
}

interface OrderStatusHistory {
  id: number
  orderId: number
  oldStatus: OrderStatus | null
  newStatus: OrderStatus
  note: string | null
  createdAt: string
}

interface Order {
  id: number
  orderNumber: string
  userId: number | null
  status: OrderStatus
  customerName: string
  customerPhone: string
  customerEmail: string | null
  deliveryProvider: string | null
  city: string | null
  warehouse: string | null
  addressLine: string | null
  postalCode: string | null
  deliveryComment: string | null
  subtotal: number
  discountAmount: number
  deliveryAmount: number
  totalAmount: number
  totalCost: number
  grossProfit: number
  netProfit: number
  personalDiscountPercent: number
  internalComment: string | null
  trackingNumber: string | null
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
  utmContent: string | null
  utmTerm: string | null
  referer: string | null
  idempotencyKey: string | null
  items: OrderItem[]
  statusHistory: OrderStatusHistory[]
  createdAt: string
  updatedAt: string
}

interface ReorderAddedItem {
  productName: string
  sku: string
  quantity: number
}

interface ReorderSkippedItem {
  productName: string
  sku: string
  reason: string
}

interface ReorderResponse {
  added: ReorderAddedItem[]
  skipped: ReorderSkippedItem[]
}
