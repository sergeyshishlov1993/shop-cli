type UserRole = 'USER' | 'ADMIN'

interface FileRecord {
  id: number
  fileType: string
  originalName: string
  mimeType: string
  size: number
  s3Key: string
  s3KeyThumb: string | null
  s3KeyMedium: string | null
  s3KeyLarge: string | null
  createdAt: string
}

interface DeliveryProfile {
  id: number
  userId: number
  title: string
  recipientFirstName: string
  recipientLastName: string
  recipientPhone: string
  deliveryProvider: string
  city: string
  warehouse: string | null
  addressLine: string | null
  postalCode: string | null
  comment: string | null
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

interface User {
  id: number
  email: string
  firstName: string | null
  lastName: string | null
  phone: string | null
  role: UserRole
  isActive: boolean
  personalDiscountPercent: number
  avatarFile: FileRecord | null
  createdAt: string
  updatedAt: string
}

interface UserProfile {
  id: number
  email: string
  firstName: string | null
  lastName: string | null
  phone: string | null
  role: UserRole
  isActive: boolean
  personalDiscountPercent: number
  avatarFile: FileRecord | null
  createdAt: string
  updatedAt: string
}

interface AccountOrderSummary {
  id: number
  orderNumber: string
  date: string
  status: OrderStatus
  total: number
  itemsCount: number
  /** Contract (returns): items with product main image; optional until backend ships it. */
  items?: AccountOrderItemPreview[]
}

interface AccountOrderItemPreview {
  id: number
  productName: string
  sizeName: string | null
  colorName?: string | null
  quantity: number
  image: FileRecord | null
}
