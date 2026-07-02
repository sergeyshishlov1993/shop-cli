type PromoBlockType = 'NEW' | 'HIT' | 'SEASONAL' | 'CUSTOM'

interface HeroSlide {
  id: number
  title: string
  subtitle: string | null
  buttonText: string | null
  buttonLink: string | null
  mediaFileId: number
  mediaFile: FileRecord
  mediaType: MediaType
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

interface PromoBlock {
  id: number
  type: PromoBlockType
  title: string
  isActive: boolean
  sortOrder: number
  products: {
    id: number
    sortOrder: number
    product: ProductListItem
  }[]
  createdAt: string
  updatedAt: string
}

interface PageContent {
  id: number
  slug: string
  title: string
  contentJson: Record<string, unknown> | null
  metaTitle: string | null
  metaDescription: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface StoreSettings {
  id: number
  storePhone: string | null
  storeEmail: string | null
  storeAddress: string | null
  socialLinksJson: Record<string, string> | null
  defaultLowStockThreshold: number
  currency: string
  telegramAdminChatId: string | null
  seoDefaultsJson: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
}
